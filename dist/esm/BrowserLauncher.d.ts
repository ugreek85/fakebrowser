/// <reference types="node" />
/// <reference types="node" />
import * as http from 'http';
import { ConnectParameters, LaunchParameters } from './Driver.js';
import { FakeBrowser } from './FakeBrowser';
export declare class BrowserLauncher {
    static _fakeBrowserInstances: FakeBrowser[];
    static _checkerIntervalId: NodeJS.Timer | null;
    static _httpServer: http.Server | null;
    private static checkLaunchOptionsLegal;
    private static prepareFakeDeviceDesc;
    static connect(params: ConnectParameters): Promise<FakeBrowser>;
    static launch(params: LaunchParameters): Promise<FakeBrowser>;
    private static bootInternalHTTPServer;
    private static bootBrowserSurvivalChecker;
    static getBrowserWithUUID(uuid: string): FakeBrowser | undefined;
    static _forceShutdown(fb: FakeBrowser): Promise<void>;
}
//# sourceMappingURL=BrowserLauncher.d.ts.map