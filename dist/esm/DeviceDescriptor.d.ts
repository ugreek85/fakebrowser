export declare enum FontExistTypes {
    FontNotExists = 0,
    FontExists = 1,
    BaseFont = 2
}
/**
 * Source information for browser fingerprint.
 * Includes plugins, gpu, fonts, webgl, etc.
 *
 * Q: How do we get this information?
 * A: Use dumpDD.js to collect fingerprints.
 */
export interface DeviceDescriptor {
    plugins: {
        mimeTypes: Array<{
            type: string;
            suffixes: string;
            description: string;
            __pluginName: string;
        }>;
        plugins: Array<{
            name: string;
            filename: string;
            description: string;
            __mimeTypes: string[];
        }>;
    };
    allFonts: Array<{
        name: string;
        exists: FontExistTypes;
    }>;
    gpu: {
        vendor: string;
        renderer: string;
    };
    navigator: {
        languages: string[];
        userAgent: string;
        'appCodeName': string;
        'appMinorVersion': string;
        'appName': string;
        'appVersion': string;
        'buildID': string;
        'platform': string;
        'product': string;
        'productSub': string;
        'hardwareConcurrency': number;
        'cpuClass': string;
        'maxTouchPoints': number;
        'oscpu': string;
        'vendor': string;
        'vendorSub': string;
        'deviceMemory': number;
        'doNotTrack': string;
        'msDoNotTrack': string;
        'vibrate': string;
        'credentials': string;
        'storage': string;
        'requestMediaKeySystemAccess': string;
        'bluetooth': string;
        'language': string;
        'systemLanguage': string;
        'userLanguage': string;
        webdriver: boolean;
    };
    'window': {
        'innerWidth': number;
        'innerHeight': number;
        'outerWidth': number;
        'outerHeight': number;
        'screenX': number;
        'screenY': number;
        'pageXOffset': number;
        'pageYOffset': number;
        'Image': string;
        'isSecureContext': boolean;
        'devicePixelRatio': number;
        'toolbar': string;
        'locationbar': string;
        'ActiveXObject': string;
        'external': string;
        'mozRTCPeerConnection': string;
        'postMessage': string;
        'webkitRequestAnimationFrame': string;
        'BluetoothUUID': string;
        'netscape': string;
        'localStorage': string;
        'sessionStorage': string;
        'indexDB': string;
    };
    'document': {
        'characterSet': string;
        'compatMode': string;
        'documentMode': string;
        'layers': string;
        'images': string;
    };
    'screen': {
        'availWidth': number;
        'availHeight': number;
        'availLeft': number;
        'availTop': number;
        'width': number;
        'height': number;
        'colorDepth': number;
        'pixelDepth': number;
    };
    'body': {
        'clientWidth': number;
        'clientHeight': number;
    };
    'webgl': WebGLDescriptor;
    'webgl2': WebGLDescriptor;
    mimeTypes: Array<{
        mimeType: string;
        audioPlayType: string;
        videoPlayType: string;
        mediaSource: boolean;
        mediaRecorder: boolean;
    }>;
    'mediaDevices': Array<{
        'deviceId': string;
        'kind': string;
        'label': string;
        'groupId': string;
    }>;
    'battery': {
        charging: boolean;
        chargingTime: number;
        dischargingTime: number;
        level: number;
    };
    'voices': Array<{
        default: boolean;
        lang: string;
        localService: boolean;
        name: string;
        voiceURI: string;
    }>;
    'windowVersion': string[];
    'htmlElementVersion': string[];
    'keyboard': Record<string, string>;
    'permissions': Record<string, {
        'state'?: string;
        'exType'?: string;
        'msg'?: string;
    }>;
}
export interface WebGLDescriptor {
    'supportedExtensions': string[];
    'contextAttributes': {
        'alpha': boolean;
        'antialias': boolean;
        'depth': boolean;
        'desynchronized': boolean;
        'failIfMajorPerformanceCaveat': boolean;
        'powerPreference': string;
        'premultipliedAlpha': boolean;
        'preserveDrawingBuffer': boolean;
        'stencil': boolean;
        'xrCompatible': boolean;
    };
    'maxAnisotropy': number;
    'params': Record<string, {
        'type': string;
        'value': null | string | number | number[] | Record<string, number>;
    }>;
    'shaderPrecisionFormats': Array<{
        'shaderType': number;
        'precisionType': number;
        'r': {
            'rangeMin': number;
            'rangeMax': number;
            'precision': number;
        };
    }>;
}
export type ChromeUACHHeaders = {
    'Accept-Language'?: string;
    'sec-ch-ua'?: string;
    'sec-ch-ua-mobile'?: string;
    'sec-ch-ua-platform'?: string;
};
/**
 * Simplify the font information into family, style, weight, size
 */
export interface FontDescriptor {
    fontFamily: string;
    fontStyle: string;
    fontWeight: string;
    fontSize: number;
}
export interface FakeFont {
    exists: boolean;
    originalFontFamily: string;
    fakeFont: FontDescriptor;
}
export type IFontSalt = {
    exists: boolean;
    offsetWidth: number;
    offsetHeight: number;
    style: string;
    weight: string;
    size: number;
};
export interface FakeDeviceDescriptor extends DeviceDescriptor {
    canvasSalt?: number[];
    fontSalt?: {
        [key: string]: IFontSalt;
    };
    acceptLanguage?: string;
}
export default class DeviceDescriptorHelper {
    /**
     * Check device descriptor legal based on attributes
     * @param dd
     */
    static checkLegal(dd: DeviceDescriptor): boolean;
    /**
     * Calculate browser UUID
     * We simply use DeviceDescriptor JSON string and take MD5.
     * @param e
     */
    static deviceUUID(e: DeviceDescriptor): string;
    static buildFakeDeviceDescriptor(deviceDesc: DeviceDescriptor): {
        fakeDeviceDesc: FakeDeviceDescriptor;
        needsUpdate: boolean;
    };
    private static buildAcceptLanguage;
}
//# sourceMappingURL=DeviceDescriptor.d.ts.map