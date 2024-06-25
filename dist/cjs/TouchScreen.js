"use strict";
// noinspection JSUnusedGlobalSymbols
Object.defineProperty(exports, "__esModule", { value: true });
exports.Touchscreen = void 0;
class Touchscreen {
    constructor(client, keyboard) {
        this.client = client;
        this.keyboard = keyboard;
        this._x = 0;
        this._y = 0;
        this._button = 'none';
    }
    async move(x, y, options = {}) {
        const { steps = 1 } = options;
        const fromX = this._x, fromY = this._y;
        this._x = x;
        this._y = y;
        for (let i = 1; i <= steps; i++) {
            await this.client.send('Input.emulateTouchFromMouseEvent', {
                type: 'mouseMoved',
                button: this._button,
                x: fromX + (this._x - fromX) * (i / steps),
                y: fromY + (this._y - fromY) * (i / steps),
                modifiers: this.keyboard._modifiers,
            });
        }
    }
    async tap(x, y, options = {}) {
        const { delay = null } = options;
        if (delay !== null) {
            await this.move(x, y);
            await this.down(options);
            await new Promise((f) => setTimeout(f, delay));
            await this.up(options);
        }
        else {
            await this.move(x, y);
            await this.down(options);
            await this.up(options);
        }
    }
    async down(options = {}) {
        const { button = 'left', clickCount = 1 } = options;
        this._button = button;
        await this.client.send('Input.emulateTouchFromMouseEvent', {
            type: 'mousePressed',
            button,
            x: this._x,
            y: this._y,
            modifiers: this.keyboard._modifiers,
            clickCount,
        });
    }
    async up(options = {}) {
        const { button = 'left', clickCount = 1 } = options;
        this._button = 'none';
        await this.client.send('Input.emulateTouchFromMouseEvent', {
            type: 'mouseReleased',
            button,
            x: this._x,
            y: this._y,
            modifiers: this.keyboard._modifiers,
            clickCount,
        });
    }
    async drag(start, target) {
        await this.move(start.x, start.y);
        await this.down();
        await this.move(target.x, target.y, {
            steps: Math.min(Math.abs(start.x - target.x), Math.abs(start.y - target.y)) / 1.5,
        });
        await this.up();
    }
}
exports.Touchscreen = Touchscreen;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG91Y2hTY3JlZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9Ub3VjaFNjcmVlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUNBQXFDOzs7QUFJckMsTUFBYSxXQUFXO0lBS3BCLFlBQ3FCLE1BQWtCLEVBQ2xCLFFBQWtCO1FBRGxCLFdBQU0sR0FBTixNQUFNLENBQVk7UUFDbEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQU4vQixPQUFFLEdBQVcsQ0FBQyxDQUFBO1FBQ2QsT0FBRSxHQUFXLENBQUMsQ0FBQTtRQUNkLFlBQU8sR0FBeUIsTUFBTSxDQUFBO0lBTTlDLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUNOLENBQVMsRUFDVCxDQUFTLEVBQ1QsVUFBOEIsRUFBRTtRQUVoQyxNQUFNLEVBQUMsS0FBSyxHQUFHLENBQUMsRUFBQyxHQUFHLE9BQU8sQ0FBQTtRQUMzQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFBO1FBQ3RDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFFWCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdCLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLEVBQUU7Z0JBQ3ZELElBQUksRUFBRSxZQUFZO2dCQUNsQixNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU87Z0JBQ3BCLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDMUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFD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