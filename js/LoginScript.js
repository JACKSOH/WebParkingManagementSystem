

function login() {

  var userEmail = document.getElementById("email").value;
  var userPass = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(userEmail, userPass).then(function () {
    setCookie("isSignout", false);
    setCookie("User", JSON.stringify(firebase.auth().currentUser));
    window.location = "/admin/createNewLayout.html";
  }).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    window.alert("Error : " + errorMessage);


  });


}


