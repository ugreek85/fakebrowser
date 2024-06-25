import { PuppeteerExtra, PuppeteerExtraPlugin } from 'puppeteer-extra';
import { Browser, BrowserConnectOptions, BrowserLaunchArgumentOptions, ConnectOptions, LaunchOptions } from 'puppeteer';
import { DeviceDescriptor, FakeDeviceDescriptor } from './DeviceDescriptor.js';
export interface ProxyServer {
    proxyType: 'socks5' | 'socks4' | 'http' | 'https';
    ipType: 'host' | 'pppoe' | 'resident' | 'tor';
    proxy: string;
    exportIP: string;
    username?: string;
    password?: string;
}
export type VanillaLaunchOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions;
export type VanillaConnectOptions = ConnectOptions;
export interface DriverParameters {
    doNotHook: boolean;
    deviceDesc: DeviceDescriptor;
    fakeDeviceDesc?: FakeDeviceDescriptor;
    displayUserActionLayer?: boolean;
    log?: boolean;
    proxy?: ProxyServer;
    userDataDir?: string;
    evasionPaths: string[];
    usePlugins: PuppeteerExtraPlugin[];
}
export interface LaunchParameters extends DriverParameters {
    maxSurvivalTime: number;
    launchOptions: VanillaLaunchOptions;
}
export interface ConnectParameters extends DriverParameters {
    connectOptions: VanillaConnectOptions;
}
export declare const kDefaultTimeout: number;
export declare const kDefaultLaunchOptions: {
    headless: boolean;
    devtools: boolean;
    timeout: number;
};
export default class Driver {
    private static checkParamsLegal;
    /**
     * Connect to browser
     * @param uuid
     * @param params
     */
    static connect(uuid: string, params: ConnectParameters): Promise<{
        vanillaBrowser: Browser;
        pptrExtra: PuppeteerExtra;
    }>;
    /**
     * Launch browser
     * @param uuid
     * @param defaultLaunchArgs
     * @param params
     */
    static launch(uuid: string, defaultLaunchArgs: string[], params: LaunchParameters): Promise<{
        vanillaBrowser: Browser;
        pptrExtra: PuppeteerExtra;
    }>;
    private static patchUAFromLaunchedBrowser;
    private static patchLaunchArgs;
    private static getPids;
    /**
     * Shutdown browser
     * @param browser
     */
    static shutdown(browser: Browser): Promise<void>;
}
//# sourceMappingURL=Driver.d.ts.map