"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserLauncher = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const URLToolkit = __importStar(require("url-toolkit"));
const http = __importStar(require("http"));
const url = __importStar(require("url"));
const axios_1 = __importDefault(require("axios"));
const https_1 = require("https");
const assert_1 = require("assert");
const Driver_js_1 = __importDefault(require("./Driver.js"));
const DeviceDescriptor_js_1 = __importDefault(require("./DeviceDescriptor.js"));
const PptrPatcher_1 = require("./PptrPatcher");
const FakeBrowser_1 = require("./FakeBrowser");
const kFakeDDFileName = '__fakebrowser_fakeDD.json';
const kInternalHttpServerHeartbeatMagic = '__fakebrowser__&88ff22--';
class BrowserLauncher {
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
        (0, assert_1.strict)(userDataDir);
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
            DeviceDescriptor_js_1.default.checkLegal(tempFakeDD);
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
        const { fakeDeviceDesc, needsUpdate, } = DeviceDescriptor_js_1.default.buildFakeDeviceDescriptor(tempFakeDD);
        if (needsUpdate) {
            fs.writeJsonSync(fakeDDPathName, fakeDeviceDesc, { spaces: 2 });
        }
        params.fakeDeviceDesc = fakeDeviceDesc;
    }
    static async connect(params) {
        await this.bootInternalHTTPServer();
        this.prepareFakeDeviceDesc(params);
        (0, assert_1.strict)(params.fakeDeviceDesc);
        const uuid = DeviceDescriptor_js_1.default.deviceUUID(params.fakeDeviceDesc);
        const { vanillaBrowser, pptrExtra, } = await Driver_js_1.default.connect(uuid, params);
        const launchTime = new Date().getTime();
        const fb = new FakeBrowser_1.FakeBrowser(params, vanillaBrowser, pptrExtra, launchTime, uuid);
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
        (0, assert_1.strict)(params.fakeDeviceDesc);
        const uuid = DeviceDescriptor_js_1.default.deviceUUID(params.fakeDeviceDesc);
        const { vanillaBrowser, pptrExtra, } = await Driver_js_1.default.launch(uuid, FakeBrowser_1.FakeBrowser.globalConfig.defaultLaunchArgs, params);
        const launchTime = new Date().getTime();
        const fb = new FakeBrowser_1.FakeBrowser(params, vanillaBrowser, pptrExtra, launchTime, uuid);
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
                (0, assert_1.strict)(req.url);
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
                    const jsResp = await axios_1.default.get(fullUrl, {
                        headers: reqHeaders,
                        httpsAgent: new https_1.Agent({
                            rejectUnauthorized: false,
                        }),
                    });
                    let jsContent = jsResp.data;
                    const browser = BrowserLauncher.getBrowserWithUUID(uuid);
                    if (browser) {
                        jsContent = await PptrPatcher_1.PptrPatcher.patchWorkerJsContent(browser, jsContent);
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
                this._httpServer.listen(FakeBrowser_1.FakeBrowser.globalConfig.internalHttpServerPort);
            }
            catch (ex) {
                const hbUrl = `http://127.0.0.1:${FakeBrowser_1.FakeBrowser.globalConfig.internalHttpServerPort}/hb`;
                try {
                    const hbData = (await axios_1.default.get(hbUrl)).data;
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
        await Driver_js_1.default.shutdown(fb.vanillaBrowser);
        const browserIndex = this._fakeBrowserInstances.indexOf(fb);
        (0, assert_1.strict)(browserIndex >= 0);
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
exports.BrowserLauncher = BrowserLauncher;
BrowserLauncher._fakeBrowserInstances = [];
BrowserLauncher._checkerIntervalId = null;
BrowserLauncher._httpServer = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvd3NlckxhdW5jaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvcmUvQnJvd3NlckxhdW5jaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQThCO0FBQzlCLDJDQUE0QjtBQUM1Qix3REFBeUM7QUFDekMsMkNBQTRCO0FBRTVCLHlDQUEwQjtBQUUxQixrREFBeUI7QUFDekIsaUNBQTJCO0FBQzNCLG1DQUF1QztBQUV2Qyw0REFBK0c7QUFDL0csZ0ZBQWtGO0FBQ2xGLCtDQUF5QztBQUN6QywrQ0FBeUM7QUFFekMsTUFBTSxlQUFlLEdBQUcsMkJBQTJCLENBQUE7QUFDbkQsTUFBTSxpQ0FBaUMsR0FBRywwQkFBMEIsQ0FBQTtBQUVwRSxNQUFhLGVBQWU7SUFNaEIsTUFBTSxDQUFDLHVCQUF1QixDQUFDLE9BQThCO1FBQ2pFLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDbkQsT0FBTTtTQUNUO1FBRUQsa0VBQWtFO1FBQ2xFLE1BQU0scUJBQXFCLEdBQUc7WUFDMUIsaUJBQWlCO1lBQ2pCLFFBQVE7WUFDUixtQkFBbUI7WUFDbkIsZUFBZTtTQUNsQixDQUFBO1FBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FDbkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQzNFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNWLE1BQU0sSUFBSSxTQUFTLENBQUMsR0FBRyxxQkFBcUIsZ0NBQWdDLENBQUMsQ0FBQTtTQUNoRjtJQUNMLENBQUM7SUFFTyxNQUFNLENBQUMscUJBQXFCLENB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