export class Hud {
    constructor(name, obj, text) {
        this.name = name
        /** @private */
        this.x = obj.x ?? 0
        /** @private */
        this.y = obj.y ?? 0
        /** @private */
        this.scale = obj.scale ?? 1
        /** @private */
        this.width = obj.width ?? 0
        /** @private */
        this.height = obj.height ?? 0
        this.text = text
        /** @private */
        this.resizable = false
        /**
         * * Change this field if you want the custom resize to change more height/width
         * * Default value is `1`
         */
        this.resizeJump = 1

        /** @private */
        this._onDraw = null
        /** @private */
        this._hasFocus = false
        /** @private */
        this._hovering = false
        /** @private */
        this._normalOutline = Renderer.color(70, 70, 70)
        /** @private */
        this._hoverOutline = Renderer.color(150, 150, 150)

        if (this.text) this._getTextSize()
    }

    /**
     * * Adds a listeners that triggers whenever this [Hud] is being drawn in the editing gui
     * * Note: if the hud is a `Text Hud` the params will be: `(x, y, text)` otherwise: `(x, y, width, height)`
     * @param {(x: number, y: number, text: string?, width: number?, heigt: number?) => void} cb 
     */
    onDraw(cb) {
        this._onDraw = cb
    }

    /**
     * @returns {number}
     */
    getX() {
        return this.x ?? 0
    }

    /**
     * @returns {number}
     */
    getY() {
        return this.y ?? 0
    }

    /**
     * @returns {number}
     */
    getWidth() {
        return this.width ?? 0
    }

    /**
     * @returns {number}
     */
    getHeight() {
        return this.height ?? 0
    }

    /**
     * @returns {number}
     */
    getScale() {
        return this.scale ?? 1
    }

    /**
     * * Gets the position of this [Hud] taking into consideration the scale factor
     * @returns {number[]}
     */
    getPos() {
        return [ this.x, this.y, this.width * this.scale, this.height * this.scale ]
    }

    /**
     * * Gets the boundaries of this [Hud]
     * * Note: the scaling factor is only applied to the `width` and `height`
     * @returns {number[]}
     */
    getBounds() {
        return [
            this.x,
            this.y,
            this.x + this.width * this.scale,
            this.y + this.height * this.scale
        ]
    }

    /**
     * * Checks whether the given `x, y` are in the bounds of this [Hud]
     * @returns {boolean}
     */
    inBounds(x, y) {
        const [ x1, y1, x2, y2 ] = this.getBounds()
        return x >= x1 && x <= x2 && y >= y1 && y <= y2
    }

    /** @private */
    _getTextSize() {
        this.width = Renderer.getStringWidth(this.text) * this.scale
        const m = this.text.match(/\n/g)
        if (m == null) return this.height = 9 * this.scale
        this.height = (9 * (m.length + 1)) * this.scale
        this.width = 0
        this.text.split("\n").forEach((it) => {
            this.width = Math.max(this.width, Renderer.getStringWidth(it) * this.scale)
        })
    }

    /** @private */
    _save(obj) {
        obj[this.name] = {
            x: this.getX(),
            y: this.getY(),
            scale: this.getScale(),
            width: this.getWidth(),
            height: this.getHeight()
        }
    }

    /** @private */
    _drawOutline() {
        Renderer.translate(this.x, this.y)
        Renderer.scale(this.scale)
        Renderer.setDrawMode(2)
        Renderer.drawRect(
            this._hovering ? this._hoverOutline : this._normalOutline,
            -1, -1, this.width + 2, this.height + 2
        )
        Renderer.finishDraw()
    }

    /** @private */
    _triggerDraw(x, y) {
        if (this._onDraw) {
            if (!this.text) this._onDraw(this.x, this.y, this.width, this.height)
            else this._onDraw(this.x, this.y, this.text)
        }
        this._hovering = this.inBounds(x, y)
    }

    /** @private */
    _onDragged(dx, dy) {
        this.x = Math.max(0, Math.min(this.x + dx, Renderer.screen.getWidth() - this.width))
        this.y = Math.max(0, Math.min(this.y + dy, Renderer.screen.getHeight() - this.height))
    }
}