import { ConnectParameters, DriverParameters, LaunchParameters, ProxyServer, VanillaConnectOptions, VanillaLaunchOptions } from './Driver.js';
import { DeviceDescriptor } from './DeviceDescriptor.js';
import { FakeBrowser } from './FakeBrowser';
import { PuppeteerExtraPlugin } from 'puppeteer-extra';
export declare class BrowserBuilder {
    readonly driverParams: DriverParameters;
    constructor();
    get launchParams(): LaunchParameters;
    get connectParams(): ConnectParameters;
    doNotHook(value: boolean): this;
    maxSurvivalTime(value: number): this;
    deviceDescriptor(value: DeviceDescriptor): this;
    displayUserActionLayer(value: boolean): this;
    userDataDir(value: string): this;
    log(value: boolean): this;
    proxy(value: ProxyServer): this;
    vanillaLaunchOptions(value: VanillaLaunchOptions): this;
    vanillaConnectOptions(value: VanillaConnectOptions): this;
    evasionPaths(value: string[]): this;
    usePlugins(value: PuppeteerExtraPlugin[]): this;
    launch(): Promise<FakeBrowser>;
    connect(): Promise<FakeBrowser>;
}
//# sourceMappingURL=BrowserBuilder.d.ts.map