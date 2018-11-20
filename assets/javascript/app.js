// Initialize Firebase.
var config = {
    apiKey: "AIzaSyCcZF0mY8mli-PcmjFs4tx31JtTJPNvvp0",
    authDomain: "projectrps-ce3c2.firebaseapp.com",
    databaseURL: "https://projectrps-ce3c2.firebaseio.com",
    projectId: "projectrps-ce3c2",
    storageBucket: "",
    messagingSenderId: "353009623962"
};
firebase.initializeApp(config);

// Create references.
var database = firebase.database();
var playersRef = database.ref("/players");
var connectedRef = database.ref(".info/connected");
 
var loginStatus1 = false,
    loginStatus2 = false,
    player1 = {
        name:"",
        choice:"",
        win:0,
        loss:0
    },
    player2 = {
        name:"",
        choice:"",
        win:0,
        loss:0
    },
    player12,
    playerNum;

// When a new child is added to the firebase.
playersRef.on("child_added",function(snapshot){
    if(snapshot.key == "1"){
        loginStatus1 = true;
        player1.name = snapshot.val().name;
    }
    if(snapshot.key == "2"){
        loginStatus2 = true;
        player2.name = snapshot.val().name;
    }
});


playersRef.on("child_removed",function(snapshot){

    var playerKey = snapshot.key;
    if(playerKey == "1"){
        loginStatus1 = false;
        player1 = {
            name: "",
            choice: "",
            win: 0,
            loss:0
        }
    }
    if(playerKey == "2"){
        loginStatus2 = false;
        player2 = {
            name: "",
            choice: "",
            win: 0,
            loss:0
        }
        if(playerNum == 2){
            player12 = player2;
        }
        console.log
    }
});

// login click event.
$("#login-btn").on("click",function(event){

    event.preventDefault();
    var name = $(".login-input").val().trim();
    if(!name) return;
    if(loginStatus1 == false){
        player12 = player1;
        playerNum = "1";
    } else if(loginStatus2 == false){
        player12 = player2;
        playerNum = "2";
    } else {
        player12 = null;
        playerNum = null;
    }
    player12.name = name;
    $(".login-input").val("");
    $(".pre-login").hide();
    database.ref("/players/"+playerNum).set(player12);
    database.ref("/players/"+playerNum).onDisconnect().remove();
});