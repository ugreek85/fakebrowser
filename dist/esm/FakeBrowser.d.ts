import { Browser, Page } from 'puppeteer';
import { PuppeteerExtra } from 'puppeteer-extra';
import { ConnectParameters, DriverParameters, LaunchParameters } from './Driver.js';
import { FakeUserAction } from './FakeUserAction';
import { BrowserBuilder } from './BrowserBuilder';
export declare const kDefaultWindowsDD: any;
export declare const kDefaultLaunchArgs: string[];
export declare class FakeBrowser {
    readonly driverParams: DriverParameters;
    readonly vanillaBrowser: Browser;
    readonly pptrExtra: PuppeteerExtra;
    readonly bindingTime: number;
    readonly uuid: string;
    static Builder: typeof BrowserBuilder;
    static readonly globalConfig: {
        defaultBrowserMaxSurvivalTime: number;
        defaultReferers: string[];
        internalHttpServerPort: number;
        defaultLaunchArgs: string[];
    };
    readonly isMobileBrowser: boolean;
    readonly userAction: FakeUserAction;
    private _zombie;
    get launchParams(): LaunchParameters;
    get connectParams(): ConnectParameters;
    private beforeShutdown;
    shutdown(): Promise<void>;
    getActivePage(): Promise<Page | null>;
    constructor(driverParams: DriverParameters, vanillaBrowser: Browser, pptrExtra: PuppeteerExtra, bindingTime: number, uuid: string);
    private onDisconnected;
    private onTargetCreated;
    private interceptWorker;
    private interceptTarget;
    interceptPage(page: Page): Promise<{
        page: Page;
        cdpSession: null;
    }>;
    _patchPages0Bug(): Promise<void>;
}
//# sourceMappingURL=FakeBrowser.d.ts.map