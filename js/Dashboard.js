
init();
function init() {
    var user = JSON.parse(getCookie("User"))
    document.getElementById("welcome").innerHTML = " Welcome " + user.email;
    
}
function logout() {
    
    firebase.auth().signOut();
}

  