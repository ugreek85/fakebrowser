declare function isMobile(ua: string): boolean;
export type BrowserTypes = 'IE' | 'Chrome' | 'Firefox' | 'Opera' | 'Safari' | 'Edge' | 'QQBrowser' | 'WeixinBrowser' | 'Unknown';
declare function browserType(userAgent: string): BrowserTypes;
declare function chromeMajorVersion(userAgent: string): number | null;
declare function chromeVersion(userAgent: string): string | null;
export type OSTypes = 'Windows' | 'macOS' | 'Linux' | 'iPhone' | 'iPod' | 'iPad' | 'Android' | 'Unknown';
declare function os(userAgent: string): OSTypes;
export declare const UserAgentHelper: {
    isMobile: typeof isMobile;
    browserType: typeof browserType;
    chromeMajorVersion: typeof chromeMajorVersion;
    chromeVersion: typeof chromeVersion;
    os: typeof os;
};
export {};
//# sourceMappingURL=UserAgentHelper.d.ts.map