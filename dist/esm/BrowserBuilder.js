// noinspection JSUnusedGlobalSymbols
import * as path from 'path';
import { BrowserLauncher } from './BrowserLauncher';
import { FakeBrowser, kDefaultWindowsDD } from './FakeBrowser';
export class BrowserBuilder {
    constructor() {
        this.driverParams = {
            doNotHook: false,
            deviceDesc: kDefaultWindowsDD,
            userDataDir: '',
            evasionPaths: [
                'chrome.app',
                'chrome.csi',
                'chrome.loadTimes',
                'chrome.runtime',
                'window.history.length',
                'window.matchMedia',
                'navigator.webdriver',
                'sourceurl',
                'navigator.plugins-native',
                'webgl',
                'mimeTypes',
                'navigator.mediaDevices',
                'bluetooth',
                'navigator.permissions',
                'navigator.batteryManager',
                'webrtc',
                'canvas.fingerprint',
                'user-agent-override',
                'iframe.contentWindow',
                'iframe.src',
                'properties.getter',
                'font.fingerprint',
                'emoji.fingerprint',
                'window.speechSynthesis',
                'workers',
                'keyboard',
            ].map(e => path.resolve(__dirname, `../plugins/evasions/${e}`)),
            usePlugins: [],
        };
    }
    get launchParams() {
        const result = this.driverParams;
        result.launchOptions = result.launchOptions || {};
        return result;
    }
    get connectParams() {
        const result = this.driverParams;
        result.connectOptions = result.connectOptions || {};
        return result;
    }
    doNotHook(value) {
        this.launchParams.doNotHook = value;
        return this;
    }
    maxSurvivalTime(value) {
        this.launchParams.maxSurvivalTime = value;
        return this;
    }
    deviceDescriptor(value) {
        this.driverParams.deviceDesc = value;
        return this;
    }
    displayUserActionLayer(value) {
        this.driverParams.displayUserActionLayer = value;
        return this;
    }
    userDataDir(value) {
        this.driverParams.userDataDir = value;
        return this;
    }
    log(value) {
        this.driverParams.log = value;
        return this;
    }
    proxy(value) {
        this.driverParams.proxy = value;
        return this;
    }
    vanillaLaunchOptions(value) {
        this.launchParams.launchOptions = value;
        return this;
    }
    vanillaConnectOptions(value) {
        this.connectParams.connectOptions = value;
        return this;
    }
    evasionPaths(value) {
        this.driverParams.evasionPaths = value;
        return this;
    }
    usePlugins(value) {
        this.driverParams.usePlugins = value;
        return this;
    }
    async launch() {
        if ('undefined' === typeof this.launchParams.maxSurvivalTime) {
            this.launchParams.maxSurvivalTime = FakeBrowser.globalConfig.defaultBrowserMaxSurvivalTime;
        }
        const result = await BrowserLauncher.launch(this.launchParams);
        return result;
    }
    async connect() {
        const result = await BrowserLauncher.connect(this.connectParams);
        return result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvd3NlckJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9Ccm93c2VyQnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxxQ0FBcUM7QUFFckMsT0FBTyxLQUFLLElBQUksTUFBTSxNQUFNLENBQUE7QUFZNUIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBQ25ELE9BQU8sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxlQUFlLENBQUE7QUFHOUQsTUFBTSxPQUFPLGNBQWM7SUFJdkI7UUFDSSxJQUFJLENBQUMsWUFBWSxHQUFHO1lBQ2hCLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLFVBQVUsRUFBRSxpQkFBaUI7WUFDN0IsV0FBVyxFQUFFLEVBQUU7WUFDZixZQUFZLEVBQUU7Z0JBQ1YsWUFBWTtnQkFDWixZQUFZO2dCQUNaLGtCQUFrQjtnQkFDbEIsZ0JBQWdCO2dCQUNoQix1QkFBdUI7Z0JBQ3ZCLG1CQUFtQjtnQkFDbkIscUJBQXFCO2dCQUNyQixXQUFXO2dCQUNYLDBCQUEwQjtnQkFDMUIsT0FBTztnQkFDUCxXQUFXO2dCQUNYLHdCQUF3QjtnQkFDeEIsV0FBVztnQkFDWCx1QkFBdUI7Z0JBQ3ZCLDBCQUEwQjtnQkFDMUIsUUFBUTtnQkFDUixvQkFBb0I7Z0JBQ3BCLHFCQUFxQjtnQkFDckIsc0JBQXNCO2dCQUN0QixZQUFZO2dCQUNaLG1CQUFtQjtnQkFDbkIsa0JBQWtCO2dCQUNsQixtQkFBbUI7Z0JBQ25CLHdCQUF3QjtnQkFDeEIsU0FBUztnQkFDVCxVQUFVO2FBQ2IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMvRCxVQUFVLEVBQUUsRUFBRTtTQUNqQixDQUFBO0lBQ0wsQ0FBQztJQUVELElBQUksWUFBWTtRQUNaLE1BQU0s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