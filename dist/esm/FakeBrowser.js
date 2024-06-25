// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
import * as path from 'path';
import { strict as assert } from 'assert';
import { UserAgentHelper } from './UserAgentHelper';
import { PptrToolkit } from './PptrToolkit';
import { PptrPatcher } from './PptrPatcher';
import { FakeUserAction } from './FakeUserAction';
import { BrowserLauncher } from './BrowserLauncher';
import { BrowserBuilder } from './BrowserBuilder';
import { Touchscreen } from './TouchScreen';
export const kDefaultWindowsDD = require(path.resolve(__dirname, '../../device-hub-demo/Windows.json'));
const kBrowserMaxSurvivalTime = 60 * 1000 * 15;
const kDefaultReferers = ['https://www.google.com', 'https://www.bing.com'];
const kInternalHttpServerPort = 17311;
// chromium startup parameters
// https://peter.sh/experiments/chromium-command-line-switches/
// https://www.scrapehero.com/how-to-increase-web-scraping-speed-using-puppeteer/
// noinspection TypeScriptValidateJSTypes,SpellCheckingInspection
export const kDefaultLaunchArgs = [
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
export class FakeBrowser {
    // private readonly _workerUrls: string[]
    get launchParams() {
        assert(this.driverParams.launchOptions);
        return this.driverParams;
    }
    get connectParams() {
        assert(this.driverParams.connectOptions);
        return this.driverParams;
    }
    async beforeShutdown() {
    }
    async shutdown() {
        if (!this._zombie) {
            await this.beforeShutdown();
            this._zombie = true;
            await BrowserLauncher._forceShutdown(this);
        }
        else {
            // console.warn('This instance has been shutdown and turned into a zombie.')
        }
    }
    async getActivePage() {
        const result = await PptrToolkit.getActivePage(this.vanillaBrowser);
        return result;
    }
    constructor(driverParams, vanillaBrowser, pptrExtra, bindingTime, uuid) {
        this.driverParams = driverParams;
        this.vanillaBrowser = vanillaBrowser;
        this.pptrExtra = pptrExtra;
        this.bindingTime = bindingTime;
        this.uuid = uuid;
        assert(driverParams.deviceDesc
            && driverParams.deviceDesc.navigator
            && driverParams.deviceDesc.navigator.userAgent);
        this.isMobileBrowser = UserAgentHelper.isMobile(driverParams.deviceDesc.navigator.userAgent);
        this.uuid = uuid;
        this.userAction = new FakeUserAction(this);
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
        assert(!!worker);
        const injectJs = await PptrPatcher.evasionsCode(this);
        await worker.evaluate(injectJs);
    }
    async interceptTarget(target, client) {
        assert(!!client);
        // TODO: Worker & SharedWorker does not work with this way
        // console.log('intercept', target.url())
        const injectJs = await PptrPatcher.evasionsCode(this);
        await client.send('Runtime.evaluate', {
            expression: injectJs,
        });
    }
    async interceptPage(page) {
        // console.log('inject page')
        let cdpSession = null;
        const fakeDD = this.driverParams.fakeDeviceDesc;
        assert(fakeDD);
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
                value: new Touchscreen(page['_client'](), page.keyboard),
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
        const chromeMajorVersion = UserAgentHelper.chromeMajorVersion(ua);
        const os = UserAgentHelper.os(fakeDD.navigator.userAgent);
        assert(chromeMajorVersion);
        assert(os);
        await page.setUserAgent(fakeDD.navigator.userAgent);
        await page.setViewport({
            width: fakeDD.window.innerWidth,
            height: fakeDD.window.innerHeight,
            isMobile: UserAgentHelper.isMobile(fakeDD.navigator.userAgent),
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
FakeBrowser.Builder = BrowserBuilder;
FakeBrowser.globalConfig = {
    defaultBrowserMaxSurvivalTime: kBrowserMaxSurvivalTime,
    defaultReferers: kDefaultReferers,
    internalHttpServerPort: kInternalHttpServerPort,
    defaultLaunchArgs: kDefaultLaunchArgs,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFrZUJyb3dzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9GYWtlQnJvd3Nlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwREFBMEQ7QUFFMUQsT0FBTyxLQUFLLElBQUksTUFBTSxNQUFNLENBQUM7QUFDN0IsT0FBTyxFQUFFLE1BQU0sSUFBSSxNQUFNLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFLMUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFNUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTVDLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDLENBQUE7QUFFdkcsTUFBTSx1QkFBdUIsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUM5QyxNQUFNLGdCQUFnQixHQUFHLENBQUMsd0JBQXdCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtBQUMzRSxNQUFNLHVCQUF1QixHQUFHLEtBQUssQ0FBQTtBQUVyQyw4QkFBOEI7QUFDOUIsK0RBQStEO0FBQy9ELGlGQUFpRjtBQUNqRixpRUFBaUU7QUFDakUsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUc7SUFDOUIsY0FBYztJQUNkLFlBQVk7SUFDWixhQUFhO0lBQ2IsY0FBYztJQUNkLGdCQUFnQjtJQUNoQiw0QkFB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