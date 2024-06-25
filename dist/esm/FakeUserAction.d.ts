import { ElementHandle, KeyInput, Point } from 'puppeteer';
import { FakeBrowser } from './FakeBrowser';
export declare class FakeUserAction {
    private _mouseCurrPos;
    private _fakeBrowser;
    constructor(fb: FakeBrowser);
    /**
     * Fake mouse movement track
     * @param startPos
     * @param endPos
     * @param maxPoints
     * @param cpDelta
     */
    private static mouseMovementTrack;
    /**
     * Simulate mouse movement
     * @param page
     * @param options
     */
    private static simMouseMove;
    get fakeBrowser(): FakeBrowser | null;
    simMouseMoveTo(endPos: Point, maxPoints?: number, timestamp?: number, cpDelta?: number): Promise<boolean>;
    simRandomMouseMove(): Promise<boolean>;
    simClick(options?: {
        pauseAfterMouseUp: boolean;
    }): Promise<boolean>;
    simMoveToAndClick(endPos: Point, options?: {
        pauseAfterMouseUp: boolean;
    }): Promise<boolean>;
    simMouseMoveToElement(eh: ElementHandle): Promise<boolean>;
    simClickElement(eh: ElementHandle, options?: {
        pauseAfterMouseUp: boolean;
    }): Promise<boolean>;
    private static adjustElementPositionWithMouse;
    private static adjustElementPositionWithTouchscreen;
    simKeyboardPress(text: KeyInput, options?: {
        pauseAfterKeyUp: boolean;
    }): Promise<boolean>;
    simKeyboardEnter(options?: {
        pauseAfterKeyUp: boolean;
    }): Promise<boolean>;
    simKeyboardEsc(options?: {
        pauseAfterKeyUp: boolean;
    }): Promise<boolean>;
    simKeyboardType(text: string, options?: {
        pauseAfterLastKeyUp: boolean;
    }): Promise<boolean>;
}
//# sourceMappingURL=FakeUserAction.d.ts.map