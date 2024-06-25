"use strict";
// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeBrowser = exports.kDefaultLaunchArgs = exports.kDefaultWindowsDD = void 0;
const path = __importStar(require("path"));
const assert_1 = require("assert");
const UserAgentHelper_1 = require("./UserAgentHelper");
const PptrToolkit_1 = require("./PptrToolkit");
const PptrPatcher_1 = require("./PptrPatcher");
const FakeUserAction_1 = require("./FakeUserAction");
const BrowserLauncher_1 = require("./BrowserLauncher");
const BrowserBuilder_1 = require("./BrowserBuilder");
const TouchScreen_1 = require("./TouchScreen");
exports.kDefaultWindowsDD = require(path.resolve(__dirname, '../../device-hub-demo/Windows.json'));
const kBrowserMaxSurvivalTime = 60 * 1000 * 15;
const kDefaultReferers = ['https://www.google.com', 'https://www.bing.com'];
const kInternalHttpServerPort = 17311;
// chromium startup parameters
// https://peter.sh/experiments/chromium-command-line-switches/
// https://www.scrapehero.com/how-to-increase-web-scraping-speed-using-puppeteer/
// noinspection TypeScriptValidateJSTypes,SpellCheckingInspection
exports.kDefaultLaunchArgs = [
    '--no-sandbox',
    '--no-pings',
    '--no-zygote',
    '--mute-audio',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-software-rasterizer',
    '--disable-cloud-import',
    '--disable-gesture-typing',
    '--disable-setuid-sandbox',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-offer-upload-credit-cards',
    '--disable-print-preview',
    '--disable-voice-input',
    '--disable-wake-on-wifi',
    '--disable-cookie-encryption',
    '--ignore-gpu-blocklist',
    '--enable-async-dns',
    '--enable-simple-cache-backend',
    '--enable-tcp-fast-open',
    '--enable-webgl',
    '--prerender-from-omnibox=disabled',
    '--enable-web-bluetooth',
    // cannot be turned on because it will cause Chromium to ignore the certificate error
    // '--ignore-certificate-errors',
    // '--ignore-certificate-errors-spki-list',
    '--disable-site-isolation-trials',
    '--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process,TranslateUI,BlinkGenPropertyTrees',
    '--aggressive-cache-discard',
    '--disable-extensions',
    '--disable-blink-features',
    '--disable-blink-features=AutomationControlled',
    '--disable-ipc-flooding-protection',
    '--enable-features=NetworkService,NetworkServiceInProcess,TrustTokens,TrustTokensAlwaysAllowIssuance',
    '--disable-component-extensions-with-background-pages',
    '--disable-default-apps',
    '--disable-breakpad',
    '--disable-component-update',
    '--disable-domain-reliability',
    '--disable-sync',
    '--disable-client-side-phishing-detection',
    '--disable-hang-monitor',
    '--disable-popup-blocking',
    '--disable-prompt-on-repost',
    '--metrics-recording-only',
    '--safebrowsing-disable-auto-update',
    '--password-store=basic',
    '--autoplay-policy=no-user-gesture-required',
    '--use-mock-keychain',
    '--force-webrtc-ip-handling-policy=default_public_interface_only',
    '--disable-session-crashed-bubble',
    '--disable-crash-reporter',
    '--disable-dev-shm-usage',
    '--force-color-profile=srgb',
    // Cannot be turned on, as it will cause the canvas hashcode to be different from the normal browser
    // '--disable-accelerated-2d-canvas',
    '--disable-translate',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-infobars',
    '--hide-scrollbars',
    '--disable-renderer-backgrounding',
    '--font-render-hinting=none',
    '--disable-logging',
    '--use-gl=swiftshader',
    // optimze fps
    '--enable-surface-synchronization',
    '--run-all-compositor-stages-before-draw',
    '--disable-threaded-animation',
    '--disable-threaded-scrolling',
    '--disable-checker-imaging',
    '--disable-new-content-rendering-timeout',
    '--disable-image-animation-resync',
    '--disable-partial-raster',
    '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4',
    // '--deterministic-mode',                          // Some friends commented that with this parameter mouse movement is stuck, so let's comment it out
    // '--disable-web-security',
    // '--disable-cache',                               // cache
    // '--disable-application-cache',
    // '--disable-offline-load-stale-cache',
    // '--disable-gpu-shader-disk-cache',
    // '--media-cache-size=0',
    // '--disk-cache-size=0',
    // '--enable-experimental-web-platform-features',   // Make Chrome for Linux support Bluetooth. eg: navigator.bluetooth, window.BluetoothUUID
    // '--disable-gpu',                                 // Cannot be disabled: otherwise webgl will not work
    // '--disable-speech-api',                          // Cannot be disabled: some websites use speech-api as fingerprint
    // '--no-startup-window',                           // Cannot be enabled: Chrome won't open the window and puppeteer thinks it's not connected
    // '--disable-webgl',                               // Requires webgl fingerprint
    // '--disable-webgl2',
    // '--disable-notifications',                       // Cannot be disabled: notification-api not available, fingerprints will be dirty
];
// if (helper.inLinux()) {
//     kDefaultLaunchArgs.push(...[
//         '--single-process',              // Chrome does not run with single process in windows / macos, but it runs very well in linux (from Anton bro).
//     ])
// }
// Is there a friend class similar to C++ ?
// friend class BrowserLauncher
class FakeBrowser {
    // private readonly _workerUrls: string[]
    get launchParams() {
        (0, assert_1.strict)(this.driverParams.launchOptions);
        return this.driverParams;
    }
    get connectParams() {
        (0, assert_1.strict)(this.driverParams.connectOptions);
        return this.driverParams;
    }
    async beforeShutdown() {
    }
    async shutdown() {
        if (!this._zombie) {
            await this.beforeShutdown();
            this._zombie = true;
            await BrowserLauncher_1.BrowserLauncher._forceShutdown(this);
        }
        else {
            // console.warn('This instance has been shutdown and turned into a zombie.')
        }
    }
    async getActivePage() {
        const result = await PptrToolkit_1.PptrToolkit.getActivePage(this.vanillaBrowser);
        return result;
    }
    constructor(driverParams, vanillaBrowser, pptrExtra, bindingTime, uuid) {
        this.driverParams = driverParams;
        this.vanillaBrowser = vanillaBrowser;
        this.pptrExtra = pptrExtra;
        this.bindingTime = bindingTime;
        this.uuid = uuid;
        (0, assert_1.strict)(driverParams.deviceDesc
            && driverParams.deviceDesc.navigator
            && driverParams.deviceDesc.navigator.userAgent);
        this.isMobileBrowser = UserAgentHelper_1.UserAgentHelper.isMobile(driverParams.deviceDesc.navigator.userAgent);
        this.uuid = uuid;
        this.userAction = new FakeUserAction_1.FakeUserAction(this);
        this._zombie = false;
        // this._workerUrls = []
        vanillaBrowser.on('disconnected', this.onDisconnected.bind(this));
        if (!driverParams.doNotHook) {
            vanillaBrowser.on('targetcreated', this.onTargetCreated.bind(this));
        }
    }
    onDisconnected() {
        return this.shutdown();
    }
    async onTargetCreated(target) {
        // console.log('targetcreated type:', target.type(), target.url())
        const targetType = target.type();
        const worker = await target.worker();
        if (0 && worker) {
            await this.interceptWorker(worker);
        }
        else if (targetType === 'service_worker'
            || targetType === 'other' && (target.url().startsWith('http'))) {
            const cdpSession = await target.createCDPSession();
            await this.interceptTarget(target, cdpSession);
        }
        else if (targetType === 'page') {
            await this.interceptPage((await target.page()));
        }
    }
    async interceptWorker(worker) {
        (0, assert_1.strict)(!!worker);
        const injectJs = await PptrPatcher_1.PptrPatcher.evasionsCode(this);
        await worker.evaluate(injectJs);
    }
    async interceptTarget(target, client) {
        (0, assert_1.strict)(!!client);
        // TODO: Worker & SharedWorker does not work with this way
        // console.log('intercept', target.url())
        const injectJs = await PptrPatcher_1.PptrPatcher.evasionsCode(this);
        await client.send('Runtime.evaluate', {
            expression: injectJs,
        });
    }
    async interceptPage(page) {
        // console.log('inject page')
        let cdpSession = null;
        const fakeDD = this.driverParams.fakeDeviceDesc;
        (0, assert_1.strict)(fakeDD);
        // if there is an account password that proxy needs to log in
        if (this.driverParams.proxy &&
            this.driverParams.proxy.username &&
            this.driverParams.proxy.password) {
            await page.authenticate({
                username: this.driverParams.proxy.username,
                password: this.driverParams.proxy.password,
            });
        }
        // cdp
        try {
            await page['_client']().send('ServiceWorker.setForceUpdateOnPageLoad', { forceUpdateOnPageLoad: true });
        }
        catch (ex) {
            console.warn('CDP ServiceWorker.setForceUpdateOnPageLoad exception', ex);
        }
        // touch
        if (this.isMobileBrowser) {
            try {
                await page['_client']().send('Emulation.setEmitTouchEventsForMouse', {
                    enabled: true,
                });
            }
            catch (ex) {
                console.warn('CDP Emulation.setEmitTouchEventsForMouse exception', ex);
            }
            Object.defineProperty(page, '_patchTouchscreen', {
                value: new TouchScreen_1.Touchscreen(page['_client'](), page.keyboard),
            });
        }
        // intercept worker
        // const target = page.target()
        // cdpSession = await target.createCDPSession()
        // await this.interceptWorker(target, cdpSession);
        //
        // page.on('workercreated', (worker: WebWorker) => {
        //     console.log(`worker created ${worker.url()}`)
        //     this._workerUrls.push(worker.url())
        // })
        //
        // page.on('workerdestroyed', async (worker: WebWorker) => {
        //     console.log(`worker destroyed ${worker.url()}`)
        // })
        // set additional request headers
        // read version from the launched browser
        const ua = await this.vanillaBrowser.userAgent();
        const chromeMajorVersion = UserAgentHelper_1.UserAgentHelper.chromeMajorVersion(ua);
        const os = UserAgentHelper_1.UserAgentHelper.os(fakeDD.navigator.userAgent);
        (0, assert_1.strict)(chromeMajorVersion);
        (0, assert_1.strict)(os);
        await page.setUserAgent(fakeDD.navigator.userAgent);
        await page.setViewport({
            width: fakeDD.window.innerWidth,
            height: fakeDD.window.innerHeight,
            isMobile: UserAgentHelper_1.UserAgentHelper.isMobile(fakeDD.navigator.userAgent),
            hasTouch: fakeDD.navigator.maxTouchPoints > 0,
            deviceScaleFactor: fakeDD.window.devicePixelRatio,
        });
        return { page, cdpSession };
    }
    async _patchPages0Bug() {
        return;
        // pages[0] keeps failing to hook effectively
        // But I can't close it, because in windows, closing this page will cause the whole browser to close
        // So I can only make it inaccessible to users
        const abandonedPageTargetIds = [];
        const pages = await this.vanillaBrowser.pages();
        if (pages.length > 0) {
            abandonedPageTargetIds.push(...pages.map(e => e.target()['_targetId']));
        }
        const pagesFn = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.vanillaBrowser), 'pages').value.bind(this.vanillaBrowser);
        Object.defineProperty(Object.getPrototypeOf(this.vanillaBrowser), 'pages', {
            value: new Proxy(this.vanillaBrowser.pages, {
                async apply(target, thisArg, args) {
                    let pages = await pagesFn();
                    // Maybe browser is created based on connect, with different instances
                    // so can only compare TargetId
                    pages = pages.filter(e => !abandonedPageTargetIds.includes(e.target()['_targetId']));
                    return pages;
                },
            }),
        });
    }
}
exports.FakeBrowser = FakeBrowser;
FakeBrowser.Builder = BrowserBuilder_1.BrowserBuilder;
FakeBrowser.globalConfig = {
    defaultBrowserMaxSurvivalTime: kBrowserMaxSurvivalTime,
    defaultReferers: kDefaultReferers,
    internalHttpServerPort: kInternalHttpServerPort,
    defaultLaunchArgs: exports.kDefaultLaunchArgs,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFrZUJyb3dzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9GYWtlQnJvd3Nlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMERBQTBEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUUxRCwyQ0FBNkI7QUFDN0IsbUNBQTBDO0FBSzFDLHVEQUFvRDtBQUNwRCwrQ0FBNEM7QUFFNUMsK0NBQTRDO0FBQzVDLHFEQUFrRDtBQUNsRCx1REFBb0Q7QUFDcEQscURBQWtEO0FBQ2xELCtDQUE0QztBQUUvQixRQUFBLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDLENBQUE7QUFFdkcsTUFBTSx1QkFBdUIsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUM5QyxNQUFNLGdCQUFnQixHQUFHLENBQUMsd0JBQXdCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtBQUMzRSxNQUFNLHVCQUF1QixHQUFHLEtBQUssQ0FBQTtBQUVyQyw4QkFBOEI7QUFDOUIsK0RBQStEO0FBQy9ELGlGQUFpRjtBQUNqRixpRUFBaUU7QUFDcEQsUUFBQSxrQkFBa0IsR0FBRztJQUM5QixjQUFjO0lBQ2QsWUFBWTtJQUNaLGFBQWE7SUFDYixjQUFjO0lBQ2QsZ0JBQWdCO0lBQ2hCLDRCQUE0QjtJQUM1QiwrQkFBK0I7SUFDL0Isd0JBQXdCO0lBQ3hCLDBCQUEwQjtJQUMxQiwwQkFBMEI7SUFDMUIsNkNBQTZDO0lBQzdDLHFDQUFxQztJQUNyQyx5QkFBeUI7SUFDekIsdUJBQXVCO0lBQ3ZCLHdCQUF3QjtJQUN4Qiw2QkFBNkI7SUFDN0Isd0JBQXdCO0lBQ3hCLG9CQUFvQjtJQUNwQiwrQkFBK0I7SUFDL0Isd0JBQXdCO0lBQ3hCLGdCQUFnQjtJQUNoQixtQ0FBbUM7SUFDbkMsd0JBQXdCO0lBQ3hCLHFGQUFxRjtJQUNyRixpQ0FBaUM7SUFDakMsMkNB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