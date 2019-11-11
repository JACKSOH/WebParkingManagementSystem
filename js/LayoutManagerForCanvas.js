var draggedComps = []; // init dragged comp arrays
var comps = []; //init comp array
var selectedComp, selectEditComp; // index of the Component selecting
var Ecanvas, Ccanvas, blockdd, floordd = false; // canvas objects
var previouseSelectedBlock = false;
var previouseSelectedFloor = false;
var selectedFloorIndex = false;
var selectedBlockIndex = false;
var isDragging = false;
var isParkingSlotSide = false;
var del = false;
var delHover = false;
var ec, cc = false; //canavas with context objects
var startX, startY;
var mouseOnCanvas; // declare mouse on which cavas
var mx, my;//declare mouse location X and Y
var EcanvasWidth, EcanvasHeight, CcanvasWidth, CcanvasHeight; //pass the ecanvas and ccanvas w,h within this class

var compStartX, compStartY; //declare componenet origina location
// definition for component class
class component {
    constructor(x, y, w, h, name) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.name = name;

    }
}
class basic extends component {
    constructor(x, y, w, h, name, imagePath) {
        super(x, y, w, h, name);

        this.imagePath = imagePath;
    }
}
class slot extends component {
    constructor(x, y, w, h, name, quantity) {

        super(x, y, w, h, name);

        this.quantity = quantity;
    }
}
//definition for component class
function updateFloorBlockIndex() {

}
function proceedToEditor(parkingLot, blocks, floors) { //function to create the layout
    isDragging = false;
    document.getElementById("basicContainer").style.display = "none";
    document.getElementById("layoutContainer").style.display = "block";
    blockdd = document.getElementById("blockdd");
    floordd = document.getElementById("floordd");
    // when the function called initialize these 
    var exit = new basic(40, 20, 30, 30, "exit", "");
    var entry = new basic(40, 80, 30, 30, "entry", "");
    var block = new basic(150, 20, 30, 30, "entrance", "");
    var slot = new basic(150, 80, 30, 30, "slot", "");
    comps.push(exit); //dummy
    comps.push(entry);
    comps.push(block);
    comps.push(slot);
    Ecanvas = document.getElementById("editCanvas");
    EcanvasHeight = Ecanvas.height;
    EcanvasWidth = Ecanvas.width;
    ec = Ecanvas.getContext("2d"); //ec stand for editor canvas

    Ccanvas = document.getElementById("compCanvas");
    CcanvasWidth = Ccanvas.width;
    CcanvasHeight = Ccanvas.height;
    cc = Ccanvas.getContext("2d"); //cc stand for comp canvas
    setInterval(drawComponent, 10);
    setInterval(drawEditor, 10);
    Ecanvas.onmousedown = mouseDown;
    Ecanvas.onmouseup = mouseUp;
    Ecanvas.onmousemove = mouseMove;
    Ecanvas.onmouseout = mouseOut;
    Ccanvas.onmousedown = mouseDown;
    Ccanvas.onmouseup = mouseUp;
    Ccanvas.onmousemove = mouseMove;
    Ccanvas.onmouseout = mouseOut;
    initStatus();
}
function initStatus() {
    // insert to drop down init dropdown

    var blockdd = document.getElementById("blockdd");
    var floordd = document.getElementById("floordd");
    blocks.forEach(function (block) {


        var opt = document.createElement("option");
        opt.id = block.blockid;
        opt.value = block.blockName;
        opt.innerHTML = block.blockName;
        blockdd.add(opt);
    });

    blockdd.selectedIndex = "0";
    previouseSelectedBlock = blockdd.options[0].id;
    for (var i = 0; i < floors.length; i++) {
        var floor = floors[i];
        var initDraggedComps = [];
        floors[i] = { blockid: floor.blockid, floorid: floor.floorid, width: floor.width, height: floor.height, draggedComps: initDraggedComps };

        if (floor.blockid === blockdd.options[0].id) {
            var opt = document.createElement("option");
            opt.id = floor.floorid;
            opt.innerHTML = floor.floorid;
            opt.value = floor;
            floordd.add(opt);
        }
    }

    floordd.selectedIndex = "0";
    changeEditorCanvasSize();
    previouseSelectedFloor = floordd.options[0].id;
}
function rectForCC(x, y, w, h, name) {//for Component canvas
    var image = new Image();
    blocks.le
    if (name === "exit") {// draw image if need

        image.src = "/image/exit-50.png"
        cc.drawImage(image, x, y, w, h);
    } else if (name === "entry") {

        image.src = "/image/entry-50.png"
        cc.drawImage(image, x, y, w, h);
    } else if (name === "entrance") {

        image.src = "/image/entrance-50.png"
        cc.drawImage(image, x, y, w, h);
    } else {
        cc.beginPath();
        cc.lineWidth = "3";
        cc.strokeStyle = "red";
        cc.rect(x, y, w, h);
        cc.font = "10px Arial";

        cc.stroke();
    }
    cc.fillText(name, (x + w / 2), (y + h) + 10);
}
function drawComponent() {

    cc.clearRect(0, 0, CcanvasWidth, CcanvasHeight);
    for (var i = 0; i < comps.length; i++) {
        var c = comps[i];
        rectForCC(c.x, c.y, c.w, c.h, c.name);
    }
}

function rectForEC(x, y, w, h, name) { //for Editor Canvas
    var image = new Image();
    if (name === "exit") {
        image.src = "/image/exit-50.png"
        ec.drawImage(image, x, y, w, h);
    } else if (name === "entry") {

        image.src = "/image/entry-50.png";
        ec.drawImage(image, x, y, w, h);
    } else if (name === "entrance") {

        image.src = "/image/entrance-50.png"
        ec.drawImage(image, x, y, w, h);
    } else {
        ec.beginPath();
        ec.lineWidth = "3";
        ec.strokeStyle = "red";
        ec.font = "10px Arial";

        ec.rect(x, y, w, h);
        ec.stroke();
    }
    ec.fillText(name, (x + w / 2), (y + h) + 10);
}
function drawEditor() {
    ec.clearRect(0, 0, EcanvasWidth, EcanvasHeight);
    for (var i = 0; i < draggedComps.length; i++) {
        var c = draggedComps[i];
        rectForEC(c.x, c.y, c.w, c.h, c.name);
    }
    if (isDragging) { // draw the cancel button if the comp start dragging
        var img = new Image();

        img.src = "/image/icons8-delete-50.png";


        del = { x: 30, y: 30, w: 50, h: 50 };
        ec.drawImage(img, del.x, del.y, del.w, del.h);

    }
}
function getMousePos(canvas, evt) { // get mouse position in canvas
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function mouseDown(e) { //the event for mouse down
    if (e.target.id === "compCanvas") { //check box in comp canvas
        mouseOnCanvas = new getMousePos(Ccanvas, e);
        mx = mouseOnCanvas.x;
        my = mouseOnCanvas.y;
        startX = mx;
        startY = my;
        for (var i = 0; i < comps.length; i++) {//check collide any component
            var c = comps[i];
            if (mx > c.x && mx < c.x + c.w && my > c.y && my < c.y + c.h) {
                compStartX = c.x;
                compStartY = c.y;
                isDragging = true;
                //add to dragged component
                var newComp = new basic(40, 40, c.w, c.h, c.name);
                draggedComps.push(newComp);
                selectedComp = i;
            }
        }
        saveDraggedCompsToFloor(); // after add the drgged comps save to the floor array

    } else if (e.target.id === "editCanvas") {//for editor

        mouseOnCanvas = new getMousePos(Ecanvas, e);
        mx = mouseOnCanvas.x;
        my = mouseOnCanvas.y;
        startX = mx;
        startY = my;

        for (var i = 0; i < draggedComps.length; i++) {
            var c = draggedComps[i];
            if (mx > c.x && mx < c.x + c.w && my > c.y && my < c.y + c.h) {

                isDragging = true;
                //add to dragged component
                selectEditComp = i;
            }
        }
    }


}
function mouseUp(e) {

    if (e.target.id === "compCanvas") { //check box in comp canvas


        comps[selectedComp].x = compStartX;
        comps[selectedComp].y = compStartY;


        selectedComp = false;

    } else if (e.target.id === "editCanvas") {
        mouseOnCanvas = new getMousePos(Ecanvas, e);
        mx = mouseOnCanvas.x;
        my = mouseOnCanvas.y;
        if (mx > del.x && mx < del.x + del.w && my > del.y && my < del.y + del.h) {
            var selName = draggedComps[selectEditComp].name; // save the selected dragged component name before it deleted
            draggedComps.splice(selectEditComp, 1);
            alert(selName + " has been deleted.");
        }

        selectEditComp = false;
    }

    isDragging = false;
    isParkingSlotSide = false;
}
function mouseMove(e) {

    if (isDragging) {
        if (e.target.id === "compCanvas") { //move the selected in canvas
            mouseOnCanvas = new getMousePos(Ccanvas, e);
            mxt = mouseOnCanvas.x;
            myt = mouseOnCanvas.y;
            var dx = mxt - startX; // distance of the mouse move
            var dy = myt - startY;
            comps[selectedComp].x += dx;
            comps[selectedComp].y += dy;
        } else if (e.target.id === "editCanvas") {
            mouseOnCanvas = new getMousePos(Ecanvas, e);
            mxt = mouseOnCanvas.x;
            myt = mouseOnCanvas.y;
            var dx = mxt - startX; // distance of the mouse move
            var dy = myt - startY;
            if (isParkingSlotSide) { // if is in the parking slot side

                Ecanvas.style.cursor = "ew-resize";
                if (draggedComps[selectEditComp].w > 30) {
                    draggedComps[selectEditComp].w += dx;
                } else {
                    draggedComps[selectEditComp].w = 31;
                }

            } else { // if not parkign slot start moving
                draggedComps[selectEditComp].x += dx;
                draggedComps[selectEditComp].y += dy;
            }

        }
        startX = mxt;
        startY = myt;
    } else {

        if (e.target.id === "editCanvas") {

            if (trackResizeSlot(e)) { // if yes change the mouse cursor
                Ecanvas.style.cursor = "ew-resize";
                isParkingSlotSide = true;//if can try to remove it
            } else {
                Ecanvas.style.cursor = "default";
            }
        }

    }
}
function mouseOut(e) {
    if (e.target.id === "compCanvas") {

        isDragging = false;
        selectedComp = false;
    } else if (e.target.id === "editCanvas") {

        isDragging = false;
        selectEditComp = false;
    }
}
function trackResizeSlot(e) { // track whether the mouse cursor is at the parking slot side
    var tracked = false;
    try {

        mouseOnCanvas = new getMousePos(Ecanvas, e);
        mxt = mouseOnCanvas.x;
        myt = mouseOnCanvas.y;
        draggedComps.forEach(function (draggedComp) { // check if the mouse is ar the parking slot comp
            if (draggedComp.name === "slot") { // if match any start checking on the mouse cursor


                if (mxt > (draggedComp.x + draggedComp.w - 5) && mxt < (draggedComp.x + draggedComp.w) && myt > draggedComp.y && myt < (draggedComp.y + draggedComp.h)) { //default to five

                    tracked = true;

                }
            }

        });
    } catch (e) {
        alert(e);
    }

    return tracked;
}
function saveDraggedCompsToFloor() {// save the dragged comps in the canvas to the floor 
    for (var i = 0; i < floors.length; i++) { // save the design for the previous floor
        var f = floors[i];
        if (f.floorid === previouseSelectedFloor && f.blockid === previouseSelectedBlock) {
            f.draggedComps = draggedComps; // try
        }
    }
}
function retrieveSelectedFloorDraggedComps() { //to retrieve the dragged comps from the selected floor.
    floors.forEach(function (floor) { // take the save dragged comps back to the current array

        if (floor.blockid === blockdd.options[blockdd.selectedIndex].id && floor.floorid === floordd.options[floordd.selectedIndex].id) {
            draggedComps = floor.draggedComps;
        }
    });
}
function changeFloor(e) {
    saveDraggedCompsToFloor();
    retrieveSelectedFloorDraggedComps(); // update the canvas design with the new slected floor

    previouseSelectedBlock = blockdd.options[blockdd.selectedIndex].id;// update the previous value
    previouseSelectedFloor = floordd.options[floordd.selectedIndex].id;
    changeEditorCanvasSize();


}
function changeEditorCanvasSize() {
    var blockdd = document.getElementById("blockdd");
    var floordd = document.getElementById("floordd");
    
    var selectedBlock = blockdd.options[blockdd.selectedIndex].id;
    var selectedFloor = floordd.options[floordd.selectedIndex].id;

    floors.forEach(function (floor) {
        if (floor.blockid === selectedBlock && floor.floorid === selectedFloor) {
            var actualHeightRate = 10;
            var actualWidthRate = 10;
            ec.canvas.width = floor.width * actualWidthRate;
            ec.canvas.height = floor.height * actualHeightRate;
            document.getElementById("parkingWidth").innerHTML = "Width : "+ floor.width +" (m)";
            document.getElementById("parkingHeight").innerHTML = "height : " + floor.height +" (m)";
            alert(floor.width);
        }
    });
}
function submitLayout() {
    alert();
    if (validateLayout()) {
        saveParkingLayout();
    }
}
function validateLayout() {
    var validation = true;
    if (!(floors.length === 0) || !(blocks.length === 0)) {
        for (var i = 0; i < floors.length; i++) { // check draggedcomps in each floor has item
            f = floors[i];

            if (f.draggedComps.length === 0) {
                alert("Not all floor complete!!");
                return false;
            }
        }
        // valid for parking slot id is filled have not done yet
    }
    return validation;
}
function saveParkingLayout() {

    var lotRef = firebase.database().ref().child("ParkingLots"); // parking lot reference
    var blockRef = firebase.database().ref().child("Blocks");// block reference
    var floorRef = firebase.database().ref().child("Floors");// floor reference
    var compsRef = firebase.database().ref().child("Comps");// components reference
    var lotKey = lotRef.push({
        company: parkingLot.company,
        createdBy: parkingLot.createdBy
    }).key;


    blocks.forEach(function (b) { // b stand for block
        var blockKey = blockRef.push({
            parkingLotid: lotKey,
            blockName: b.blockName
        }).key;
        floors.forEach(function (f) { //f stand for floor

            if (f.blockid === b.blockid) {
                var floorKey = floorRef.push({
                    blockid: blockKey,
                    floorName: f.floorid,
                    floorWidth: f.width,
                    floorHeight: f.height,
                }).key;
            }
            f.draggedComps.forEach(function (c) { // c stand for components

                compsRef.push({
                    floorid: floorKey,
                    w: c.w,
                    h: c.h,
                    x: c.x,
                    y: c.y,
                });
            });
        });
    });
    alert("New Parking Layout Created!");

    setTimeout(reloadPage, 2000);


}
function reloadPage() {
    location.reload();
}
