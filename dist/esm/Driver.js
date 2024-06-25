import { strict as assert } from 'assert';
import * as fs from 'fs-extra';
import { addExtra } from 'puppeteer-extra';
import DeviceDescriptorHelper from './DeviceDescriptor.js';
import { UserAgentHelper } from './UserAgentHelper.js';
import { PptrPatcher } from './PptrPatcher';
export const kDefaultTimeout = 15 * 1000;
export const kDefaultLaunchOptions = {
    headless: true,
    devtools: false,
    timeout: kDefaultTimeout,
};
export default class Driver {
    static checkParamsLegal(params) {
        // deviceDesc must be set
        const dd = params.deviceDesc;
        assert(dd, 'deviceDesc must be set');
        DeviceDescriptorHelper.checkLegal(dd);
        // user data dir
        // The userDataDir in launchParameters must be set
        assert(params.userDataDir, 'userDataDir must be set');
    }
    /**
     * Connect to browser
     * @param uuid
     * @param params
     */
    static async connect(uuid, params) {
        // Different instances with different puppeteer configurations
        const pptr = addExtra(require('puppeteer'));
        // patch with evasions
        if (!params.doNotHook) {
            await PptrPatcher.patch(uuid, pptr, params);
        }
        const fakeDD = params.fakeDeviceDesc;
        assert(!!fakeDD);
        const browser = await pptr.connect(params.connectOptions);
        await this.patchUAFromLaunchedBrowser(browser, fakeDD);
        return {
            vanillaBrowser: browser,
            pptrExtra: pptr,
        };
    }
    /**
     * Launch browser
     * @param uuid
     * @param defaultLaunchArgs
     * @param params
     */
    static async launch(uuid, defaultLaunchArgs, params) {
        this.checkParamsLegal(params);
        if (!params.launchOptions
            || Object.keys(params.launchOptions).length === 0) {
            params.launchOptions = kDefaultLaunchOptions;
        }
        this.patchLaunchArgs(defaultLaunchArgs, params);
        // Different instances with different puppeteer configurations
        const pptr = addExtra(require('puppeteer'));
        // patch with evasions
        if (!params.doNotHook) {
            await PptrPatcher.patch(uuid, pptr, params);
        }
        const fakeDD = params.fakeDeviceDesc;
        assert(!!fakeDD);
        const browser = await pptr.launch(params.launchOptions);
        await this.patchUAFromLaunchedBrowser(browser, fakeDD);
        return {
            vanillaBrowser: browser,
            pptrExtra: pptr,
        };
    }
    static async patchUAFromLaunchedBrowser(browser, fakeDD) {
        // read major version from the launched browser and replace dd.userAgent
        const orgUA = await browser.userAgent();
        const orgVersion = UserAgentHelper.chromeVersion(orgUA);
        const fakeVersion = UserAgentHelper.chromeVersion(fakeDD.navigator.userAgent);
        assert(orgVersion);
        assert(fakeVersion);
        fakeDD.navigator.userAgent = fakeDD.navigator.userAgent.replace(fakeVersion, orgVersion);
        fakeDD.navigator.appVersion = fakeDD.navigator.appVersion.replace(fakeVersion, orgVersion);
    }
    static patchLaunchArgs(defaultLaunchArgs, launchParams) {
        // args
        // noinspection SuspiciousTypeOfGuard
        assert(defaultLaunchArgs instanceof Array);
        const args = [
            ...defaultLaunchArgs,
            ...(launchParams.launchOptions.args || []),
        ];
        const fakeDD = launchParams.fakeDeviceDesc;
        assert(!!fakeDD);
        // Modify default options
        launchParams.launchOptions = {
            ignoreHTTPSErrors: true,
            ignoreDefaultArgs: [
                '--enable-automation',
                '--enable-blink-features=IdleDetection',
            ],
            handleSIGINT: false,
            handleSIGTERM: false,
            handleSIGHUP: false,
            pipe: true,
            defaultViewport: {
                width: fakeDD.window.innerWidth,
                height: fakeDD.window.innerHeight,
                deviceScaleFactor: fakeDD.window.devicePixelRatio,
                isMobile: UserAgentHelper.isMobile(fakeDD.navigator.userAgent),
                hasTouch: fakeDD.navigator.maxTouchPoints > 0,
                isLandscape: false,
            },
            ...launchParams.launchOptions,
            args,
        };
        // headless
        let headless = launchParams.launchOptions.headless;
        if ('undefined' === typeof headless) {
            headless = true;
        }
        if (launchParams.launchOptions.devtools) {
            headless = false;
        }
        // proxy
        if (launchParams.proxy) {
            args.push(`--proxy-server=${launchParams.proxy.proxy}`);
        }
        // browser language
        assert(fakeDD.acceptLanguage);
        args.push(`--lang=${fakeDD.acceptLanguage}`);
        const userDataDir = launchParams.userDataDir;
        assert(userDataDir);
        fs.mkdirSync(userDataDir, { recursive: true }); // throw exception
        args.push(`--user-data-dir=${userDataDir}`);
        // window position & window size
        let { screenX, screenY, innerWidth, innerHeight, outerWidth, outerHeight, } = fakeDD.window;
        outerWidth = outerWidth || innerWidth;
        outerHeight = outerHeight || (innerHeight + 85);
        args.push(`--window-position=${screenX},${screenY}`, `--window-size=${outerWidth},${outerHeight}`);
        // Some options can only be used in headless.
        // If you use them again in headful, you will see a plain white browser window without any content.
        if (headless) {
            args.push('--in-process-gpu', // https://source.chromium.org/search?q=lang:cpp+symbol:kInProcessGPU&ss=chromium
            '--disable-canvas-aa', // Disable antialiasing on 2d canvas
            '--disable-2d-canvas-clip-aa', // Disable antialiasing on 2d canvas clips
            '--disable-gl-drawing-for-tests');
        }
    }
    static async getPids(pid) {
        if ('string' === typeof (pid)) {
            pid = parseInt(pid);
        }
        try {
            const pidtree = require('pidtree');
            const pids = await pidtree(pid);
            return pids.includes(pid) ? pids : [...pids, pid];
        }
        catch (ignored) {
            return [pid];
        }
    }
    /**
     * Shutdown browser
     * @param browser
     */
    static async shutdown(browser) {
        try {
            const pages = await browser.pages();
            for (const page of pages) {
                await page.close();
            }
        }
        catch (ignored) {
        }
        const browserProcess = browser.process();
        if (browserProcess) {
            const pid = browserProcess.pid;
            if (pid) {
                const pids = await this.getPids(pid);
                pids.forEach(pid => {
                    try {
                        process.kill(pid, 'SIGKILL');
                    }
                    catch (ignored) {
                    }
                });
            }
        }
        try {
            await browser.close();
        }
        catch (ignored) {
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvcmUvRHJpdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLElBQUksTUFBTSxFQUFFLE1BQU0sUUFBUSxDQUFBO0FBQ3pDLE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBRTlCLE9BQU8sRUFBRSxRQUFRLEVBQXdDLE1BQU0saUJBQWlCLENBQUE7QUFHaEYsT0FBTyxzQkFBa0UsTUFBTSx1QkFBdUIsQ0FBQTtBQUN0RyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFDdEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQW1DM0MsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUE7QUFFeEMsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUc7SUFDakMsUUFBUSxFQUFFLElBQUk7SUFDZCxRQUFRLEVBQUUsS0FBSztJQUNmLE9BQU8sRUFBRSxlQUFlO0NBQzNCLENBQUE7QUFFRCxNQUFNLENBQUMsT0FBTyxPQUFPLE1BQU07SUFFZixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBd0I7UUFDcEQseUJBQXlCO1FBQ3pCLE1BQU0sRUFBRSxHQUFxQixNQUFNLENBQUMsVUFBVSxDQUFBO1FBQzlDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsd0JBQXdCLENBQUMsQ0FBQTtRQUVwQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUE7UUFFckMsZ0JBQWdCO1FBQ2hCLGtEQUFrRDtRQUNsRCxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSx5QkFBeUIsQ0FBQyxDQUFBO0lBQ3pELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQ2hCLElBQVksRUFDWixNQUF5QjtRQUt6Qiw4REFBOEQ7UUFDOUQsTUFBTSxJ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