
init();
function init() {
    var user = JSON.parse(getCookie("User"));
}
function logout() {
    
    firebase.auth().signOut();
}

  