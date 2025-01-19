# Krun
Krun is a chattriggers library that is meant to help give a better user experience when editing multiple huds at a time.

# Usage
There is an `example.js` on how to use it as well.<br>
You'll need to have a `PogObject` (or an object) where your data will be saved.
```js
// Import huds from [Krun]
import { Huds } from "../Krun/Huds"

// Make a new pogobject (or use one you already have created)
const data = new PogObject("Krun", {})
// Create a new [Huds] class instance
// This one is important because it'll handle everything
const huds = new Huds(data)
```

Now with that set up we can then start creating our huds without worrying about them being draggable/scalable<br>
```js
const data = new PogObject("Krun", {})
const huds = new Huds(data)

// Creating our own huds that we will use
const normalHud = huds.createHud("test", 10, 10, 100, 50)
const textHud = huds.createTextHud("test2", 120, 10, "&aThis is\n&cA &4Test\n&bThis might be a bigger text\n&2Not this one though")
const resizableHud = huds.createResizableHud("test3", 200, 10, 100, 50)

// These are the default displaying values
// (the ones that will be displayed when the main hud gui is opened to edit them)
normalHud.onDraw((x, y, width, height) => {
    Renderer.translate(x, y)
    Renderer.scale(normalHud.getScale())
    Renderer.drawRect(
        Renderer.color(0, 150, 150),
        0, 0, width, height
    )
    Renderer.finishDraw()
})
textHud.onDraw((x, y, str) => {
    Renderer.translate(x, y)
    Renderer.scale(textHud.getScale())
    Renderer.drawStringWithShadow(str, 0, 0)
    Renderer.finishDraw()
})
resizableHud.onDraw((x, y, width, height) => {
    Renderer.translate(x, y)
    Renderer.scale(resizableHud.getScale())
    Renderer.drawRect(
        Renderer.color(0, 150, 0),
        0, 0, width, height
    )
    Renderer.finishDraw()
})

// Creating a command to open our main [Huds] gui so every other [Hud] can be edited
register("command", () => {
    huds.open()
}).setName("hudstest")

register("renderOverlay", () => {
    // Check whether the [Huds] is opened, if it is return
    // we don't need to render twice
    if (huds.isOpen()) return

    // Drawing normal hud
    const [ x1, y1, x2, y2 ] = normalHud.getPos()
    // NOTE: it is recommended to use the `getPos()` if you are only drawing one item
    // otherwise, translate and scale the stack.
    Renderer.drawRect(Renderer.color(255, 255, 255), x1, y1, x2, y2)

    // Drawing resizable hud
    const [ x3, y3, x4, y4 ] = resizableHud.getPos()
    Renderer.drawRect(Renderer.color(0, 0, 0), x3, y3, x4, y4)

    // Drawing text hud
    Renderer.translate(textHud.getX(), textHud.getY())
    Renderer.scale(textHud.getScale())
    Renderer.drawStringWithShadow(textHud.text, 0, 0)
    Renderer.finishDraw()
})

register("gameUnload", () => {
    // We have to manually call save here
    // so that all our data gets synced properly and then saved
    huds.save()
    data.save()
})
```

# License
Krun is licensed under the [AGPL 3.0 License](https://github.com/DocilElm/Krun/blob/main/LICENSE)
