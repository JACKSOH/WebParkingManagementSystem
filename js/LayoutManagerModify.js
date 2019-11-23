
//empty array or object
var parkingLot = false;
var draggedComps = []; // init dragged comp arrays
var comps = []; //init comp array
var blocks = []; //block array
var floors = []; // floor array
var layoutdd = document.getElementById("layoutdd");
var EcanvasWidth, EcanvasHeight, CcanvasWidth, CcanvasHeight; //pass the ecanvas and ccanvas w,h within this class
var del = false;
var delHover = false;
var ec, cc = false; //canavas with context objects
var startX, startY; // the start location of component before dragged
var compStartX, compStartY; //declare componenet original location
var Ecanvas, Ccanvas, blockdd, floordd = false; // canvas objects

//state or index
var selectedComp, selectEditComp; // index of the Component selecting
var previouseSelectedBlock = false;
var previouseSelectedFloor = false;
var selectedFloorIndex = false;
var selectedBlockIndex = false;
var isDragging = false;
var isParkingSlotSide = false;
var isParkingSlotSideHor = false;

//string defined
const slotLabel = "SlotVertical"; // label for Vertical
const slotLabelHor = "SlotHorinzontal" //label for horinzontal
const parkingSlotSize = 30;// parking slot size
const actualHeightRate = 10;
const actualWidthRate = 10; // the exchange rate from real life parking

//class
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
// start
init();
function init() {
    document.getElementById("layoutContainer").style.display = "none";
    //init the parking lot dropdown
    getParkingLot();


}
function getParkingLot() {

    var parkingLotRef = firebase.database().ref().child("ParkingLots");
    parkingLotRef.on("child_added", snap => {
        var company = snap.child("company").val();
        var status = snap.child("status").val();
        var createdBy = snap.child("createdBy").val();
        var lotKey = snap.key;
        var pl = {
            company: company,
            status: status,
            createdBy: createdBy,
            id: lotKey
        }
        parkingLot = pl;
        var opt = document.createElement("option"); // after the child is added add in to the dropdown list
        opt.id = parkingLot.id;
        opt.text = company;
        layoutdd.add(opt);
    });

}

//submit parking and proceed to next page
function validateParkingLot() {
    var selectedLotid = layoutdd.options[layoutdd.selectedIndex].id;
    getAllParkingComponents(selectedLotid);
    setTimeout(proceedToEditor, 1500);

}

function getAllParkingComponents(selectedLotid) { // to get the all the componenet , block and floor in the parking layout
    var blockRef = firebase.database().ref().child("Blocks");// block reference
    var floorRef = firebase.database().ref().child("Floors");// floor reference
    var compsRef = firebase.database().ref().child("Comps");// components reference
    var slotRef = firebase.database().ref().child("ParkingSlot");// components reference
    // start retrieving block
    blockRef.orderByChild("parkingLotid").equalTo(selectedLotid).on("child_added", bsnap => { //retrieve block
        var blockName = bsnap.child("blockName").val();
        var parkingLotid = bsnap.child("parkingLotid").val();
        var blockid = bsnap.key;
        var block = {
            blockid: blockid,
            blockName: blockName,
            parkingLotid: parkingLotid,

        }
        blocks.push(block);
        // retrieve floor
        floorRef.orderByChild("blockid").equalTo(blockid).on("child_added", fsnap => { //retrieve floor
            var floorName = fsnap.child("floorName").val();
            var floorWidth = fsnap.child("floorWidth").val();
            var floorHeight = fsnap.child("floorHeight").val();
            var floorid = fsnap.key;
            var floor = {
                floorid: floorid,
                blockid: blockid,
                floorName: floorName,
                width: floorWidth,
                height: floorHeight,
                draggedComps: []
            }
            floors.push(floor);
            //retrieve dragged comps
            compsRef.orderByChild("floorid").equalTo(floorid).on("child_added", csnap => { //retrieve comps
                var compsName = csnap.child("name").val();
                var x = csnap.child("x").val();
                var y = csnap.child("y").val();
                var w = csnap.child("w").val();
                var h = csnap.child("h").val();
                var compid = csnap.key;
                var comp = {
                    id: compid,
                    floorid: floorid,
                    name: compsName,
                    x: x,
                    y: y,
                    w: w,
                    h: h,
                    parkingSlots: []
                }



                //because of asynchronos limitation we should use manually add
                floors.forEach(function (f) {
                    if (f.floorid === comp.floorid) {
                        f.draggedComps.push(comp);
                    }
                });

                //retrieve slot
                slotRef.orderByChild("compid").equalTo(compid).on("child_added", psnap => {

                    var compid = psnap.child("compid").val();
                    var slotName = psnap.child("name").val();
                    var sx = psnap.child("x").val(); // s for slot
                    var sy = psnap.child("y").val();
                    var sw = psnap.child("w").val();
                    var sh = psnap.child("h").val();
                    var slotid = psnap.key;
                    var parkingSlot = {
                        id: slotid,
                        compid: compid,
                        name: slotName,
                        x: sx,
                        y: sy,
                        w: sw,
                        h: sh,

                    }
                    floors.forEach(function (f1) {
                        f1.draggedComps.forEach(function (dc) {

                            if (dc.id === parkingSlot.compid) {



                                dc.parkingSlots.push(parkingSlot); // push to the dragged comp array
                            }
                        });
                    });

                });
            });

        });
    });

}

// init function
function proceedToEditor() {

    document.getElementById("basicContainer").style.display = "none";
    document.getElementById("layoutContainer").style.display = "block";
    //initialize the comp
    initComp();
    initObjectDefinition();

    initStatus();

    setInterval(drawComponent, 10);
    setInterval(drawEditor, 10);

    floors.forEach(function (floor) { // take the save dragged comps back to the current array
        if (floor.blockid === blockdd.options[blockdd.selectedIndex].id && floor.floorid === floordd.options[floordd.selectedIndex].id) {
            draggedComps = floor.draggedComps;
        }
    });


}
function initComp() {
    var exit = new basic(40, 20, 30, 30, "exit", "");
    var entry = new basic(40, 80, 30, 30, "entry", "");
    var block = new basic(150, 20, 30, 30, "entrance", "");
    var slot = new basic(260, 20, 30, 60, slotLabel, "");
    var slotHor = new basic(260, 100, 60, 30, slotLabelHor, "");
    comps.push(exit); //dummy
    comps.push(entry);
    comps.push(block);
    comps.push(slot);
    comps.push(slotHor);

}
function initObjectDefinition() {
    //get from html
    Ecanvas = document.getElementById("editCanvas");
    ec = Ecanvas.getContext("2d"); //ec stand for editor canvas
    Ccanvas = document.getElementById("compCanvas");
    CcanvasWidth = Ccanvas.width;
    CcanvasHeight = Ccanvas.height;
    cc = Ccanvas.getContext("2d"); //cc stand for comp canvas
    //set the function call with interval

    //event on convas
    Ecanvas.onmousedown = mouseDown;
    Ecanvas.onmouseup = mouseUp;
    Ecanvas.onmousemove = mouseMove;
    Ecanvas.onmouseout = mouseOut;
    Ecanvas.ondblclick = mouseDbClick;
    Ccanvas.onmousedown = mouseDown;
    Ccanvas.onmouseup = mouseUp;
    Ccanvas.onmousemove = mouseMove;
    Ccanvas.onmouseout = mouseOut;
}
function initStatus() { // to initialize the data need to be used
    // insert to drop down init dropdown

    blockdd = document.getElementById("blockdd");

    floordd = document.getElementById("floordd");
    blocks.forEach(function (block) {
        var opt = document.createElement("option");
        opt.id = block.blockid;
        opt.value = block.blockName;
        opt.innerHTML = block.blockName;
        blockdd.add(opt);
    });

    floors.forEach(function (f) {
        if (f.blockid === blockdd.options[0].id) {
            var opt = document.createElement("option");
            opt.id = f.floorid;
            opt.innerHTML = f.floorName;
            opt.value = f.floorName;
            floordd.add(opt);
        }
    });



    blockdd.selectedIndex = "0";
    previouseSelectedBlock = blockdd.options[0].id;
    floordd.selectedIndex = "0";

    changeEditorCanvasSize();
    previouseSelectedFloor = floordd.options[0].id;
}

// draw the canvas for each item has
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
    cc.fillText(name, (x + 2), (y + h) + 10);
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
    if (!(name === slotLabel) && !(name === slotLabelHor)) {
        ec.fillText(name, (x + 2), (y + h) + 10);
    }
}
function rectForECslot(x, y, w, h, name) { //draw for parking slot
    ec.beginPath();
    ec.lineWidth = "3";
    ec.strokeStyle = "red";
    ec.font = "10px Arial";
    ec.rect(x, y, w, h);
    ec.stroke();
    ec.fillText(name, x + 3, (y + h / 2));
}
function drawEditor() {


    ec.clearRect(0, 0, EcanvasWidth, EcanvasHeight);
    for (var i = 0; i < draggedComps.length; i++) {
        var c = draggedComps[i];
        rectForEC(c.x, c.y, c.w, c.h, c.name);
        if (c.name === slotLabel || c.name === slotLabelHor) { // check if any components

            if (c.parkingSlots.length > 0) {
                var slot = c.parkingSlots;
                slot.forEach(function (s) {
                    rectForECslot(s.x, s.y, s.w, s.h, s.name);
                });

            }
        }
    }
    if (isDragging) { // draw the cancel button if the comp start dragging
        var img = new Image();

        img.src = "/image/icons8-delete-50.png";


        del = { x: 10, y: 10, w: 30, h: 30 };
        ec.drawImage(img, del.x, del.y, del.w, del.h);

    }
}

//event for mouse
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
                var newComp = false;
                if (c.name === slotLabel || c.name === slotLabelHor) {  // check if the name is parking slot for vertical or horizontal
                    var parkingSlots = [];
                    newComp = { // declare a new componet 
                        x: 60,
                        y: 100,
                        w: c.w,
                        h: c.h,
                        name: c.name,
                        imagePath: c.imagePath,
                        parkingSlots: parkingSlots
                    }
                } else { // if the component is not a slot
                    newComp = new basic(40, 40, c.w, c.h, c.name);
                }
                draggedComps.push(newComp); ///HERE GOT PROBLEM
                selectedComp = i;
            }
        }
        saveDraggedCompsToFloor(); // after add the drgged comps save to the floor array

    } else if (e.target.id === "editCanvas") {//for editor
        if (checkAndComponentsCollide(Ecanvas, e)) {
            isDragging = true;
        }
    }
}
function mouseUp(e) {

    if (e.target.id === "compCanvas") { //check box in comp canvas
        if (comps[selectedComp].x) {
            comps[selectedComp].x = compStartX;
            comps[selectedComp].y = compStartY;
        }
        selectedComp = false;

    } else if (e.target.id === "editCanvas") {
        mouseOnCanvas = new getMousePos(Ecanvas, e);
        mx = mouseOnCanvas.x;
        my = mouseOnCanvas.y;
        deleteComps(mx, my);
        if (isSpecificComponet(slotLabel)) { // for vertical parking slot

            var slotFit = checkParkingSlotFit(draggedComps[selectEditComp].w); // check how many slot fit fot the parking slot drag
            if (isAnyExistParkingSlotAffected(slotFit)) {

                deleteParkingSlot(slotFit);
            } else {
                storeParkingSlots(slotFit);
            }
            adjustParkingSlotComponent();
        } else if (isSpecificComponet(slotLabelHor)) {// for horizontal parking slot
            var slotFit = checkParkingSlotFitHor(draggedComps[selectEditComp].h); // check how many slot fit fot the parking slot drag
            if (isAnyExistParkingSlotAffected(slotFit)) {
                deleteParkingSlot(slotFit);
            } else {
                storeParkingSlotsHor(slotFit);
            }
            adjustParkingSlotComponentHor();
        }
        selectEditComp = false;
    }

    isDragging = false;
    isParkingSlotSide = false;
    isParkingSlotSideHor = false;
}
function mouseMove(e) {

    if (isDragging) { // if the the dragged components has been pressed
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
                resizeParkingSlot(dx, dy);
            } else if (isParkingSlotSideHor) { // if not parking slot start moving component
                resizeParkingSlotHor(dx, dy);
            } else {
                moveDraggedComps(dx, dy);
            }

        }
        startX = mxt;
        startY = myt;
    } else {

        if (e.target.id === "editCanvas") {

            if (trackResizeSlot(e)) { // if yes change the mouse cursor
                Ecanvas.style.cursor = "ew-resize";
                isParkingSlotSide = true;//if can try to remove it
            } else if (trackResizeSlotForHor(e)) {
                Ecanvas.style.cursor = "ns-resize";
                isParkingSlotSideHor = true;
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
function mouseDbClick(e) {

    if (e.target.id === "editCanvas") {
        if (checkAndComponentsCollide(Ecanvas, e)) {
            var dc = draggedComps[selectEditComp];
            if (dc.name === slotLabelHor || dc.name === slotLabel) {
                var slot = dc.parkingSlots;
                var slotIndex = checkWhichParkingSlot(slot, e);
                var slotName = prompt("Please enter the slot name. \n E.g A1");
                if (slotName) {
                    var regex = new RegExp(/^([A-Z]+\d+)$/);
                    if (slotName) { // check the slotName have anything
                        if (regex.test(slotName)) { // check whether the type match regex Currently support string infront and interger follow behind
                            var response = confirm("Do you want to continue the number for the rest of the parking lot. \n E.g A1,A2,A3 ...");
                            if (response) {
                                var prefixIndex = findPrefixIndex(slotName);
                                var prefix = slotName.substring(0, prefixIndex + 1);

                                var suffix = parseInt(slotName.substring(prefixIndex + 1, slotName.length));
                                for (var i = slotIndex; i < slot.length; i++) {
                                    draggedComps[selectEditComp].parkingSlots[i].name = prefix + suffix;
                                    suffix++;
                                }
                            } else {
                                draggedComps[selectEditComp].parkingSlots[slotIndex].name = slotName;
                            }
                        } else {
                            draggedComps[selectEditComp].parkingSlots[slotIndex].name = slotName;
                        }
                    }
                }
            }
        }
    }
}

// individual small function to perform some action
function getMousePos(canvas, evt) { // get mouse position in canvas
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function checkAndComponentsCollide(canvas, e) { // pass the parameter and will check whether compoent collide
    mouseOnCanvas = new getMousePos(canvas, e);
    mx = mouseOnCanvas.x;
    my = mouseOnCanvas.y;

    startX = mx;
    startY = my;
    for (var i = 0; i < draggedComps.length; i++) {
        var c = draggedComps[i];
        if (mx > c.x && mx < c.x + c.w && my > c.y && my < c.y + c.h) {

            //add to dragged component
            selectEditComp = i;
            return true;
        }
    }
    return false;
}
function findPrefixIndex(name) {
    var prefix = 0;
    for (var i = 0; i < name.length; i++) {

        if (name.charAt(i).match(/^([A-Z])$/)) {
            prefix = i;
        } else {
            return prefix;
        }
    }
    return prefix;
}
function isSpecificComponet(compsName) {// for component detection when dragging, can use for any component
    if (draggedComps[selectEditComp]) {
        if (draggedComps[selectEditComp].name === compsName) {
            return true;
        } else {
            return false;
        }
    }
}
function reloadPage() {
    location.reload();
}
// function for change floor
function changeFloor(e) {
    var selectedBlock = blockdd.options[blockdd.selectedIndex];
    floors.forEach(function (f) {
        if (floors.blockid === selectedBlock.id) {

            //clean all selection 1st
            for (var i = 0; i < floordd.options.length; i++) {
                floorid.remove(i);
            }

            var opt = document.createElement("option");
            opt.id = floors.blockid;
            opt.value = floors.blockName;
            opt.innerHTML = floors.blockName;
        }
    });
    saveDraggedCompsToFloor();
    retrieveSelectedFloorDraggedComps(); // update the canvas design with the new slected floor
    previouseSelectedBlock = blockdd.options[blockdd.selectedIndex].id;// update the previous value
    previouseSelectedFloor = floordd.options[floordd.selectedIndex].id;
    changeEditorCanvasSize();


}
function changeEditorCanvasSize() {

    var selectedBlock = blockdd.options[blockdd.selectedIndex].id;
    var selectedFloor = floordd.options[floordd.selectedIndex].id;

    floors.forEach(function (floor) {

        if (floor.blockid === selectedBlock && floor.floorid === selectedFloor) {

            ec.canvas.width = floor.width * actualWidthRate;
            ec.canvas.height = floor.height * actualHeightRate;
            EcanvasHeight = Ecanvas.height;
            EcanvasWidth = Ecanvas.width;
            document.getElementById("parkingWidth").innerHTML = " Width : " + floor.width + " (m)";
            document.getElementById("parkingHeight").innerHTML = " Height : " + floor.height + " (m)";

        }
    });
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
//function when dragging components 
function moveDraggedComps(dx, dy) {
    var c = draggedComps[selectEditComp];
    c.x += dx;
    c.y += dy;
    if (c.name === slotLabel || c.name === slotLabelHor) { // if the comps got parking slot update the position also
        slot = c.parkingSlots;
        if (slot) {
            slot.forEach(function (s) { // if the parking slot move other parking specific slot move tgt
                s.x += dx;
                s.y += dy;
            })
        }
    }
}
function deleteComps(mx, my) { // check if its match the designated deleted location
    if (mx > del.x && mx < del.x + del.w && my > del.y && my < del.y + del.h) {
        var selName = draggedComps[selectEditComp].name; // save the selected dragged component name before it deleted
        draggedComps.splice(selectEditComp, 1);
        alert(selName + " has been deleted.");
    }
}
//function for maintain parking slot component
function trackResizeSlot(e) { // track whether the mouse cursor is at the parking slot side
    var tracked = false;
    try {
        mouseOnCanvas = new getMousePos(Ecanvas, e);
        mxt = mouseOnCanvas.x;
        myt = mouseOnCanvas.y;
        draggedComps.forEach(function (draggedComp) { // check if the mouse is ar the parking slot comp
            if (draggedComp.name === slotLabel) { // if match any start checking on the mouse cursor
                if (mxt > (draggedComp.x + draggedComp.w - 3) && mxt < (draggedComp.x + draggedComp.w + 2) && myt > draggedComp.y && myt < (draggedComp.y + draggedComp.h)) { //default to five
                    tracked = true;
                }
            }
        });
    } catch (e) {
        alert(e);
    }

    return tracked;
}
function checkWhichParkingSlot(slot, e) { // will return the index
    mouseOnCanvas = new getMousePos(Ecanvas, e);
    mx = mouseOnCanvas.x;
    my = mouseOnCanvas.y;
    for (var i = 0; i < slot.length; i++) { // loop all the parking slot array
        var s = slot[i];
        if (mx > s.x && mx < s.x + s.w && my > s.y && my < s.y + s.h) { // return an integere if it find any
            return i;
        }
    }
}
function resizeParkingSlot(dx, dy) {
    Ecanvas.style.cursor = "ew-resize";
    if (draggedComps[selectEditComp].w > 30) {
        draggedComps[selectEditComp].w += dx;
    } else {
        draggedComps[selectEditComp].w = 31;
    }
}
//maintain the Parking Slot Component (Horizontal)
function trackResizeSlotForHor(e) { // track whether the mouse cursor is at the parking slot side (horinzontal)
    var tracked = false;
    try {
        mouseOnCanvas = new getMousePos(Ecanvas, e);
        mxt = mouseOnCanvas.x;
        myt = mouseOnCanvas.y;
        draggedComps.forEach(function (draggedComp) { // check if the mouse is ar the parking slot comp
            if (draggedComp.name === slotLabelHor) {

                if (mxt > draggedComp.x && mxt < (draggedComp.x + draggedComp.w) && myt > (draggedComp.y + draggedComp.h - 3) && myt < (draggedComp.y + draggedComp.h + 3)) { //default to five

                    tracked = true;
                }
            }
        });
    } catch (e) {
        alert(e);
    }

    return tracked;
}
function resizeParkingSlotHor(dx, dy) {
    Ecanvas.style.cursor = "ns-resize";
    if (draggedComps[selectEditComp].h > 30) {
        draggedComps[selectEditComp].h += dy;
    } else {
        draggedComps[selectEditComp].h = 31;
    }
}

// for parking slot in the Parking Slot Component (Horizontal)
function checkParkingSlotFitHor(height) { // will return integer
    var slotFit = Math.floor(height / parkingSlotSize);

    return slotFit;
}
function storeParkingSlotsHor(quantity) { //store for horizontal component 
    var currentDraggedComps = draggedComps[selectEditComp];
    var currentX = currentDraggedComps.x;
    var currentY = currentDraggedComps.y + (currentDraggedComps.parkingSlots.length * 30); // start from the last location
    var w = currentDraggedComps.w;
    var h = parkingSlotSize; // the height follow the parking slot size in horizontal way
    var addQuantity = quantity - currentDraggedComps.parkingSlots.length // calculate how much parking slot need to be added
    for (var i = 0; i < addQuantity; i++) { // loop each the extra quantity slot needed
        var parkingSlot = {
            name: "",
            status: "",
            x: currentX,
            y: currentY,
            w: w,
            h: h
        }
        draggedComps[selectEditComp].parkingSlots.push(parkingSlot);
        currentY += parkingSlotSize; // 30 is the parking slot size
    }

}
function adjustParkingSlotComponentHor() {
    draggedComps[selectEditComp].h = draggedComps[selectEditComp].parkingSlots.length * parkingSlotSize;
}

//for parking slot in the Parking Slot Component 
function checkParkingSlotFit(width) { // will return integer
    var slotFit = Math.floor(width / parkingSlotSize)

    return slotFit;
}
function isAnyExistParkingSlotAffected(quantity) {
    var currentDraggedComps = draggedComps[selectEditComp];
    if (currentDraggedComps.parkingSlots.length > quantity) {

        return true;
    } else {

        return false;
    }
}
function deleteParkingSlot(quantity) {
    var currentDraggedComps = draggedComps[selectEditComp];
    var parkingSlots = currentDraggedComps.parkingSlots;

    draggedComps[selectEditComp].parkingSlots.splice(quantity, parkingSlots.length - quantity + 1); // index , how many

}
function storeParkingSlots(quantity) {
    var currentDraggedComps = draggedComps[selectEditComp];
    var currentX = currentDraggedComps.x + (currentDraggedComps.parkingSlots.length * 30); // start from the last location
    var currentY = currentDraggedComps.y;
    var w = parkingSlotSize;
    var h = currentDraggedComps.h;
    var addQuantity = quantity - currentDraggedComps.parkingSlots.length // calculate how much need to be added
    for (var i = 0; i < addQuantity; i++) { // loop each the extra quantity slot needed
        var parkingSlot = {
            name: "",
            status: "",
            x: currentX,
            y: currentY,
            w: w,
            h: h
        }
        draggedComps[selectEditComp].parkingSlots.push(parkingSlot);
        currentX += parkingSlotSize; // 30 is the parking slot size
    }

}
function adjustParkingSlotComponent() {
    draggedComps[selectEditComp].w = draggedComps[selectEditComp].parkingSlots.length * parkingSlotSize;
}
//when the button update layout is press
function updateLayout() {
    try {
        CheckAndDeleteCompsInFirebase();
        CheckAndUpdateCompsInFirebase();
        alert("Update Successfully!!");
        setTimeout(reloadPage, 2000);
    } catch (e) {
        alert(e);
    }
}
function CheckAndDeleteCompsInFirebase() {
    var compsRef = firebase.database().ref().child("Comps");// comps reference
    var slotsRef = firebase.database().ref().child("ParkingSlot");// slots reference
    floors.forEach(function (f) { // read all floor
        compsRef.orderByChild("floorid").equalTo(f.floorid).on("child_added", csnap => { // read all comps match the floor
            var isExist = false;
            var isSlot = false;
            var compid = csnap.key;
            f.draggedComps.forEach(function (dc) { //compare to all the dragged comp whether any of it matched
                if (compid === dc.id) {
                    isExist = true;

                }
                if (dc.name === slotLabel || dc.name === slotLabelHor) {
                    isSlot = true;
                    if (isExist) { // if the parking slot exist
                        
                        slotsRef.orderByChild("compid").equalTo(dc.id).on("child_added", pssnap => {
                         
                            var ispsExist = false;
                            var psid = pssnap.key;
                            dc.parkingSlots.forEach(function (ps) {
                                
                                if (psid === ps.id) { // it is match will not delete
                                    ispsExist = true;
                                }
                            });
                            // if the parking slot not exist then try to remove
                            if (ispsExist === false) {
                                slotsRef.child(psid).remove();
                            }
                        });

                    }

                }
            });
            if (isExist === false) { // delete if the comps does not match any of each id in the parking slot
                compsRef.child(compid).remove();// comps reference
                if (isSlot) { // if the deleted comps is a parking slot component delete all the parking slot also
          
                    slotsRef.orderByChild("compid").equalTo(compid).on("child_added", ssnap => {
                        slotsRef.child(ssnap.key).remove(); //remove the parking 
                    });
                }
                
            }
        });
    });
}

function CheckAndUpdateCompsInFirebase() { // update the comps to the database
    var compsRef = firebase.database().ref().child("Comps");// comps reference
    var slotsRef = firebase.database().ref().child("ParkingSlot");// slots reference
    floors.forEach(function (f) { //read all floor
        f.draggedComps.forEach(function (dc) { // read all dragged comps
            if (dc.id) { // if match update
                compsRef.child(dc.id).update({
                    w: dc.w,
                    h: dc.h,
                    x: dc.x,
                    y: dc.y
                });
                //for parking slot
                if (dc.name === slotLabel || dc.name === slotLabelHor) {
                    var ps = dc.parkingSlots;
                    if (ps) { // Make sure the parking slot inside
                        ps.forEach(function (s) {
                            if (s.id) { // to check whether the existing parking slot is inside
                                slotsRef.child(s.id).update({
                                    w: s.w,
                                    h: s.h,
                                    x: s.x,
                                    y: s.y,
                                    name: s.name
                                });
                            } else { // if no id inside
                                var slotKey = slotsRef.push({
                                    compid: dc.id,
                                    name: s.name,
                                    x: s.x,
                                    y: s.y,
                                    w: s.w,
                                    h: s.h
                                }).key;
                            }
                        });

                    }
                }

            } else { // if not push to the database
                var compKey = compsRef.push({
                    floorid: f.floorid,
                    name: dc.name,
                    w: dc.w,
                    h: dc.h,
                    x: dc.x,
                    y: dc.y,
                }).key;
                var ps = dc.parkingSlots; //for parking slot
                if (ps) {
                    ps.forEach(function (s) {
                        var slotKey = slotsRef.push({
                            compid: compKey,
                            name: s.name,
                            x: s.x,
                            y: s.y,
                            w: s.w,
                            h: s.h
                        }).key;
                    });
                }
            }
        })
    });
}