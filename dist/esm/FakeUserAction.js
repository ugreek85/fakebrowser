// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols,PointlessArithmeticExpressionJS
import { strict as assert } from 'assert';
import { helper } from './helper';
import { PptrToolkit } from './PptrToolkit';
export class FakeUserAction {
    constructor(fb) {
        this._mouseCurrPos = { x: helper.rd(0, 1280), y: helper.rd(0, 700) };
        // this._fakeBrowser = new WeakRef<FakeBrowser>(fb)
        this._fakeBrowser = fb;
    }
    /**
     * Fake mouse movement track
     * @param startPos
     * @param endPos
     * @param maxPoints
     * @param cpDelta
     */
    static mouseMovementTrack(startPos, endPos, maxPoints = 30, cpDelta = 1) {
        // reference: https://github.com/mtsee/Bezier/blob/master/src/bezier.js
        let nums = [];
        let maxNum = 0;
        let moveStep = 1;
        // Simulates the user's mouse movement acceleration / constant speed / deceleration
        for (let n = 0; n < maxPoints; ++n) {
            nums.push(maxNum);
            // noinspection PointlessArithmeticExpressionJS
            if (n < maxPoints * 1 / 10) {
                moveStep += helper.rd(60, 100);
            }
            else if (n >= maxPoints * 9 / 10) {
                moveStep -= helper.rd(60, 100);
                moveStep = Math.max(20, moveStep);
            }
            maxNum += moveStep;
        }
        const result = [];
        const p1 = [
            startPos.x,
            startPos.y,
        ];
        const cp1 = [
            (startPos.x + endPos.x) / 2 + helper.rd(30, 100, true) * cpDelta,
            (startPos.y + endPos.y) / 2 + helper.rd(30, 100, true) * cpDelta,
        ];
        const cp2 = [
            (startPos.x + endPos.x) / 2 + helper.rd(30, 100, true) * cpDelta,
            (startPos.y + endPos.y) / 2 + helper.rd(30, 100, true) * cpDelta,
        ];
        const p2 = [
            endPos.x,
            endPos.y,
        ];
        for (let num of nums) {
            const [x, y] = helper.threeBezier(num / maxNum, p1, cp1, cp2, p2);
            result.push({ x, y });
        }
        return result;
    }
    /**
     * Simulate mouse movement
     * @param page
     * @param options
     */
    static async simMouseMove(page, options) {
        const points = this.mouseMovementTrack(options.startPos, options.endPos, options.maxPoints || helper.rd(15, 30), options.cpDelta || 1);
        for (let n = 0; n < points.length; n += 1) {
            const point = points[n];
            await page.mouse.move(point.x, point.y, { steps: helper.rd(1, 2) });
            await helper.sleep((options.timestamp || helper.rd(300, 800)) / points.length);
        }
    }
    get fakeBrowser() {
        // @ts-ignore
        if (!this._fakeBrowser || this._fakeBrowser._zombie) {
            return null;
        }
        // WeakRef:
        // const fb: FakeBrowser | undefined = this._fakeBrowser.deref()
        const fb = this._fakeBrowser;
        if (!fb) {
            this._fakeBrowser = null;
            return null;
        }
        return fb;
    }
    async simMouseMoveTo(endPos, maxPoints, timestamp, cpDelta) {
        const fb = this.fakeBrowser;
        if (!fb) {
            return false;
        }
        if (fb.isMobileBrowser) {
            // We don't need to simulate mouse slide.
            await helper.sleepRd(300, 800);
            return true;
        }
        // Get the current page of the browser
        const currPage = await fb.getActivePage();
        assert(currPage);
        // first move to a close position, then finally move to the target position
        const closeToEndPos = {
            x: endPos.x + helper.rd(5, 30, true),
            y: endPos.y + helper.rd(5, 20, true),
        };
        await FakeUserAction.simMouseMove(currPage, {
            startPos: this._mouseCurrPos,
            endPos: closeToEndPos,
            maxPoints,
            timestamp,
            cpDelta,
        });
        // The last pos must correction
        await currPage.mouse.move(endPos.x, endPos.y, { steps: helper.rd(5, 13) });
        this._mouseCurrPos = endPos;
        return true;
    }
    async simRandomMouseMove() {
        const fb = this.fakeBrowser;
        if (!fb) {
            return false;
        }
        if (fb.isMobileBrowser) {
            // We don't need to simulate mouse slide.
            await helper.sleepRd(200, 500);
            return true;
        }
        const fakeDD = fb.driverParams.fakeDeviceDesc;
        assert(fakeDD);
        const innerWidth = fakeDD.window.innerWidth;
        const innerHeight = fakeDD.window.innerHeight;
        // -----------------
        // |      1/6      |
        // | 1/4      1/4  |
        // |      1/6      |
        // -----------------
        const startX = innerWidth / 4;
        const startY = innerHeight / 6;
        const endX = innerWidth * 3 / 4;
        const endY = innerHeight * 5 / 6;
        const endPos = { x: helper.rd(startX, endX), y: helper.rd(startY, endY) };
        await this.simMouseMoveTo(endPos);
        await helper.sleepRd(300, 800);
        return true;
    }
    async simClick(options = {
        pauseAfterMouseUp: true,
    }) {
        const fb = this.fakeBrowser;
        if (!fb) {
            return false;
        }
        const currPage = await fb.getActivePage();
        assert(currPage);
        if (fb.isMobileBrowser) {
            // We can't use mouse obj, we have to use touchscreen
            await currPage.touchscreen.tap(this._mouseCurrPos.x, this._mouseCurrPos.y);
        }
        else {
            await currPage.mouse.down();
            await helper.sleepRd(30, 80);
            await currPage.mouse.up();
        }
        if (options && options.pauseAfterMouseUp) {
            await helper.sleepRd(150, 600);
        }
        return true;
    }
    async simMoveToAndClick(endPos, options = {
        pauseAfterMouseUp: true,
    }) {
        const fb = this.fakeBrowser;
        if (!fb) {
            return false;
        }
        const currPage = await fb.getActivePage();
        assert(currPage);
        if (!fb.isMobileBrowser) {
            await this.simMouseMoveTo(endPos);
            await currPage.mouse.move(endPos.x + helper.rd(-10, 10), endPos.y, { steps: helper.rd(8, 20) });
        }
        this._mouseCurrPos = endPos;
        await helper.sleepRd(300, 800);
        return this.simClick(options);
    }
    async simMouseMoveToElement(eh) {
        const fb = this.fakeBrowser;
        if (!fb) {
            return false;
        }
        const fakeDD = fb.driverParams.fakeDeviceDesc;
        assert(fakeDD);
        const currPage = await fb.getActivePage();
        assert(currPage);
        let box;
        if (fb.isMobileBrowser) {
            box = await FakeUserAction.adjustElementPositionWithTouchscreen(eh, currPage, fakeDD);
        }
        else {
            box = await FakeUserAction.adjustElementPositionWithMouse(eh, currPage, fakeDD);
        }
        if (box) {
            // The position of each element click should not be the center of the element
            // size of the clicked element must larger than 10 x 10
            const endPos = {
                x: box.x + box.width / 2 + helper.rd(0, 5, true),
                y: box.y + box.height / 2 + helper.rd(0, 5, true),
            };
            await this.simMouseMoveTo(endPos);
            // Pause
            await helper.sleepRd(300, 800);
            return true;
        }
        return false;
    }
    async simClickElement(eh, options = {
        pauseAfterMouseUp: true,
    }) {
        const moveToEl = await this.simMouseMoveToElement(eh);
        if (!moveToEl) {
            return false;
        }
        // click
        if (await this.simClick(options)) {
            return true;
        }
        else {
            return false;
        }
    }
    static async adjustElementPositionWithMouse(eh, currPage, fakeDD) {
        let box = null;
        for (;;) {
            box = await PptrToolkit.boundingBox(eh);
            if (box) {
                // Check the node is in the visible area
                // @ts-ignore
                let deltaX = 0;
                let deltaY = 0;
                let viewportAdjust = false;
                // If the top of the node is less than 0
                if (box.y <= 0) {
                    // deltaY always positive
                    // ---------------------
                    //     30px           |
                    //    [   ]           |
                    // ..         Distance to be moved
                    // ..                 |
                    // ..                 |
                    // ---------------------body top
                    deltaY = Math.min(-(box.y - 30) - 0, helper.rd(150, 300));
                    deltaY = -deltaY;
                    viewportAdjust = true;
                }
                else if (box.y + box.height >= fakeDD.window.innerHeight) {
                    // If the bottom is beyond
                    deltaY = Math.min(box.y + box.height + 30 - fakeDD.window.innerHeight, helper.rd(150, 300));
                    viewportAdjust = true;
                }
                // if (box.x <= 0) {
                //     // If the top of the button is less than 0
                //     deltaX = Math.min(-box.x + 30, sh.rd(100, 400))
                //     deltaX = -deltaX
                //     viewportAdjust = true
                // } else if (box.x + box.width >= fakeDD.window.innerWidth) {
                //     // If the bottom is beyond
                //     deltaX = Math.min(box.x + box.width - fakeDD.window.innerWidth + 30, sh.rd(100, 400))
                //     viewportAdjust = true
                // }
                if (viewportAdjust) {
                    // await currPage.mouse.wheel({deltaX})
                    await currPage.mouse.wheel({ deltaY });
                    await helper.sleepRd(100, 400);
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        }
        return box;
    }
    static async adjustElementPositionWithTouchscreen(eh, currPage, fakeDD) {
        let box = null;
        for (;;) {
            box = await PptrToolkit.boundingBox(eh);
            if (box) {
                // @ts-ignore
                let deltaX = 0;
                let deltaY = 0;
                let viewportAdjust = false;
                if (box.y <= 0) {
                    deltaY = Math.min(-box.y + 30, helper.rd(100, 300));
                    deltaY = -deltaY;
                    viewportAdjust = true;
                }
                else if (box.y + box.height >= fakeDD.window.innerHeight) {
                    deltaY = Math.min(box.y + box.height - fakeDD.window.innerHeight + 30, helper.rd(100, 300));
                    viewportAdjust = true;
                }
                if (viewportAdjust) {
                    // noinspection TypeScriptValidateTypes
                    const _patchTouchscreenDesc = Object.getOwnPropertyDescriptor(currPage, '_patchTouchscreen');
                    assert(_patchTouchscreenDesc);
                    const touchscreen = _patchTouchscreenDesc.value;
                    assert(touchscreen);
                    // if deltaY is negative, drop down, otherwise drop up
                    const startX = fakeDD.window.innerWidth / 2 + helper.rd(0, fakeDD.window.innerWidth / 6);
                    const endX = fakeDD.window.innerWidth / 2 + helper.rd(0, fakeDD.window.innerWidth / 6);
                    let startY;
                    let endY;
                    if (deltaY < 0) {
                        startY = helper.rd(0, fakeDD.window.innerHeight - (-deltaY));
                        endY = startY + deltaY;
                    }
                    else {
                        startY = helper.rd(deltaY, fakeDD.window.innerHeight);
                        endY = startY - deltaY;
                    }
                    await touchscreen.drag({
                        x: startX, y: startY,
                    }, {
                        x: endX, y: endY,
                    });
                    await helper.sleepRd(100, 300);
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        }
        return box;
    }
    async simKeyboardPress(text, options = {
        pauseAfterKeyUp: true,
    }) {
        const fb = this.fakeBrowser;
        if (!fb) {
            return false;
        }
        const currPage = await fb.getActivePage();
        assert(currPage);
        await currPage.keyboard.press(text);
        if (options && options.pauseAfterKeyUp) {
            await helper.sleepRd(300, 1000);
        }
        return true;
    }
    async simKeyboardEnter(options = {
        pauseAfterKeyUp: true,
    }) {
        return await this.simKeyboardPress('Enter', options);
    }
    async simKeyboardEsc(options = {
        pauseAfterKeyUp: true,
    }) {
        return await this.simKeyboardPress('Escape', options);
    }
    async simKeyboardType(text, options = {
        pauseAfterLastKeyUp: true,
    }) {
        const fb = this.fakeBrowser;
        if (!fb) {
            return false;
        }
        const currPage = await fb.getActivePage();
        assert(currPage);
        const needsShiftKey = '~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?';
        // TODO: check if shiftKey, alt, ctrl can be fired in mobile browsers
        for (let ch of text) {
            let needsShift = false;
            if (needsShiftKey.includes(ch)) {
                needsShift = true;
                await currPage.keyboard.down('ShiftLeft');
                await helper.sleepRd(500, 1000);
            }
            // if a Chinese character
            const isCh = ch.match(/^[\u4e00-\u9fa5]/);
            const delay = isCh ? helper.rd(200, 800) : helper.rd(30, 100);
            await currPage.keyboard.type('' + ch, { delay });
            if (needsShift) {
                await helper.sleepRd(150, 450);
                await currPage.keyboard.up('ShiftLeft');
            }
            await helper.sleepRd(30, 100);
        }
        if (options && options.pauseAfterLastKeyUp) {
            await helper.sleepRd(300, 1000);
        }
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFrZVVzZXJBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9GYWtlVXNlckFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRkFBMEY7QUFFMUYsT0FBTyxFQUFDLE1BQU0sSUFBSSxNQUFNLEVBQUMsTUFBTSxRQUFRLENBQUE7QUFJdkMsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQTtBQUUvQixPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFBO0FBSXpDLE1BQU0sT0FBTyxjQUFjO0lBUXZCLFlBQVksRUFBZTtRQUN2QixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBQyxDQUFBO1FBQ2xFLG1EQUFtRDtRQUNuRCxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQTtJQUMxQixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ssTUFBTSxDQUFDLGtCQUFrQixDQUM3QixRQUFlLEVBQ2YsTUFBYSxFQUNiLFNBQVMsR0FBRyxFQUFFLEVBQ2QsT0FBTyxHQUFHLENBQUM7UUFFWCx1RUFBdUU7UUFFdkUsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBQ2IsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFBO1FBRWhCLG1GQUFtRjtRQUNuRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFO1lBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7WUFFakIsK0NBQStDO1lBQy9DLElBQUksQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLEdBQUcsRUFBRSxF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