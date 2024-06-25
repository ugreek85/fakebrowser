import * as fs from 'fs-extra';
import * as path from 'path';
import * as URLToolkit from 'url-toolkit';
import * as http from 'http';
import * as url from 'url';
import axios from 'axios';
import { Agent } from 'https';
import { strict as assert } from 'assert';
import Driver from './Driver.js';
import DeviceDescriptorHelper from './DeviceDescriptor.js';
import { PptrPatcher } from './PptrPatcher';
import { FakeBrowser } from './FakeBrowser';
const kFakeDDFileName = '__fakebrowser_fakeDD.json';
const kInternalHttpServerHeartbeatMagic = '__fakebrowser__&88ff22--';
export class BrowserLauncher {
    static checkLaunchOptionsLegal(options) {
        if (!options || !options.args || !options.args.length) {
            return;
        }
        // These args are set by FakeBrowser and cannot be set externally:
        const externalCannotSetArgs = [
            '--user-data-dir',
            '--lang',
            '--window-position',
            '--window-size',
        ];
        if (options.args.filter(e => externalCannotSetArgs.includes(e.toLocaleLowerCase().split('=')[0])).length > 0) {
            throw new TypeError(`${externalCannotSetArgs} cannot be set in options.args`);
        }
    }
    static prepareFakeDeviceDesc(params) {
        // Go to the userDataDir specified by the user and read the __fakebrowser_fakeDD.json file
        // or create it if it does not exist.
        const userDataDir = params.userDataDir;
        assert(userDataDir);
        if (!fs.existsSync(userDataDir)) {
            // may throw
            fs.mkdirSync(userDataDir, { recursive: true });
        }
        // Read from existing files, or generate if not available.
        const fakeDDPathName = path.resolve(userDataDir, `./${kFakeDDFileName}`);
        let tempFakeDD = null;
        try {
            tempFakeDD = (fs.existsSync(fakeDDPathName)
                ? fs.readJsonSync(fakeDDPathName)
                : params.deviceDesc);
            DeviceDescriptorHelper.checkLegal(tempFakeDD);
        }
        catch (ex) {
            console.warn('FakeDD illegal');
            // It is possible that some fields are missing due to the deviceDesc update and need to recreate fakeDD
            const orgTempFakeDD = tempFakeDD;
            tempFakeDD = params.deviceDesc;
            if (orgTempFakeDD) {
                tempFakeDD.fontSalt = orgTempFakeDD.fontSalt;
                tempFakeDD.canvasSalt = orgTempFakeDD.canvasSalt;
            }
        }
        const { fakeDeviceDesc, needsUpdate, } = DeviceDescriptorHelper.buildFakeDeviceDescriptor(tempFakeDD);
        if (needsUpdate) {
            fs.writeJsonSync(fakeDDPathName, fakeDeviceDesc, { spaces: 2 });
        }
        params.fakeDeviceDesc = fakeDeviceDesc;
    }
    static async connect(params) {
        await this.bootInternalHTTPServer();
        this.prepareFakeDeviceDesc(params);
        assert(params.fakeDeviceDesc);
        const uuid = DeviceDescriptorHelper.deviceUUID(params.fakeDeviceDesc);
        const { vanillaBrowser, pptrExtra, } = await Driver.connect(uuid, params);
        const launchTime = new Date().getTime();
        const fb = new FakeBrowser(params, vanillaBrowser, pptrExtra, launchTime, uuid);
        // pages 0 cannot be hook, lets drop it
        await fb._patchPages0Bug();
        return fb;
    }
    static async launch(params) {
        this.bootBrowserSurvivalChecker();
        await this.bootInternalHTTPServer();
        // deviceDesc, userDataDir cannot be empty
        this.checkLaunchOptionsLegal(params.launchOptions);
        this.prepareFakeDeviceDesc(params);
        assert(params.fakeDeviceDesc);
        const uuid = DeviceDescriptorHelper.deviceUUID(params.fakeDeviceDesc);
        const { vanillaBrowser, pptrExtra, } = await Driver.launch(uuid, FakeBrowser.globalConfig.defaultLaunchArgs, params);
        const launchTime = new Date().getTime();
        const fb = new FakeBrowser(params, vanillaBrowser, pptrExtra, launchTime, uuid);
        // pages 0 cannot be hook, lets drop it
        await fb._patchPages0Bug();
        // Manage surviving browsers and kill them if they time out
        this._fakeBrowserInstances.push(fb);
        return fb;
    }
    static async bootInternalHTTPServer() {
        if (!this._httpServer) {
            this._httpServer = http.createServer();
            this._httpServer.on('request', async (req, res) => {
                assert(req.url);
                const { query, pathname } = url.parse(req.url, true);
                if (pathname === '/hb') {
                    res.write(kInternalHttpServerHeartbeatMagic);
                    res.end();
                }
                if (pathname === '/patchWorker') {
                    const relUrl = query['relUrl'];
                    const workerUrl = query['workerUrl'];
                    const uuid = query['uuid'];
                    const fullUrl = URLToolkit.buildAbsoluteURL(relUrl, workerUrl);
                    console.log('request worker content from: ', fullUrl);
                    // Object.fromEntries ES2019
                    const reqHeaders = Object.fromEntries(Object.entries(req.headers).map(e => ([e[0], e[1][0]])));
                    delete reqHeaders['host'];
                    // TODO: get through proxy
                    const jsResp = await axios.get(fullUrl, {
                        headers: reqHeaders,
                        httpsAgent: new Agent({
                            rejectUnauthorized: false,
                        }),
                    });
                    let jsContent = jsResp.data;
                    const browser = BrowserLauncher.getBrowserWithUUID(uuid);
                    if (browser) {
                        jsContent = await PptrPatcher.patchWorkerJsContent(browser, jsContent);
                    }
                    const respHeaders = jsResp.headers;
                    delete respHeaders['content-length'];
                    res.writeHead(jsResp.status, jsResp.statusText, respHeaders);
                    res.write(jsContent);
                    res.end();
                }
            });
            // If the port listens to errors, determine if the heartbeat interface is successful
            try {
                this._httpServer.listen(FakeBrowser.globalConfig.internalHttpServerPort);
            }
            catch (ex) {
                const hbUrl = `http://127.0.0.1:${FakeBrowser.globalConfig.internalHttpServerPort}/hb`;
                try {
                    const hbData = (await axios.get(hbUrl)).data;
                    if (hbData === kInternalHttpServerHeartbeatMagic) {
                        try {
                            this._httpServer.close();
                        }
                        finally {
                            this._httpServer = null;
                        }
                        return;
                    }
                }
                catch (ignore) {
                }
                throw ex;
            }
        }
    }
    static bootBrowserSurvivalChecker() {
        if (!this._checkerIntervalId) {
            this._checkerIntervalId = setInterval(async () => {
                const killThese = this._fakeBrowserInstances.filter(e => (e.launchParams.maxSurvivalTime > 0)
                    && (new Date().getTime() > e.bindingTime + e.launchParams.maxSurvivalTime));
                const p = [];
                for (const fb of killThese) {
                    p.push(fb.shutdown());
                }
                await Promise.all(p);
            }, 5 * 1000);
        }
    }
    static getBrowserWithUUID(uuid) {
        return this._fakeBrowserInstances.find(e => e.uuid === uuid);
    }
    static async _forceShutdown(fb) {
        await Driver.shutdown(fb.vanillaBrowser);
        const browserIndex = this._fakeBrowserInstances.indexOf(fb);
        assert(browserIndex >= 0);
        this._fakeBrowserInstances.splice(browserIndex, 1);
        // If all browsers have exited, close internal http service
        if (this._fakeBrowserInstances.length === 0) {
            // console.log('close appserver')
            if (this._httpServer) {
                try {
                    this._httpServer.close();
                }
                finally {
                    this._httpServer = null;
                }
            }
        }
    }
}
BrowserLauncher._fakeBrowserInstances = [];
BrowserLauncher._checkerIntervalId = null;
BrowserLauncher._httpServer = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvd3NlckxhdW5jaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvcmUvQnJvd3NlckxhdW5jaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQzlCLE9BQU8sS0FBSyxJQUFJLE1BQU0sTUFBTSxDQUFBO0FBQzVCLE9BQU8sS0FBSyxVQUFVLE1BQU0sYUFBYSxDQUFBO0FBQ3pDLE9BQU8sS0FBSyxJQUFJLE1BQU0sTUFBTSxDQUFBO0FBRTVCLE9BQU8sS0FBSyxHQUFHLE1BQU0sS0FBSyxDQUFBO0FBRTFCLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sT0FBTyxDQUFBO0FBQzNCLE9BQU8sRUFBQyxNQUFNLElBQUksTUFBTSxFQUFDLE1BQU0sUUFBUSxDQUFBO0FBRXZDLE9BQU8sTUFBcUYsTUFBTSxhQUFhLENBQUE7QUFDL0csT0FBTyxzQkFBOEMsTUFBTSx1QkFBdUIsQ0FBQTtBQUNsRixPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFBO0FBQ3pDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxlQUFlLENBQUE7QUFFekMsTUFBTSxlQUFlLEdBQUcsMkJBQTJCLENBQUE7QUFDbkQsTUFBTSxpQ0FBaUMsR0FBRywwQkFBMEIsQ0FBQTtBQUVwRSxNQUFNLE9BQU8sZUFBZTtJQU1oQixNQUFNLENBQUMsdUJBQXVCLENBQUMsT0FBOEI7UUFDakUsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNuRCxPQUFNO1NBQ1Q7UUFFRCxrRUFBa0U7UUFDbEUsTUFBTSxxQkFBcUIsR0FBRztZQUMxQixpQkFBaUI7WUFDakIsUUFBUTtZQUNSLG1CQUFtQjtZQUNuQixlQUFlO1NBQ2xCLENBQUE7UUFF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