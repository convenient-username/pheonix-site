document.addEventListener('DOMContentLoaded', function () {

    /** @type { import("fabric/fabric-impl") } */
    const fabric = window.fabric;

    // create `Canvas` object using `<canvas>` DOM node
    const canvas = new fabric.Canvas('game', { backgroundColor: "white", room: null })

    class Position {
        constructor(folderUrl, viewcount, canvas) {
            this.folder = folderUrl
            this.viewcount = viewcount
            this.canvas = canvas
            this.currentView = null;
            this.views = []
            for (let i = 0; i < viewcount; i++) {
                var view = new View(i, this.folder)
                this.views.push(view)
            }
    
            this.setView(0)
    
            console.log(this.folder)
            console.log(this.views)
        }
        setView(viewIndex)
        {
            this.currentView = this.views[viewIndex]
            console.log("Changed view to ", this.currentView);
    
            var viewBackground = fabric.Image.fromURL(this.currentView.imgUrl, function (img) {
                canvas.add(img);
            });
        }
    }
    
    class View {
        constructor(angle, parenturl) {
            this.angle = angle
            this.url = parenturl + '/' + String(angle)
            this.imgUrl = this.url + "/background.jpg"
        }
    }

    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
        canvas.setHeight(window.innerHeight);
        canvas.setWidth(window.innerWidth);
        canvas.renderAll();
    }

    // resize on init
    resizeCanvas();

    /*--------------*/
    console.log('fabric ->', typeof fabric);
    console.log('fabric.Canvas ->', typeof fabric.Canvas);
    console.log('fabric.Rect ->', typeof fabric.Rect);
    console.log('canvas.add ->', typeof canvas.add);

    function setScene(sceneNumber) {
        room = fabric.Image.fromURL(url, function (myImg) {
            canvas.room = myImg
            canvas.add(myImg);
            canvas.sendToBack(myImg)
        });
        return room
    }

    var position1 = new Position("./images/positions/0", 8, canvas);

    const text = new fabric.Text("placeholder", {
        fill: 'black',
        top: 350,
        left: 200,
    });

    var t = 0
    setInterval(() => {
        t = (t + 1) % 8
        console.log(t)
        text.text = String(position1.views)
        position1.setView(t)
    }, 600);

    const controls = new fabric.Rect({
        width: canvas.width,
        height: 200,
        originY: 'bottom',
        top: canvas.height,
        left: 0,
        fill: 'tan',
        buttons: [1, 2, 3]
    });


    canvas.add(controls);
    canvas.add(text);
});