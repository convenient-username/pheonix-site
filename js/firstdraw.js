document.addEventListener('DOMContentLoaded', function () {

    /** @type { import("fabric/fabric-impl") } */
    const fabric = window.fabric;

    const layers = {
        BACKGROUND: 0,

        VIEWMIN: 90,
        VIEWBACKGROUND: 100,
        VIEWITEMS: 150,
        VIEWMAX: 190,

        UIMIN: 200,
        UI_BACKGROUND: 210,
        BUTTONS: 220,
        BUTTON_TEXT: 230,
        UIMAX: 300,

        DEBUG: 99990
    };


    const utils = {
        toggle(e) {
            variable = this.variable
            if (game.getVar(variable) == true) {
                game.setVar(variable, false)
            }
            else {
                game.setVar(variable, true)
            }
        }

    }
    class Game {
        constructor() {
            this.background = null
            // Resize canvas to fit screen
            this.resizeCanvas();
            this.vars = new Map()
            this.listeners = new Map()
            this.vars.set('locked', true)
        }
        setVar(variable, value) {
            this.vars.set(variable, value)
            this.listeners.get(variable).forEach(listener => {
                listener.onListen(variable, value)
            });
        }
        getVar(vairable) {
            return this.vars.get(vairable)
        }
        registerListener(item, variable) {
            if (this.listeners.get(variable) === undefined) {
                this.listeners.set(variable, [item])
            }
            else {
                this.listeners.get(variable).push(item)
            }
        }
        addImage(object, layer) {
            const objects = canvas.getObjects();
            let targetIndex = objects.length;
            for (let i = 0; i < objects.length; i++) {
                if (layer < objects[i].customLayer) {
                    targetIndex = i;
                    break;
                }
            }
            object.set({ customLayer: layer })
            canvas.insertAt(object, targetIndex);
        }
        setBackground(img) {
            this.background = img
            this.addImage(img, layers.VIEWBACKGROUND)
        }
        resizeCanvas() {
            canvas.setHeight(window.innerHeight);
            canvas.setWidth(window.innerWidth);
            canvas.renderAll();
        }
        setPosition(position) {
            this.currentPosition = position
        }
        unloadElement(element) {
            setTimeout(function () { canvas.remove(element) }, 100)
        }
        unloadView() {
            const objects = canvas.getObjects();
            objects.forEach(object => {
                if (object.customLayer >= layers.VIEWMIN && object.customLayer <= layers.VIEWMAX) {
                    this.unloadElement(object)
                }
            });
        }
    }

    class Dialogue {
        constructor(dialogueJson) {
            this.currentLine = 0
            this.story = dialogueJson.story
            this.setup = false

        }
        find_label(nextLabel) {
            return this.story.findIndex(step => step.label == nextLabel)
        }

        get_line()
        {
            var line = this.story[this.currentLine] 
            var message = null
            var answers = []
            var index = this.currentLine
            // If no message, is end
            if (line.m == undefined)
            {
                message = "DONE"
            }
            // Otherwise, we set the message
            else
            {
                message = line.m
            }
            // If we have responses, this is a question
            if (line.answers !== undefined)
            {
                answers = line.answers
            }
            else  // Else we advance to the specified label, or by one if none specified
            {
                var nextStep = this.currentLine + 1

                if (line.next != undefined)
                {
                    nextStep = line.next
                }
                answers = [{m: 'Continue', next: nextStep}]
            }
            return [message, answers, index]
        }
        get_responses()
        {
            return this.story[this.currentLine].answers
        }
        respond(label) // If given an int, set to that index, elif given a string, set to index with label matching string
        {
            if (typeof(label) == typeof(1)){
                this.currentLine = label
            }
            else{
            var newIndex = this.find_label(label)
                this.currentLine = newIndex
            }
        }
    }


    class World {
        constructor() {
            this.currentPosition = null
            this.items = Array()
        }
        registerItem(item) {
            this.items.push(item)
            return item
        }
        getItem(name) {
            return this.items.find(item => item.name === name)
        }
    }

    class Controls {
        constructor(parent = null) {
            this.parent = parent
            this.layer = layers.UI_BACKGROUND
            this.elements = []

            if (this.parent == null){
                this.top = canvas.height
                this.left = 0
                this.width = canvas.width
                this.height = 200
            }
            else{
                this.top = parent.top
                this.left = parent.left
                this.width = parent.width
                this.height = parent.height / 5
                this.layer = parent.layer + 1
            }
            this.buttons = Array()
            this.color = 'tan'
            this.image = null
        }

        addButton(button) {
            button.index = this.buttons.length
            button.parent = this
            this.buttons.push(button)
        }

        render() {
            if (this.image == null)
            {
                var background = new fabric.Rect({
                    width: this.width,
                    height: this.height,
                    originY: 'bottom',
                    top: this.top,
                    left: this.left,
                    fill: this.color
                });
    
                this.image = background
                game.addImage(background, this.layer)
            }
            this.buttons.forEach(button => {
                button.render()
            });

        }
        getElements(){
            var elements = []
            this.buttons.forEach(button => {
                if (button.element !== null)
                {
                    elements.push(button.element)
                }
            });
            if (this.image !== null)
            {
                elements.push(this.image)
            }
            return elements
        }
        clear(){
            this.buttons.forEach(button => {
                button.remove()
            });
            this.buttons = Array()
        }

    }
    class Button { 
        constructor(onClick = function(){console.log("You clicked on an abstract button?\nWhat was that doingthere?")}) {
            this.onClick = onClick
            this.parent = null
            this.index = null
            this.element = null
            this.layer = parent.layer + 1

            this.top = parent.top
            this.left = parent.left
        }

        render() {
            var element = new fabric.Rect({
                width: 100,
                height: 100,
                originY: 'top',
                top: this.top,
                left: this.left,
                fill: 'black',
                opacity: .2
            })
            this.onSet(element)
        }

        onSet(img)
        {
            img.set({
                left: this.parent.left + this.index * 150 + 20,
                top: this.parent.top - this.parent.height / 2,
                originY: 'center'
            });

            img.on('mousedown', () => {
                this.onClick();
            });

            game.addImage(img, this.layer);
            this.element = img
        }

        remove(){
            game.unloadElement(this.element)
        }
    }

    class ImageButton extends Button {
        constructor(iconUrl, onClick) {
            super(onClick)
            this.iconUrl = iconUrl
        }

        render() {
            fabric.Image.fromURL(this.iconUrl, this.onSet.bind(this))
        }
    }

    class TextButton extends Button{
        constructor(text, onClick) {
            super(onClick)
            this.text = text
        }

        render() {
            var element = new fabric.Textbox(this.text, {
                width: 100,
                height: 100,
                originY: 'top',
                top: this.top,
                left: this.left,
                fill: 'black',
                opacity: 1

            })

            this.onSet(element)
        
        }
    }

    class Position {
        constructor(folderUrl, viewcount) {
            this.folder = folderUrl
            this.viewcount = viewcount
            this.currentView = null;
            this.views = []
            for (let i = 0; i < viewcount; i++) {
                var view = new View(i, this.folder)
                this.views.push(view)
            }

            this.setView(0)

        }
        setView(viewIndex) {
            if (this.currentView !== null) {
                this.currentView.unload()
            }
            this.currentView = this.views[viewIndex]
            this.currentView.load()
        }
        rotateLeft() {
            var viewIndex = this.currentView.angle
            if (this.currentView.angle == 0) {
                viewIndex = this.viewcount - 1
            }
            else {
                viewIndex -= 1
            }
            this.setView(viewIndex)
        }
        rotateRight() {
            var viewIndex = this.currentView.angle
            if (viewIndex == this.viewcount - 1) {
                viewIndex = 0
            }
            else {
                viewIndex += 1
            }
            this.setView(viewIndex)
        }
    }

    class View {
        constructor(angle, parenturl) {
            this.angle = angle
            this.url = parenturl + '/' + String(angle)
            this.imgUrl = this.url + "/background.jpg"
            this.itemsUrl = this.url + "/items/items.json"
            this.items = Array()
            fetch(this.itemsUrl)
                .then((response) => response.json())
                .then((json) =>
                    json.items.forEach(itemdata => {
                        var item = world.getItem(itemdata.name)
                        item.croppedBoxes[this.angle] = itemdata.croppedBox
                        this.items.push(item)
                    })
                ).catch((e) => console.error(e));
        }
        registerItem(item, imgUrl, position) {
            this.items.push(item, imgUrl, position);
        }
        load() // Only call when is current view.
        {
            // Add background
            fabric.Image.fromURL(this.imgUrl, (function (img) {
                var view = game.currentPosition.currentView // Gives "this" as long as we are the current view, TODO: fix. Bind? 

                img.scaleToWidth(1500);
                game.setBackground(img);

                view.loadItems()
            }))
        }

        loadItems() {
            // Add items

            this.items.forEach(item => {
                item.currentUrl = this.url + "/items/" + item.name + ".png"
                item.croppedBox = item.croppedBoxes[this.angle]
                item.load()
            });
        }
        unload() {
            game.unloadView()
        }
    }

    class Item {
        constructor(name, onClick = function () { console.log("Clicked on ITEM ", this.name) }) {
            this.currentUrl = ""
            this.name = name
            this.onClick = onClick
            this.croppedBoxes = Array()
            this.imgUrls = Array()
            this.croppedBox = null
            this.iconUrl = "icons/" + this.name + ".png"
            this.nameModifier = ""
            this.currentImage = null
            this.onClick()
        }

        getCropBox() {
            return this.croppedBoxes[game.currentPosition.currentView.angle]
        }
        getImgUrl() {
            var view = game.currentPosition.currentView
            return view.url + "/items/" + this.name + this.nameModifier + ".png"
        }
        load() {
            var cropBox = this.getCropBox()
            var _this = this

            fabric.Image.fromURL(this.getImgUrl(), function (img) {
                if (_this.currentImage != null) {
                    game.unloadElement(_this.currentImage)
                }
                _this.currentImage = img
                img.perPixelTargetFind = true

                img.left = cropBox[0] * game.background.scaleX
                img.top = cropBox[1] * game.background.scaleY
                img.scaleToWidth((cropBox[2] - cropBox[0]) * game.background.scaleX)
                game.addImage(img, layers.VIEWITEMS);

                img.on('mouseover', function (e) {
                    _this.onMouseover(e)
                });
                img.on('mouseout', function (e) {
                    _this.onMouseout(e)
                });
                img.on('mousedown', function (e) {
                    _this.onClick(e)
                });
            });
        }
        onMouseover(e) {
            var item = e.target
            var filter = new fabric.Image.filters.Brightness({
                brightness: .25
              });
            item.filters.push(filter)
            item.applyFilters()
            canvas.renderAll()
        }
        onMouseout(e)
        {
            var item = e.target

            item.filters = []
            item.applyFilters()
            canvas.renderAll()
        }
        onListen(variable, value) {
            console.log("Item " + this.name + " has heard variable", variable, "being set to ", value)
        }
    }

    class Collectable extends Item {
        constructor(name) {
            super(name)
            this.onClick = this.collect
        }
        collect(e) {
            var message = new DialogueMessageBox("Ooh look, a " + this.name + "! \n Located at " + this.currentUrl, this.currentUrl, new Dialogue("./story.json"))
            message.display()
        }
    }

    class Interactable extends Item {
        constructor(name, variable, onClick = console.log("U CLICKED AN UNSET INTERACTABLE U LITTLE SHIT")) {
            super(name)
            this.onClick = onClick
            this.variable = variable
        }
    }
    class MessageBox {
        constructor(message = "Unset", icon = "icons/kettle.png") {
            this.message = message
            this.width = 750
            this.height = 300
            this.top = 1000
            this.left = 300
            this.iconUrl = icon
            this.layer = layers.UI_BACKGROUND
            this.messageElement = null
            this.elements = Array()
            this.controls = null
        }
        display() {
            var background = new fabric.Rect({
                width: this.width,
                height: this.height,
                originY: 'bottom',
                top: this.top,
                left: this.left,
                fill: 'white',
            })
            var text = new fabric.Textbox(this.message, {
                width: this.width,
                height: this.height,
                originY: 'center',
                top: this.top - this.height / 2,
                left: this.left + this.width / 20,
                fill: 'black',
                textAlign: 'left'

            })
            var blur = new fabric.Rect({
                width: 10000,
                height: 10000,
                originY: 'top',
                top: 0,
                left: 0,
                fill: 'black',
                opacity: .2
            })
            var box = this
            fabric.Image.fromURL(this.iconUrl, img => {
                img.set({
                    left: box.left + box.width,
                    top: box.top - box.height,
                    originY: 'top',
                    originX: 'right'
                });

                box.addElement(img, layers.BUTTONS)
            });

            blur.on('mousedown', () => {
                this.remove()
            });

            this.controls = new Controls(this)

            this.controls.render()
            
            this.addElement(background, layers.UI_BACKGROUND)
            this.messageElement = text
            this.addElement(text, layers.BUTTON_TEXT)
            this.addElement(blur, layers.UIMIN)
        }

        addElement(element, layer) {
            this.elements.push(element)
            game.addImage(element, layer)
        }

        remove() {
            this.elements.forEach(element => {
                game.unloadElement(element)
            });
            if (this.controls !== null){
                this.controls.getElements().forEach(element => {
                    game.unloadElement(element)
                });
            }
        }

        setMessage(message)
        {
            this.message = message
            if (this.messageElement !== null){
                this.messageElement.set({text:message})
            }
            console.log(message)
        }
    }
        class DialogueMessageBox extends MessageBox {
            constructor(message = "Unset", icon = "icons/kettle.png", dialogue) {
                super(message, icon)

                this.dialogue = dialogue
                
            }
            display() {
                super.display()
                 var _afterDialogueSetup = function(){
                    var message
                    var answers
                    var index
                    var line = this.dialogue.get_line()
                    message  = line[0]
                    answers  = line[1]
                    index    = line[2]

                    this.setAnswers(answers)
                    this.setMessage(message)
                }.bind(this)

                var _this = this
                fetch("./story.json")
                .then((response) => response.json())
                .then((json) => {
                    _this.dialogue = new Dialogue(json)
                }
                ).catch((e) => console.error(e)
                ).then(_afterDialogueSetup);
    
            }

            dialogueAdvanced(answer)
            {
                // In the case it's a question with only one answer, it will just go to the next line
                if (answer.next == undefined)
                {
                    answer.next = this.dialogue.currentLine + 1
                }

                this.dialogue.respond(answer.next)
                var message
                var answers
                var index
                var line = this.dialogue.get_line()
                message  = line[0]
                answers  = line[1]
                index    = line[2]

                if (message == "DONE"){
                    this.onDialogueComplete()
                }
                else{
                    console.log(line)
                    this.setMessage(message)
                    this.setAnswers(answers)
                }
            }
            setAnswers(answers)
            {
                this.controls.clear()
                answers.forEach(answer => {
                    var button = new TextButton(answer.m, function(){this.dialogueAdvanced(answer)}.bind(this), this.controls)
                    this.controls.addButton(button)
                });
                this.controls.render()
            }
            
            onDialogueComplete()
            {
                this.remove()
            }
            remove() {
                this.elements.forEach(element => {
                    game.unloadElement(element)
                });
                if (this.controls !== null){
                    this.controls.getElements().forEach(element => {
                        game.unloadElement(element)
                    });
                }
            }
    }

    ////
    // BASIC SETUP
    ////

    // create `Canvas` object using `<canvas>` DOM node
    const canvas = new fabric.Canvas('game', { backgroundColor: "grey", room: null })


    const game = new Game()
    const world = new World()

    function rotateLeft() {
        game.currentPosition.rotateLeft()
    }
    function rotateRight() {
        game.currentPosition.rotateRight()
    }

    const controls = new Controls()
    const leftArrow = new ImageButton('./images/left.png', rotateLeft)
    const rightArrow = new ImageButton('./images/right.png', rotateRight)

    controls.addButton(leftArrow)
    controls.addButton(rightArrow)
    controls.render()
    
    ////
    // POSITION SETUP
    ////

    game.setPosition(new Position("./images/positions/0", 8, canvas))

    kettle = world.registerItem(new Collectable('kettle'))
    lock = world.registerItem(new Interactable("lock", 'locked', utils.toggle))
    lock.onListen = function (variable, value) {
        if (value) {
            lock.nameModifier = "Locked";
        }
        else {
            lock.nameModifier = "";
        }
        lock.load()
    }

    game.registerListener(lock, 'locked')
    world.registerItem(new Collectable('knob'))


    ////
    // DEBUGGING SETUP
    ////
    var text = new fabric.Text("UNSET", { top: canvas.height - 100, left: 500, originY: "bottom" })
    game.addImage(text, layers.DEBUG)

    setInterval(function () {
        text.text =
        "Pos: " + String(game.currentPosition.folder) +
        "\nView: " + String(game.currentPosition.currentView.angle) +
        "\nVARS: " + JSON.stringify(Array.from(game.vars.entries()))
    },
        10);

});