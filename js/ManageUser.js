getAllUser();
function getAllUser() {
    var usersRef = firebase.database().ref().child("users");
    var rowCount = 0;

    usersRef.on("child_added", snap => {
        var name = snap.child("name").val();
        var phone = snap.child("phone").val();
        var role = snap.child("role").val();
        var uid = snap.key;
        var userTable = document.getElementById("userTable");
        var row = userTable.insertRow(rowCount);
        row.id = uid;
        var numberCell = row.insertCell(0);
        var nameCell = row.insertCell(1);
        nameCell.id = "name";
        var phoneCell = row.insertCell(2);
        phoneCell.id = "phone";

        var roledd = document.createElement("select");

        var adminOption = document.createElement("option");
        var staffOption = document.createElement("option");

        adminOption.text = "Admin";
        adminOption.value = "admin";
        staffOption.text = "Staff";
        staffOption.value = "staff";
        roledd.add(adminOption);
        roledd.add(staffOption);
        roledd.onchange = function () { changeRole(roledd.options[roledd.selectedIndex].value, uid) };

        if (role.toLowerCase() === "admin") {

            adminOption.selected = "selected";

        } else {
            staffOption.selected = "selected";
        }
        var roleCell = row.insertCell(3);
        roleCell.id = "role";

        numberCell.innerHTML = rowCount + 1;
        nameCell.innerHTML = name;
        phoneCell.innerHTML = phone;
        roleCell.appendChild(roledd);
        rowCount++;

    });

}
function changeRole(changedRole, uid) {
    var userRef = firebase.database().ref("users/" + uid);
    userRef.update({
        'role': changedRole
    });
    alert("update successfully");

}