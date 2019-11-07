init();
var parkingLot = false;
var blocks = []; //block array
var floors = []; // floor array



function init() {
    // document.getElementById("layoutContainer").style.display = "none";
}

function adjustBlockRequest() { //to maintain the block quantity
    var blockAddon = document.getElementById("blockAddon"); //check whether have the block Add on 
    var blockContainer = document.getElementById("blockContainer");
    if (blockAddon) {
        blockContainer.removeChild(blockAddon);
    }

    var blockQuantity = document.getElementById("blockQuantity").value;
    var numCheck = new RegExp("^(?:[1-9]|0[1-9]|10)$");
    var blockAddon = document.createElement("div");
    blockAddon.id = "blockAddon";
    if (numCheck.test(blockQuantity)) {// check whether it match
        for (var i = 0; i < blockQuantity; i++) {
            var blockNo = document.createElement("label");
            blockNo.innerHTML = "Block" + (i + 1);
            var blockName = document.createElement("input");
            blockName.type = "text";
            blockName.placeholder = "Block Name";
            blockName.id = "block" + (i + 1);
            var floorQuantity = document.createElement("input");
            floorQuantity.type = "number";
            floorQuantity.min = 0;
            floorQuantity.placeholder = "Floor on this block";
            floorQuantity.id = "floor" + (i + 1);
            var width = document.createElement("input");
            width.type = "number";
            width.min = 0;
            width.placeholder = "Width (m)"
            width.id = "floor" + (i + 1) + "width";
            var height = document.createElement("input");
            height.type = "number";
            height.min = 0;
            height.placeholder = "Height (m)"
            height.id = "floor" + (i + 1) + "height";
            if (i === 0) {//check if the floor is at 1st floor , if yes will ask whether the following block have the same floor 

                floorQuantity.onchange = function () { askFloor(this.value, blockQuantity) };

            }
            blockAddon.appendChild(blockNo);
            blockAddon.appendChild(blockName);
            blockAddon.appendChild(floorQuantity);
            blockAddon.appendChild(width);
            blockAddon.appendChild(height);
            blockContainer.appendChild(blockAddon);

        }

    } else {
        alert("please enter valid block number & Maximum 10");
    }
}
function askFloor(floor, blockQuantity) {//if yes it will fill all he block with same number
    var asnwer = confirm("Is the following block have the same floor number?");
    if (asnwer) {
        for (var i = 0; i < blockQuantity; i++) {

            document.getElementById("floor" + (i + 1)).value = floor;
        }

    }
}
function validateBasicInfo() {
    var validation = false;
    parkingLot = false;
    blocks = [];
    floors = [];
    var company = document.getElementById("company").value;
    var user = "token"; // should be changed afterward to the readl staff id
    parkingLot = { company: company, createdBy: user };//create parking lot object for further reference

    var blockQuantity = document.getElementById("blockQuantity").value;
    for (var i = 0; i < blockQuantity; i++) {
        var blockName = document.getElementById("block" + (i + 1)).value;
        var block = { blockid: "block" + (i + 1), blockName: blockName }; //E.g Id :block1
        blocks.push(block); // push the block to  

        var floorQuantity = document.getElementById("floor" + (i + 1)).value;
        if (floorQuantity && floorQuantity < 10) { //check floor is filled
            var width = document.getElementById("floor" + (i + 1) + "width").value;
            var height = document.getElementById("floor" + (i + 1) + "height").value;
            if (width >= 100 && width <= 1500 && height >= 100 && height <= 1500) { //check if the block longer than min and max 

                for (var j = 0; j < floorQuantity; j++) { //put o the array if no wrong
                    var floor = { blockid: "block" + (i + 1),floorid:  "floor" + (j + 1), width: width, height: height }; // E.g Id : floor1
                    floors.push(floor);
                    validation = true;

                }
            } else {
                validation = false;
                alert("Wrong at block " + (i + 1));
                alert("Width/Height should be between 100 and 1500.\n Floor maximum to 10");

            }


        } else {
            validation = false;
            alert("Please enter the floor quantity at block " + (i + 1));
        }
    }


    if (validation) { // check if pass the validation then proceed to editor mode

        proceedToEditor(parkingLot, blocks, floors);
    }

}
