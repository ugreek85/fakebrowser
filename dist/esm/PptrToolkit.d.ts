import { BoundingBox, Browser, ElementHandle, Frame, Page } from 'puppeteer';
import { FakeDeviceDescriptor } from './DeviceDescriptor';
export declare class PptrToolkit {
    static waitForSelectorWithRegex(page: Page | Frame, reg: RegExp, attributeToSearch?: string | null, options?: {
        timeout: number;
    }): Promise<ElementHandle[]>;
    /**
     * Search DOM nodes based on regular expressions
     * @param page
     * @param reg
     * @param attributeToSearch
     */
    static querySelectorAllWithRegex(page: Page | Frame, reg: RegExp, attributeToSearch?: string | null): Promise<ElementHandle[]>;
    static stopLoading(page: Page): Promise<void>;
    static boundingBoxNew(eh: ElementHandle): Promise<{
        border: BoundingBox;
        content: BoundingBox;
        margin: BoundingBox;
        padding: BoundingBox;
        width: number;
        height: number;
    } | null>;
    static boundingBox(eh?: ElementHandle | null): Promise<BoundingBox | null>;
    static intersectingViewport(eh: ElementHandle, fakeDD: FakeDeviceDescriptor): Promise<BoundingBox | null>;
    static getActivePage(browser: Browser, timeout?: number): Promise<Page | null>;
}
//# sourceMappingURL=PptrToolkit.d.ts.map