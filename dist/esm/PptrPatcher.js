// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
import * as path from 'path';
import { strict as assert } from 'assert';
import axios from 'axios';
import { helper } from './helper';
import { FakeBrowser } from './FakeBrowser';
export class PptrPatcher {
    static async patch(browserUUID, pptr, params) {
        assert(!!params.fakeDeviceDesc);
        const opts = {
            browserUUID: browserUUID,
            internalHttpServerPort: FakeBrowser.globalConfig.internalHttpServerPort,
            fakeDD: params.fakeDeviceDesc,
            proxyExportIP: params.proxy && params.proxy.exportIP,
            myRealExportIP: await helper.myRealExportIP(),
            historyLength: helper.rd(2, 10),
        };
        // user action layer
        await this.patchUserActionLayer(browserUUID, pptr, params, opts);
        // evasions
        for (const evasionPath of params.evasionPaths) {
            const Plugin = require(evasionPath);
            const plugin = Plugin(opts);
            pptr.use(plugin);
        }
        // other plugins
        for (const plugin of params.usePlugins) {
            pptr.use(plugin);
        }
        // last, tidy up
        await this.patchLast(browserUUID, pptr, params, opts);
    }
    static patchUserActionLayer(uuid, pptr, params, opts) {
        if (params.displayUserActionLayer) {
            const Plugin = require(path.resolve(__dirname, '../plugins/user-action-layer'));
            const plugin = Plugin(opts);
            pptr.use(plugin);
        }
    }
    static patchLast(uuid, pptr, params, opts) {
        let Plugin = require(path.resolve(__dirname, '../plugins/evasions/zzzzzzzz.last'));
        let plugin = Plugin(opts);
        pptr.use(plugin);
    }
    /**
     * Package evasions to js string for worker to use
     * @param browser
     * @param jsContent
     */
    static async patchWorkerJsContent(browser, jsContent) {
        const jsPatch = await this.evasionsCode(browser);
        jsContent = jsPatch + jsContent;
        return jsContent;
    }
    static async evasionsCode(browser) {
        let jsPatch = '';
        const utils = require('../plugins/evasions/_utils');
        // utils
        let utilsContent = `const utils = {};\n`;
        for (const [key, value] of Object.entries(utils)) {
            const utilsFuncCode = value.toString();
            utilsContent += `utils.${key} = ${utilsFuncCode}; \n`;
        }
        utilsContent += `utils.init(); \n`;
        // code from puppeteer-extra
        const plugins = browser.pptrExtra.plugins;
        const runLast = plugins
            .filter(p => p.requirements.has('runLast'))
            .map(p => p.name);
        for (const name of runLast) {
            const index = plugins.findIndex(p => p.name === name);
            plugins.push(plugins.splice(index, 1)[0]);
        }
        for (const plugin of plugins) {
            if (plugin['onBrowser']) {
                await plugin['onBrowser'](browser.vanillaBrowser);
            }
            if (plugin['onServiceWorkerContent']) {
                // console.log(`SW Patch: ${plugin.name}`)
                jsPatch = await plugin['onServiceWorkerContent'](jsPatch);
            }
        }
        jsPatch = utilsContent + jsPatch;
        // when all evasions are patched, delete OffscreenCanvas.prototype.constructor.__cache
        return `(function() {${jsPatch};})(); \n\n 
const tmpVarNames =
    Object.getOwnPropertyNames(
        OffscreenCanvas.prototype.constructor,
    ).filter(e => e.startsWith('__$'));

tmpVarNames.forEach(e => {
    delete OffscreenCanvas.prototype.constructor[e];
});
`;
    }
    static async patchServiceWorkerRequest(browser, requestId, request, responseHeaders, client) {
        try {
            let base64Encoded = true;
            let jsContent;
            if (responseHeaders && responseHeaders.length) {
                let body;
                ({ body, base64Encoded } = await client.send('Fetch.getResponseBody', { requestId }));
                jsContent = base64Encoded ? Buffer.from(body, 'base64').toString('utf-8') : body;
            }
            else {
                // TODO: get through proxy
                const jsResp = await axios.get(request.url, { headers: request.headers });
                jsContent = jsResp.data;
                responseHeaders =
                    Object.entries(jsResp.headers).map(e => ({ name: e[0], value: e[1] }));
            }
            jsContent = await this.patchWorkerJsContent(browser, jsContent);
            // The order I used is: Fetch.enable -> on Fetch.requestPaused event -> Fetch.getResponseBody -> Fetch.fulfillRequest -> Fetch.disable
            await client.send('Fetch.fulfillRequest', {
                requestId,
                responseCode: 200,
                responseHeaders: responseHeaders,
                body: 1 ? Buffer.from(jsContent).toString('base64') : jsContent,
            });
            return true;
        }
        catch (ex) {
            console.error('SW inject failed', ex);
            await client.send('Fetch.failRequest', { requestId, errorReason: 'Aborted' });
        }
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHB0clBhdGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9QcHRyUGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwREFBMEQ7QUFFMUQsT0FBTyxLQUFLLElBQUksTUFBTSxNQUFNLENBQUE7QUFDNUIsT0FBTyxFQUFFLE1BQU0sSUFBSSxNQUFNLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFFekMsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBSXpCLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFFakMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQVkzQyxNQUFNLE9BQU8sV0FBVztJQUVwQixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FDZCxXQUFtQixFQUNuQixJQUFvQixFQUNwQixNQUF3QjtRQUV4QixNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUUvQixNQUFNLElBQUksR0FBeUI7WUFDL0IsV0FBVyxFQUFFLFdBQVc7WUFDeEIsc0JBQXNCLEVBQUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxzQkFBc0I7WUFDdkUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxjQUFjO1lBQzdCLGFBQWEsRUFBRSxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUTtZQUNwRCxjQUFjLEVBQUUsTUFBTSxNQUFNLENBQUMsY0FBYyxFQUFFO1lBQzdDLGFBQWEsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7U0FDbEMsQ0FBQTtRQUVELG9CQUFvQjtRQUNwQixNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUVoRSxXQUFXO1FBQ1gsS0FBSyxNQUFNLFdBQVcsSUFBSSxNQUFNLENBQUMsWUFBWSxF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