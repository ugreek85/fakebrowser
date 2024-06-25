"use strict";
// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols,PointlessArithmeticExpressionJS
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeUserAction = void 0;
const assert_1 = require("assert");
const helper_1 = require("./helper");
const PptrToolkit_1 = require("./PptrToolkit");
class FakeUserAction {
    constructor(fb) {
        this._mouseCurrPos = { x: helper_1.helper.rd(0, 1280), y: helper_1.helper.rd(0, 700) };
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
                moveStep += helper_1.helper.rd(60, 100);
            }
            else if (n >= maxPoints * 9 / 10) {
                moveStep -= helper_1.helper.rd(60, 100);
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
            (startPos.x + endPos.x) / 2 + helper_1.helper.rd(30, 100, true) * cpDelta,
            (startPos.y + endPos.y) / 2 + helper_1.helper.rd(30, 100, true) * cpDelta,
        ];
        const cp2 = [
            (startPos.x + endPos.x) / 2 + helper_1.helper.rd(30, 100, true) * cpDelta,
            (startPos.y + endPos.y) / 2 + helper_1.helper.rd(30, 100, true) * cpDelta,
        ];
        const p2 = [
            endPos.x,
            endPos.y,
        ];
        for (let num of nums) {
            const [x, y] = helper_1.helper.threeBezier(num / maxNum, p1, cp1, cp2, p2);
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
        const points = this.mouseMovementTrack(options.startPos, options.endPos, options.maxPoints || helper_1.helper.rd(15, 30), options.cpDelta || 1);
        for (let n = 0; n < points.length; n += 1) {
            const point = points[n];
            await page.mouse.move(point.x, point.y, { steps: helper_1.helper.rd(1, 2) });
            await helper_1.helper.sleep((options.timestamp || helper_1.helper.rd(300, 800)) / points.length);
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
            await helper_1.helper.sleepRd(300, 800);
            return true;
        }
        // Get the current page of the browser
        const currPage = await fb.getActivePage();
        (0, assert_1.strict)(currPage);
        // first move to a close position, then finally move to the target position
        const closeToEndPos = {
            x: endPos.x + helper_1.helper.rd(5, 30, true),
            y: endPos.y + helper_1.helper.rd(5, 20, true),
        };
        await FakeUserAction.simMouseMove(currPage, {
            startPos: this._mouseCurrPos,
            endPos: closeToEndPos,
            maxPoints,
            timestamp,
            cpDelta,
        });
        // The last pos must correction
        await currPage.mouse.move(endPos.x, endPos.y, { steps: helper_1.helper.rd(5, 13) });
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
            await helper_1.helper.sleepRd(200, 500);
            return true;
        }
        const fakeDD = fb.driverParams.fakeDeviceDesc;
        (0, assert_1.strict)(fakeDD);
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
        const endPos = { x: helper_1.helper.rd(startX, endX), y: helper_1.helper.rd(startY, endY) };
        await this.simMouseMoveTo(endPos);
        await helper_1.helper.sleepRd(300, 800);
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
        (0, assert_1.strict)(currPage);
        if (fb.isMobileBrowser) {
            // We can't use mouse obj, we have to use touchscreen
            await currPage.touchscreen.tap(this._mouseCurrPos.x, this._mouseCurrPos.y);
        }
        else {
            await currPage.mouse.down();
            await helper_1.helper.sleepRd(30, 80);
            await currPage.mouse.up();
        }
        if (options && options.pauseAfterMouseUp) {
            await helper_1.helper.sleepRd(150, 600);
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
        (0, assert_1.strict)(currPage);
        if (!fb.isMobileBrowser) {
            await this.simMouseMoveTo(endPos);
            await currPage.mouse.move(endPos.x + helper_1.helper.rd(-10, 10), endPos.y, { steps: helper_1.helper.rd(8, 20) });
        }
        this._mouseCurrPos = endPos;
        await helper_1.helper.sleepRd(300, 800);
        return this.simClick(options);
    }
    async simMouseMoveToElement(eh) {
        const fb = this.fakeBrowser;
        if (!fb) {
            return false;
        }
        const fakeDD = fb.driverParams.fakeDeviceDesc;
        (0, assert_1.strict)(fakeDD);
        const currPage = await fb.getActivePage();
        (0, assert_1.strict)(currPage);
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
                x: box.x + box.width / 2 + helper_1.helper.rd(0, 5, true),
                y: box.y + box.height / 2 + helper_1.helper.rd(0, 5, true),
            };
            await this.simMouseMoveTo(endPos);
            // Pause
            await helper_1.helper.sleepRd(300, 800);
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
            box = await PptrToolkit_1.PptrToolkit.boundingBox(eh);
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
                    deltaY = Math.min(-(box.y - 30) - 0, helper_1.helper.rd(150, 300));
                    deltaY = -deltaY;
                    viewportAdjust = true;
                }
                else if (box.y + box.height >= fakeDD.window.innerHeight) {
                    // If the bottom is beyond
                    deltaY = Math.min(box.y + box.height + 30 - fakeDD.window.innerHeight, helper_1.helper.rd(150, 300));
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
                    await helper_1.helper.sleepRd(100, 400);
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
            box = await PptrToolkit_1.PptrToolkit.boundingBox(eh);
            if (box) {
                // @ts-ignore
                let deltaX = 0;
                let deltaY = 0;
                let viewportAdjust = false;
                if (box.y <= 0) {
                    deltaY = Math.min(-box.y + 30, helper_1.helper.rd(100, 300));
                    deltaY = -deltaY;
                    viewportAdjust = true;
                }
                else if (box.y + box.height >= fakeDD.window.innerHeight) {
                    deltaY = Math.min(box.y + box.height - fakeDD.window.innerHeight + 30, helper_1.helper.rd(100, 300));
                    viewportAdjust = true;
                }
                if (viewportAdjust) {
                    // noinspection TypeScriptValidateTypes
                    const _patchTouchscreenDesc = Object.getOwnPropertyDescriptor(currPage, '_patchTouchscreen');
                    (0, assert_1.strict)(_patchTouchscreenDesc);
                    const touchscreen = _patchTouchscreenDesc.value;
                    (0, assert_1.strict)(touchscreen);
                    // if deltaY is negative, drop down, otherwise drop up
                    const startX = fakeDD.window.innerWidth / 2 + helper_1.helper.rd(0, fakeDD.window.innerWidth / 6);
                    const endX = fakeDD.window.innerWidth / 2 + helper_1.helper.rd(0, fakeDD.window.innerWidth / 6);
                    let startY;
                    let endY;
                    if (deltaY < 0) {
                        startY = helper_1.helper.rd(0, fakeDD.window.innerHeight - (-deltaY));
                        endY = startY + deltaY;
                    }
                    else {
                        startY = helper_1.helper.rd(deltaY, fakeDD.window.innerHeight);
                        endY = startY - deltaY;
                    }
                    await touchscreen.drag({
                        x: startX, y: startY,
                    }, {
                        x: endX, y: endY,
                    });
                    await helper_1.helper.sleepRd(100, 300);
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
        (0, assert_1.strict)(currPage);
        await currPage.keyboard.press(text);
        if (options && options.pauseAfterKeyUp) {
            await helper_1.helper.sleepRd(300, 1000);
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
        (0, assert_1.strict)(currPage);
        const needsShiftKey = '~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?';
        // TODO: check if shiftKey, alt, ctrl can be fired in mobile browsers
        for (let ch of text) {
            let needsShift = false;
            if (needsShiftKey.includes(ch)) {
                needsShift = true;
                await currPage.keyboard.down('ShiftLeft');
                await helper_1.helper.sleepRd(500, 1000);
            }
            // if a Chinese character
            const isCh = ch.match(/^[\u4e00-\u9fa5]/);
            const delay = isCh ? helper_1.helper.rd(200, 800) : helper_1.helper.rd(30, 100);
            await currPage.keyboard.type('' + ch, { delay });
            if (needsShift) {
                await helper_1.helper.sleepRd(150, 450);
                await currPage.keyboard.up('ShiftLeft');
            }
            await helper_1.helper.sleepRd(30, 100);
        }
        if (options && options.pauseAfterLastKeyUp) {
            await helper_1.helper.sleepRd(300, 1000);
        }
        return true;
    }
}
exports.FakeUserAction = FakeUserAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFrZVVzZXJBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9GYWtlVXNlckFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMEZBQTBGOzs7QUFFMUYsbUNBQXVDO0FBSXZDLHFDQUErQjtBQUUvQiwrQ0FBeUM7QUFJekMsTUFBYSxjQUFjO0lBUXZCLFlBQVksRUFBZTtRQUN2QixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUMsQ0FBQyxFQUFFLGVBQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxlQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBQyxDQUFBO1FBQ2xFLG1EQUFtRDtRQUNuRCxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQTtJQUMxQixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ssTUFBTSxDQUFDLGtCQUFrQixDQUM3QixRQUFlLEVBQ2YsTUFBYSxFQUNiLFNBQVMsR0FBRyxFQUFFLEVBQ2QsT0FBTyxHQUFHLENBQUM7UUFFWCx1RUFBdUU7UUFFdkUsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBQ2IsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFBO1FBRWhCLG1GQUFtRjtRQUNuRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFO1lBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7WUFFakIsK0NBQStDO1lBQy9DLElBQUksQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUN4QixRQUFRLElBQUksZUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7YUFDakM7aUJBQU0sSUFBSSxDQUFDLElBQUksU0FB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