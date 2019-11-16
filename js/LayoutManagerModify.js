
var parkingLots = [];
var draggedComps = []; // init dragged comp arrays
var comps = []; //init comp array
var blocks = []; //block array
var floors = []; // floor array
var layoutdd = document.getElementById("layoutdd");

//initialize
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
        var parkingLot = {
            company: company,
            status: status,
            createdBy: createdBy,
            id: lotKey
        }
        parkingLots.push(parkingLot);
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
    setTimeout(popMessage, 2000);

}

function getAllParkingComponents(selectedLotid) { // to get the all the componenet , block and floor in the parking layout
    var blockRef = firebase.database().ref().child("Blocks");// block reference
    var floorRef = firebase.database().ref().child("Floors");// floor reference
    var compsRef = firebase.database().ref().child("Comps");// components reference
    var slotRef = firebase.database().ref().child("ParkingSlot");// components reference
    // start retrieving block
    blockRef.orderByChild("parkingLotid").equalTo(selectedLotid).on("child_added", bsnap => { //retrieve block
        var name = bsnap.child("name").val();
        var parkingLotid = bsnap.child("parkingLotid").val();
        var blockid = bsnap.key;
        var block = {
            id: blockid,
            name: name,
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
                id: floorid,
                blockid: blockid,
                floorName: floorName,
                floorWidth: floorWidth,
                floorHeight: floorHeight,
                draggedComps: []
            }

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

                //retrieve slot
                slotRef.orderByChild("compid").equalTo(compid).on("child_added", psnap => {

                    var compid = compid;
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
                    comp.parkingSlots.push(parkingSlot); // push to the dragged comp array
                    
                });
                
                //push the draged comp to the floor array
                floor.draggedComps.push(comp);


            });
            floors.push(floor); // push to the floor after the comp and slot retreived
        });
        
    });

}