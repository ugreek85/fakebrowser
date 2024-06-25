import { CDPSession, Protocol } from 'puppeteer';
import { PuppeteerExtra } from 'puppeteer-extra';
import { DriverParameters } from './Driver';
import { FakeBrowser } from './FakeBrowser';
export declare class PptrPatcher {
    static patch(browserUUID: string, pptr: PuppeteerExtra, params: DriverParameters): Promise<void>;
    private static patchUserActionLayer;
    private static patchLast;
    /**
     * Package evasions to js string for worker to use
     * @param browser
     * @param jsContent
     */
    static patchWorkerJsContent(browser: FakeBrowser, jsContent: string): Promise<string>;
    static evasionsCode(browser: FakeBrowser): Promise<string>;
    static patchServiceWorkerRequest(browser: FakeBrowser, requestId: Protocol.Network.RequestId, request: Protocol.Network.Request, responseHeaders: Protocol.Fetch.HeaderEntry[], client: CDPSession): Promise<boolean>;
}
//# sourceMappingURL=PptrPatcher.d.ts.map