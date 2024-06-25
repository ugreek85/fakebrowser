"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PptrToolkit = void 0;
const helper_1 = require("./helper");
class PptrToolkit {
    static async waitForSelectorWithRegex(page, reg, attributeToSearch, options = { timeout: 30 * 1000 }) {
        const timestamp = new Date().getTime();
        for (;;) {
            const result = await this.querySelectorAllWithRegex(page, reg, attributeToSearch);
            if (result.length) {
                return result;
            }
            if (new Date().getTime() - timestamp >= options.timeout) {
                return [];
            }
            await helper_1.helper.sleep(100);
        }
    }
    /**
     * Search DOM nodes based on regular expressions
     * @param page
     * @param reg
     * @param attributeToSearch
     */
    static async querySelectorAllWithRegex(page, reg, attributeToSearch = 'class') {
        if (attributeToSearch) {
            const doms = await page.$$(`[${attributeToSearch}]`);
            const output = [];
            for (let e of doms) {
                const attrib = await page.evaluate((e, attributeToSearch) => {
                    return e.getAttribute(attributeToSearch);
                }, e, attributeToSearch);
                // @ts-ignore
                if (reg.test(attrib)) {
                    output.push(e);
                }
            }
            return output;
        }
        else {
            const doms = await page.$$('*');
            const output = [];
            for (let e of doms) {
                const attribs = await page.evaluate(e => e.attributes, e);
                for (let attribute of attribs) {
                    // @ts-ignore
                    if (reg.test(attribute.value)) {
                        output.push(e);
                    }
                }
            }
            return output;
        }
    }
    static async stopLoading(page) {
        try {
            await page['_client'].send('Page.stopLoading');
        }
        catch (ex) {
        }
        try {
            await page.evaluate(() => window.stop());
        }
        catch (ex) {
        }
    }
    static async boundingBoxNew(eh) {
        try {
            const { model } = await eh._client.send('DOM.getBoxModel', {
                objectId: eh._remoteObject.objectId,
            });
            if (!model) {
                return null;
            }
            const calculatePos = function (quad) {
                const x = Math.min(quad[0], quad[2], quad[4], quad[6]);
                const y = Math.min(quad[1], quad[3], quad[5], quad[7]);
                return {
                    x: x,
                    y: y,
                    width: Math.max(quad[0], quad[2], quad[4], quad[6]) - x,
                    height: Math.max(quad[1], quad[3], quad[5], quad[7]) - y,
                };
            };
            return {
                border: calculatePos(model.border),
                content: calculatePos(model.content),
                margin: calculatePos(model.margin),
                padding: calculatePos(model.padding),
                width: model.width,
                height: model.height,
            };
        }
        catch (ignored) {
            return null;
        }
    }
    static async boundingBox(eh) {
        if (!eh) {
            return null;
        }
        let box = await eh.boundingBox();
        if (!box) {
            const boxNew = await this.boundingBoxNew(eh);
            if (boxNew) {
                box = boxNew.content;
            }
        }
        return box;
    }
    static async intersectingViewport(eh, fakeDD) {
        if (!(await eh.isIntersectingViewport())) {
            return null;
        }
        const box = await PptrToolkit.boundingBox(eh);
        if (!box) {
            return null;
        }
        if (box.y > 0 && box.y + box.height < fakeDD.window.innerHeight &&
            box.x > 0 && box.x + box.width < fakeDD.window.innerWidth) {
            return box;
        }
        return null;
    }
    static async getActivePage(browser, timeout = 10 * 1000) {
        const start = new Date().getTime();
        while (new Date().getTime() - start < timeout) {
            const pages = await Promise.all(browser.targets()
                .filter((target) => target.type() === 'page')
                .map((target) => target.page()));
            const arr = [];
            for (const p of pages) {
                if (p) {
                    if (await p.evaluate(() => {
                        return document.visibilityState == 'visible';
                    })) {
                        arr.push(p);
                    }
                }
            }
            if (arr.length == 1) {
                return arr[0];
            }
        }
        throw 'Unable to get active page';
    }
}
exports.PptrToolkit = PptrToolkit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHB0clRvb2xraXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9QcHRyVG9vbGtpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxxQ0FBK0I7QUFHL0IsTUFBYSxXQUFXO0lBQ3BCLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQ2pDLElBQWtCLEVBQ2xCLEdBQVcsRUFDWCxpQkFBaUMsRUFDakMsT0FBTyxHQUFHLEVBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxJQUFJLEVBQUM7UUFFOUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUN0QyxTQUFVO1lBQ04sTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFBO1lBQ2pGLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtnQkFDZixPQUFPLE1BQU0sQ0FBQTthQUNoQjtZQUVELElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtnQkFDckQsT0FBTyxFQUFFLENBQUE7YUFDWjtZQUVELE1BQU0sZUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUMxQjtJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQ2xDLElBQWtCLEVBQ2xCLEdBQVcsRUFDWCxvQkFBbUMsT0FBTztRQUUxQyxJQUFJLGlCQUFpQixFQUFFO1lBQ25CLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQTtZQUNwRCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUE7WUFDakIsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUU7Z0JBQ2hCLE1B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