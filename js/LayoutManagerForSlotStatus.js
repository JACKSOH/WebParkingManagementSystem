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

//string defined
const slotLabel = "SlotVertical"; // label for Vertical
const slotLabelHor = "SlotHorinzontal" //label for horinzontal
const parkingSlotSize = 30;// parking slot size
const actualHeightRate = 10;
const actualWidthRate = 10; // the exchange rate from real life parking

//start
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
                    var status = psnap.child("status").val();
                    var slotid = psnap.key;
                    var parkingSlot = {
                        id: slotid,
                        compid: compid,
                        name: slotName,
                        x: sx,
                        y: sy,
                        w: sw,
                        h: sh,
                        status: status
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
function proceedToEditor() {
    document.getElementById("basicContainer").style.display = "none";
    document.getElementById("layoutContainer").style.display = "block";
    //initialize the comp

    initObjectDefinition();

    initStatus();

    setInterval(drawEditor, 10);

    floors.forEach(function (floor) { // take the save dragged comps back to the current array
        if (floor.blockid === blockdd.options[blockdd.selectedIndex].id && floor.floorid === floordd.options[floordd.selectedIndex].id) {
            draggedComps = floor.draggedComps;
        }
    });
}
function initObjectDefinition() {
    //get from html
    Ecanvas = document.getElementById("editCanvas");
    ec = Ecanvas.getContext("2d"); //ec stand for editor canvas

    //event on convas
    Ecanvas.ondblclick = mouseDbClick;

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

    
    previouseSelectedFloor = floordd.options[0].id;
    changeEditorCanvasSize(previouseSelectedBlock,previouseSelectedFloor);
}

function rectForEC(x, y, w, h, name) { //for Editor Canvas
    var image = new Image();
    if (name === "exit") {
        image.src = "../image/exit-50.png"
        ec.drawImage(image, x, y, w, h);
    } else if (name === "entry") {

        image.src = "../image/entry-50.png";
        ec.drawImage(image, x, y, w, h);
    } else if (name === "entrance") {

        image.src = "../image/entrance-50.png"
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
function rectForECslot(x, y, w, h, name, status) { //draw for parking slot
    ec.beginPath();
    ec.lineWidth = "3";
    ec.strokeStyle = "black";
    if (status === "available") {
        ec.fillStyle = "green";
    } else if (status === "unavailable") {
        ec.fillStyle = "red";
    } else if(status === "parked"){
        ec.fillStyle = "grey";
    } else if (status === "improper") {
        ec.fillStyle = "yellow"
    } else {
        ec.fillStyle = "grey";
    }
    ec.font = "10px Arial";
    ec.rect(x, y, w, h);
    ec.fillRect(x, y, w - 2, h - 2);
    ec.stroke();
    ec.fillStyle = "black";
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
                    rectForECslot(s.x, s.y, s.w, s.h, s.name, s.status);
                });
            }
        }
    }
}
function mouseDbClick(e) {


    var compsIndex = checkAndSlotComponentsCollide(Ecanvas, e);

    if (compsIndex !== false) {

        var slotRef = firebase.database().ref().child("ParkingSlot");// components reference
        var slotIndex = checkWhichParkingSlot(draggedComps[compsIndex].parkingSlots, e);
        var slot = draggedComps[compsIndex].parkingSlots[slotIndex];
        if (slot.status === "available" ||slot.status === "improper") {
            var desc = prompt("What is the reason to change this slot to UNAVAILABLE? \n Description: ");
            if (desc) {
                draggedComps[compsIndex].parkingSlots[slotIndex].status = "unavailable";
                slotRef.child(slot.id).update({
                    status: "unavailable",
                    description: desc
                }).then(function () {
                    alert("Slot Status Updated.");
                });
            }

        } else {
            draggedComps[compsIndex].parkingSlots[slotIndex].status = "available";
            slotRef.child(slot.id).update({
                status: "available"
            }).then(function () {
                alert("Slot Status Updated.");
            });
        }
    }

}
// function for change floor
function changeFloor(e) {
    var selectedBlock = blockdd.options[blockdd.selectedIndex];
    var selectedFloor = floordd.options[floordd.selectedIndex];
    
    
    floordd.options.length = 0;
    
    floors.forEach(function (f) {
        if (f.blockid === selectedBlock.id) {
            var opt = document.createElement("option"); // add dropdown item
            opt.id = f.floorid;
            opt.value = f.floorName;
            opt.innerHTML = f.floorName;
            floordd.add(opt);
            
        }
    });
    for (var i = 0; i < floordd.options.length; i++) { //clear all drop down item
        if (floordd.options[i].id === selectedFloor.id) {
            floordd.selectedIndex = i;
        }
    }
    
    saveDraggedCompsToFloor();
    retrieveSelectedFloorDraggedComps(selectedBlock.id,selectedFloor.id); // update the canvas design with the new slected floor
    changeEditorCanvasSize(selectedBlock.id,selectedFloor.id);
    previouseSelectedBlock = selectedBlock.id;// update the previous value
    previouseSelectedFloor = selectedFloor.id;
   
}
function changeEditorCanvasSize(sBlock,sFloor) {

    var selectedBlock = sBlock;
    var selectedFloor = sFloor;

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
function retrieveSelectedFloorDraggedComps(selectedBlock,selectedFloor) { //to retrieve the dragged comps from the selected floor.

    floors.forEach(function (floor) { // take the save dragged comps back to the current array

        if (floor.blockid === selectedBlock && floor.floorid === selectedFloor) {
            draggedComps = floor.draggedComps;
        }
    });
}
// individual small function to perform some action
function getMousePos(canvas, evt) { // get mouse position in canvas
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function checkAndSlotComponentsCollide(canvas, e) { // return the collided index

    mouseOnCanvas = new getMousePos(canvas, e);
    mx = mouseOnCanvas.x;
    my = mouseOnCanvas.y;

    for (var i = 0; i < draggedComps.length; i++) {
        var c = draggedComps[i];
        if (mx > c.x && mx < c.x + c.w && my > c.y && my < c.y + c.h) {


            if (c.name === slotLabelHor || c.name === slotLabel) {

                return i;
            }
        }
    }
    return false;
}

function reloadPage() {
    location.reload();
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