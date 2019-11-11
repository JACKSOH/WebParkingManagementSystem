initFirebase();

function initFirebase() {
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyAocUMZb2k47JE6HYO2jqsa1GZ8djHUB5k",
    authDomain: "parking-management-syste-d2bff.firebaseapp.com",
    databaseURL: "https://parking-management-syste-d2bff.firebaseio.com",
    projectId: "parking-management-syste-d2bff",
    storageBucket: "parking-management-syste-d2bff.appspot.com",
    messagingSenderId: "211093333348",
    appId: "1:211093333348:web:8f83cabb5ecc0086550671",
    measurementId: "G-YYG5G946DB"
  };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
}

firebase.auth().onAuthStateChanged(function (user) {
    
    
    if (user) {
        var welcomeMessage = document.getElementById("welcome");
        if (welcomeMessage) {
            welcomeMessage.innerHTML ="Welcome " +user.email;
        }
     
        
        setCookie("isSignout", false);
        // User is signed in.
        var user = firebase.auth().currentUser;
        if (user != null) {
            var email_id = user.email;
        }
    }else{
      
        var isSignout = JSON.parse(getCookie("isSignout"));
      
        if (!isSignout) {   
            alert("You are not logged in.");
             setCookie("isSignout",true);
             
           window.location = "/public/stafflogin.html";
        }
        // No user is signed in.

    }
});
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function setCookie(name, value, days) {

    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}
function logout() {
    firebase.auth().signOut().then(function() {
        alert("You have Signed OUT.");
      }).catch(function(error) {
          alert(error);
      });
}
