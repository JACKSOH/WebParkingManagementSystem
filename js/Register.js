function registerStaff() {
    var email = document.getElementById("email").value;
    var name = document.getElementById("name").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var phone = document.getElementById("phone").value;
    var role = document.getElementById("role").value;

    if (validateStaffInfo(email, name, password, confirmPassword, phone)) {
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function success(user) {
            var userRef = firebase.database().ref("users/" + firebase.auth().currentUser.uid);
            
            userRef.set({
                name: name,
                phone: phone,
                role: role
            })
            alert("user created");
            setTimeout(reloadPage, 1000);
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorCode);
            alert(errorMessage);
        });
    }
   
}
function validateStaffInfo(email, name, password, confirmPassword, phone) {
    var check = false;
    if (email !== "" && name !== "" && password !== "" && confirmPassword !== "" && phone !== "") {
        if (password === confirmPassword) {

            check = true;
        } else {
            check = false;
            alert("password not match");
        }
    } else {
        alert("please fill all information");
        check = false;
    }

    return check;
}
function reloadPage() {
    location.reload();
}