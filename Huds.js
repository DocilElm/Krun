import { Hud } from "./Hud"

const drawCentered = (str, yPadding = 0) => {
    Renderer.drawStringWithShadow(
        str,
        (Renderer.screen.getWidth() - Renderer.getStringWidth(str.removeFormatting())) / 2,
        (Renderer.screen.getHeight() / 2) + yPadding
        )
}

export class Huds {
    /**
     * @param {{}} obj The module's data object
     * @param {boolean} drawBackground Whether to draw a semi-transparent dark background (`true` by default)
     */
    constructor(obj, drawBackground = true) {
        this.obj = obj
        this.drawBackground = drawBackground
        this.gui = new Gui()
        /** @type {Hud[]} @private */
        this.huds = []
        /** @type {Hud?} @private */
        this._currentHud = null

        // Listeners
        this.gui.registerClicked(this._onClick.bind(this))
        this.gui.registerScrolled(this._onScroll.bind(this))
        // Better for smoother moving
        register("dragged", (dx, dy, _, __, mbtn) => {
            if (!Client.isInGui() || !this.isOpen()) return

            this._onDragged(dx, dy, mbtn)
        })
        this.gui.registerDraw(this._onDraw.bind(this))
    }

    /**
     * * Internal use.
     * * Used to detect which [Hud] was clicked and/or lost focus
     * @private
     */
    _onClick(x, y, mbtn) {
        if (mbtn !== 0) return

        for (let hud of this.huds) {
            if (hud.inBounds(x, y)) {
                this._currentHud = hud
                break
            } else if (this._currentHud) {
                this._currentHud = null
            }
        }
    }

    /**
     * * Internal use.
     * @private
     */
    _onScroll(_, __, dir) {
        if (!this._currentHud) return
        // Do custom resize logic
        if (Client.isShiftDown() && this._currentHud.resizable) {
            if (dir === 1) this._currentHud.width += this._currentHud.resizeJump
            else this._currentHud.width -= this._currentHud.resizeJump
            return
        }
        if (Client.isControlDown() && this._currentHud.resizable) {
            if (dir === 1) this._currentHud.height += this._currentHud.resizeJump
            else this._currentHud.height -= this._currentHud.resizeJump
            return
        }

        if (dir === 1) this._currentHud.scale += 0.02
        else this._currentHud.scale -= 0.02
    }

    /**
     * * Internal use.
     * @private
     */
    _onDragged(dx, dy, mbtn) {
        if (mbtn !== 0) return
        if (!this._currentHud) return
        this._currentHud._onDragged(dx, dy)
    }

    /**
     * * Internal use.
     * @private
     */
    _onDraw(x, y, _) {
        if (this.drawBackground) {
            Renderer.drawRect(
                Renderer.color(0, 0, 0, 150),
                0,
                0,
                Renderer.screen.getWidth(),
                Renderer.screen.getHeight()
            )
        }
        for (let hud of this.huds) {
            hud._triggerDraw(x, y)
            hud._drawOutline()
        }

        if (this._currentHud) {
            drawCentered(`&bCurrently editing&f: &6${this._currentHud.name}`)
            if (this._currentHud.text) drawCentered("&eUse &ascroll wheel&e to scale the text in size", 9)
            else {
                let y = 9
                if (this._currentHud.resizable) {
                    drawCentered("&eUse &ashift&e + &ascroll wheel&e to change the width size", 9)
                    drawCentered("&eUse &actrl&e + &ascroll wheel&e to change the height size", 18)
                    y += 18
                }
                drawCentered("&eUse &ascroll wheel&e to scale the hud in size", y)
            }
        }
    }

    /**
     * * Opens this [Huds] gui
     * @returns this for method chaining
     */
    open() {
        this.gui.open()
        return this
    }

    /**
     * * Closes this [Huds] gui
     * @returns this for method chaining
     */
    close() {
        this.gui.close()
        return this
    }

    /**
     * * Checks whether this [Huds] gui is opened
     * @returns {boolean}
     */
    isOpen() {
        return this.gui.isOpen()
    }

    /**
     * * Saves the data into the [obj]
     * * Note: this does not call `save` in `PogData` you have to do that manually
     * @returns this for method chaining
     */
    save() {
        for (let hud of this.huds) hud._save(this.obj)
        return this
    }

    /**
     * * Makes a hud that can be dragged and scaled
     * @param {string} name
     * @param {number?} x
     * @param {number?} y
     * @param {number?} width
     * @param {number?} height
     * @returns {Hud}
     */
    createHud(name, x = 0, y = 0, width = 0, height = 0) {
        const hud = new Hud(name, this.obj[name] ?? { x, y, width, height })
        this.huds.push(hud)
        return hud
    }

    /**
     * * Makes a hud that can be dragged and scaled as well as having custom resize logic
     * * i.e. if you `shift` + `scroll` it'll make the `width` go up/down, same with `ctrl` + `scroll` it'll do the same with `height`
     * @param {string} name
     * @param {number?} x
     * @param {number?} y
     * @param {number?} width
     * @param {number?} height
     * @returns {Hud}
     */
    createResizableHud(name, x = 0, y = 0, width = 0, height = 0) {
        const hud = new Hud(name, this.obj[name] ?? { x, y, width, height })
        hud.resizable = true
        this.huds.push(hud)
        return hud
    }

    /**
     * * Makes a hud that can be dragged and scaled for strings
     * @param {string} name
     * @param {number?} x
     * @param {number?} y
     * @param {string} text
     * @returns {Hud}
     */
    createTextHud(name, x = 0, y = 0, text) {
        const hud = new Hud(name, this.obj[name] ?? { x, y }, text)
        this.huds.push(hud)
        return hud
    }
}