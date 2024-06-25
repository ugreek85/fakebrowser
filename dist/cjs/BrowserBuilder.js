"use strict";
// noinspection JSUnusedGlobalSymbols
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
exports.BrowserBuilder = void 0;
const path = __importStar(require("path"));
const BrowserLauncher_1 = require("./BrowserLauncher");
const FakeBrowser_1 = require("./FakeBrowser");
class BrowserBuilder {
    constructor() {
        this.driverParams = {
            doNotHook: false,
            deviceDesc: FakeBrowser_1.kDefaultWindowsDD,
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
            this.launchParams.maxSurvivalTime = FakeBrowser_1.FakeBrowser.globalConfig.defaultBrowserMaxSurvivalTime;
        }
        const result = await BrowserLauncher_1.BrowserLauncher.launch(this.launchParams);
        return result;
    }
    async connect() {
        const result = await BrowserLauncher_1.BrowserLauncher.connect(this.connectParams);
        return result;
    }
}
exports.BrowserBuilder = BrowserBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvd3NlckJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9Ccm93c2VyQnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUNBQXFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVyQywyQ0FBNEI7QUFZNUIsdURBQW1EO0FBQ25ELCtDQUE4RDtBQUc5RCxNQUFhLGNBQWM7SUFJdkI7UUFDSSxJQUFJLENBQUMsWUFBWSxHQUFHO1lBQ2hCLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLFVBQVUsRUFBRSwrQkFBaUI7WUFDN0IsV0FBVyxFQUFFLEVBQUU7WUFDZixZQUFZLEVBQUU7Z0JBQ1YsWUFBWTtnQkFDWixZQUFZO2dCQUNaLGtCQUFrQjtnQkFDbEIsZ0JBQWdCO2dCQUNoQix1QkFBdUI7Z0JBQ3ZCLG1CQUFtQjtnQkFDbkIscUJBQXFCO2dCQUNyQixXQUFXO2dCQUNYLDBCQUEwQjtnQkFDMUIsT0FBTztnQkFDUCxXQUFXO2dCQUNYLHdCQUF3QjtnQkFDeEIsV0FBVztnQkFDWCx1QkFBdUI7Z0JBQ3ZCLDBCQUEwQjtnQkFDMUIsUUFBUTtnQkFDUixvQkFBb0I7Z0JBQ3BCLHFCQUFxQjtnQkFDckIsc0JBQXNCO2dCQUN0QixZQUFZO2dCQUNaLG1CQUFtQjtnQkFDbkIsa0JBQWtCO2dCQUNsQixtQkFBbUI7Z0JBQ25CLHdCQUF3QjtnQkFDeEIsU0FBUztnQkFDVCxVQUFVO2FBQ2IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMvRCxVQUFVLEVBQUUsRUFBRTtTQUNqQixDQUFBO0lBQ0wsQ0FBQztJQUVELElBQUksWUFBWTtRQUNaLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFnQyxDQUFBO1FBQ3BELE1BQU0sQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsSUFBSSxFQUFFLENBQUE7UUFFakQsT0FBTyxNQUFNLENBQUE7SUFDakIsQ0FBQztJQUVELElBQUksYUFBYTtRQUNiLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFpQyxDQUFBO1FBQ3JELE1BQU0sQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUE7UUFFbkQsT0FBTyxNQUFNLENBQUE7SUFDakIsQ0FBQztJQUVELFNBQVMsQ0FBQyxLQUFjO1FBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtRQUNuQyxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7SUFFRCxlQUFlLENBQUMsS0FBYTtRQUN6QixJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUE7UUFDekMsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsS0FBdUI7UUFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFBO1FBQ3BDLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELHNCQUFzQixDQUFDLEtBQWM7UUFDakMsSUFBSSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUE7UUFDaEQsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBRUQsV0FBVyxDQUFDLEtBQWE7UUFDckIsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFBO1FBQ3JDLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFjO1FBQ2QsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFBO1FBQzdCLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFrQjtRQUNwQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7UUFDL0IsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBRUQsb0JBQW9CLENBQUMsS0FBMkI7UUFDNUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFBO1FBQ3ZDLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELHFCQUFxQixDQUFDLEtBQTRCO1FBQzlDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQTtRQUN6QyxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7SUFFRCxZQUFZLENBQUMsS0FBZTtRQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUE7UUFDdEMsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQTZCO1FBQ3BDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQTtRQUNwQyxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTTtRQUNSLElBQUksV0FBVyxLQUFLLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUU7WUFDMUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLEdBQUcseUJBQVcsQ0FBQyxZQUFZLENBQUMsNkJBQTZCLENBQUE7U0FDN0Y7UUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLGlDQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUM5RCxPQUFPLE1BQU0sQ0FBQTtJQUNqQixDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU87UUFDVCxNQUFNLE1BQU0sR0FBRyxNQUFNLGlDQUFlLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUNoRSxPQUFPLE1BQU0sQ0FBQTtJQUNqQixDQUFDO0NBR0o7QUE3SEQsd0NBNkhDIn0=