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
exports.kDefaultLaunchOptions = exports.kDefaultTimeout = void 0;
const assert_1 = require("assert");
const fs = __importStar(require("fs-extra"));
const puppeteer_extra_1 = require("puppeteer-extra");
const DeviceDescriptor_js_1 = __importDefault(require("./DeviceDescriptor.js"));
const UserAgentHelper_js_1 = require("./UserAgentHelper.js");
const PptrPatcher_1 = require("./PptrPatcher");
exports.kDefaultTimeout = 15 * 1000;
exports.kDefaultLaunchOptions = {
    headless: true,
    devtools: false,
    timeout: exports.kDefaultTimeout,
};
class Driver {
    static checkParamsLegal(params) {
        // deviceDesc must be set
        const dd = params.deviceDesc;
        (0, assert_1.strict)(dd, 'deviceDesc must be set');
        DeviceDescriptor_js_1.default.checkLegal(dd);
        // user data dir
        // The userDataDir in launchParameters must be set
        (0, assert_1.strict)(params.userDataDir, 'userDataDir must be set');
    }
    /**
     * Connect to browser
     * @param uuid
     * @param params
     */
    static async connect(uuid, params) {
        // Different instances with different puppeteer configurations
        const pptr = (0, puppeteer_extra_1.addExtra)(require('puppeteer'));
        // patch with evasions
        if (!params.doNotHook) {
            await PptrPatcher_1.PptrPatcher.patch(uuid, pptr, params);
        }
        const fakeDD = params.fakeDeviceDesc;
        (0, assert_1.strict)(!!fakeDD);
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
            params.launchOptions = exports.kDefaultLaunchOptions;
        }
        this.patchLaunchArgs(defaultLaunchArgs, params);
        // Different instances with different puppeteer configurations
        const pptr = (0, puppeteer_extra_1.addExtra)(require('puppeteer'));
        // patch with evasions
        if (!params.doNotHook) {
            await PptrPatcher_1.PptrPatcher.patch(uuid, pptr, params);
        }
        const fakeDD = params.fakeDeviceDesc;
        (0, assert_1.strict)(!!fakeDD);
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
        const orgVersion = UserAgentHelper_js_1.UserAgentHelper.chromeVersion(orgUA);
        const fakeVersion = UserAgentHelper_js_1.UserAgentHelper.chromeVersion(fakeDD.navigator.userAgent);
        (0, assert_1.strict)(orgVersion);
        (0, assert_1.strict)(fakeVersion);
        fakeDD.navigator.userAgent = fakeDD.navigator.userAgent.replace(fakeVersion, orgVersion);
        fakeDD.navigator.appVersion = fakeDD.navigator.appVersion.replace(fakeVersion, orgVersion);
    }
    static patchLaunchArgs(defaultLaunchArgs, launchParams) {
        // args
        // noinspection SuspiciousTypeOfGuard
        (0, assert_1.strict)(defaultLaunchArgs instanceof Array);
        const args = [
            ...defaultLaunchArgs,
            ...(launchParams.launchOptions.args || []),
        ];
        const fakeDD = launchParams.fakeDeviceDesc;
        (0, assert_1.strict)(!!fakeDD);
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
                isMobile: UserAgentHelper_js_1.UserAgentHelper.isMobile(fakeDD.navigator.userAgent),
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
        (0, assert_1.strict)(fakeDD.acceptLanguage);
        args.push(`--lang=${fakeDD.acceptLanguage}`);
        const userDataDir = launchParams.userDataDir;
        (0, assert_1.strict)(userDataDir);
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
exports.default = Driver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvcmUvRHJpdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXlDO0FBQ3pDLDZDQUE4QjtBQUU5QixxREFBZ0Y7QUFHaEYsZ0ZBQXNHO0FBQ3RHLDZEQUFzRDtBQUN0RCwrQ0FBMkM7QUFtQzlCLFFBQUEsZUFBZSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUE7QUFFM0IsUUFBQSxxQkFBcUIsR0FBRztJQUNqQyxRQUFRLEVBQUUsSUFBSTtJQUNkLFFBQVEsRUFBRSxLQUFLO0lBQ2YsT0FBTyxFQUFFLHVCQUFlO0NBQzNCLENBQUE7QUFFRCxNQUFxQixNQUFNO0lBRWYsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQXdCO1FBQ3BELHlCQUF5QjtRQUN6QixNQUFNLEVBQUUsR0FBcUIsTUFBTSxDQUFDLFVBQVUsQ0FBQTtRQUM5QyxJQUFBLGVBQU0sRUFBQyxFQUFFLEVBQUUsd0JBQXdCLENBQUMsQ0FBQTtRQUVwQyw2QkFBc0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUE7UUFFckMsZ0JBQWdCO1FBQ2hCLGtEQUFrRDtRQUNsRCxJQUFBLGVBQU0sRUFBQyxNQUFNLENBQUMsV0FBVyxFQUFFLHlCQUF5QixDQUFDLENBQUE7SUFDekQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FDaEIsSUFBWSxFQUNaLE1BQXlCO1FBS3pCLDhEQUE4RDtRQUM5RCxNQUFNLElBQUksR0FBRyxJQUFBLDBCQUFRLEVBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUE7UUFFM0Msc0JBQXNCO1FBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFO1lBQ25CLE1BQU0seUJBQVcsQ0FBQyxLQUFLLENBQ25CLElBQUksRUFDSixJQUFJLEVBQ0osTUFBTSxDQUNU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