declare function md5(data: string): string;
/**
 * setTimeout async wrapper
 * @param ms sleep timeout
 */
declare function sleep(ms: number): Promise<void>;
declare function sleepRd(a: number, b: number): Promise<void>;
/**
 * random method
 * @param min
 * @param max
 * @param pon random positive or negative
 */
declare function _rd(min: number, max: number, pon?: boolean): number;
declare function _arrRd<T>(arr: T[]): T;
/**
 * positive or negative
 */
declare function _pon(): number;
declare function inMac(): boolean;
declare function inLinux(): boolean;
declare function inWindow(): boolean;
declare function waitFor<T>(func: () => T, timeout: number): Promise<T | null>;
declare function myRealExportIP(): Promise<string>;
declare function arrShuffle<T>(arr: T[]): T[];
declare function objClone<T>(obj: T): T;
/**
 * @desc Second-order Bessel curves
 * @param {number} t Current Percentage
 * @param {Array} p1 Starting point coordinates
 * @param {Array} p2 End point coordinates
 * @param {Array} cp Control Points
 */
declare function twoBezier(t: number, p1: number[], cp: number[], p2: number[]): number[];
/**
 * @desc Third-order Bessel curves
 * @param {number} t Current Percentage
 * @param {Array} p1 Starting point coordinates
 * @param {Array} p2 End point coordinates
 * @param {Array} cp1 First Control Points
 * @param {Array} cp2 Second Control Points
 */
declare function threeBezier(t: number, p1: number[], cp1: number[], cp2: number[], p2: number[]): number[];
declare function makeFuncName(len?: number): string;
export declare const helper: {
    md5: typeof md5;
    sleep: typeof sleep;
    sleepRd: typeof sleepRd;
    rd: typeof _rd;
    arrRd: typeof _arrRd;
    pon: typeof _pon;
    inMac: typeof inMac;
    inLinux: typeof inLinux;
    inWindow: typeof inWindow;
    waitFor: typeof waitFor;
    myRealExportIP: typeof myRealExportIP;
    arrShuffle: typeof arrShuffle;
    objClone: typeof objClone;
    twoBezier: typeof twoBezier;
    threeBezier: typeof threeBezier;
    makeFuncName: typeof makeFuncName;
};
export {};
//# sourceMappingURL=helper.d.ts.map