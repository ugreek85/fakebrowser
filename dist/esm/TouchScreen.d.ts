import { CDPSession, Keyboard, MouseOptions, Point } from 'puppeteer';
export declare class Touchscreen {
    private readonly client;
    private readonly keyboard;
    private _x;
    private _y;
    private _button;
    constructor(client: CDPSession, keyboard: Keyboard);
    move(x: number, y: number, options?: {
        steps?: number;
    }): Promise<void>;
    tap(x: number, y: number, options?: MouseOptions & {
        delay?: number;
    }): Promise<void>;
    down(options?: MouseOptions): Promise<void>;
    up(options?: MouseOptions): Promise<void>;
    drag(start: Point, target: Point): Promise<void>;
}
//# sourceMappingURL=TouchScreen.d.ts.map