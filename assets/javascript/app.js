/* 
Requirements:
    Only two players can play at the same time.
    Both player has to pic either rock, papaer or scissors.
    Game will display for any tie or defeat
    Game will track players wins and loss.
    When the connection of one player goes another player can join and continue playing.
    It will keep track of the connection.
*/


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
var chatRef = database.ref("/chat");
var playersRef = database.ref("/players");
var connectedRef = database.ref(".info/connected");

// Global variables to keep track of all the players data locally.
var playerName,
    playerNumber,
    player1LoggedIn = false,
    player2LoggedIn = false,
    playerObject,
    player1Object = {
        playerId:"",
        name: name,
        choice: "",
        wins: 0,
        loss: 0
    },
    player2Object = {
        playerId:"",
        name: name,
        choice: "",
        wins: 0,
        loss: 0
    },
    player1ChatObject = {
        userId: "",
        name: "",
        text: ""
    },
    player2ChatObject = {
        userId: "",
        name: "",
        text: ""
    },
    playerChatObject,
    resetId;

// show the login screen
showLoginScreen();

/**
 * Reset the round
 */
function reset() {
    clearTimeout(resetId);
    playerObject.choice = "";
    database.ref("/players/" + playerNumber).set(playerObject);
    $(".selection-reveal").hide();
    $("#feedback").empty();
}

// Update the loggedIn status the Players.
playersRef.on("child_added",function(snapshot){
    window["player"+snapshot.key+"LoggedIn"] = true;
    window["player"+snapshot.key+"Object"] = snapshot.val();  
}, errorHandler);

// update the playerObject when the child is changed
playersRef.on("child_changed",function(snapshot){
    window["player"+snapshot.key+"Object"] = snapshot.val();
    updateStats();
}, errorHandler);

// Updates when a child is removed.
playersRef.on("child_removed",function(snapshot){

    var listText = "System:"+snapshot.val().name+" has disconnected";
    var listString = $("<li>").addClass("system");
    listString.text(listText);
    $("#chat-log").append(listString);

    window["player"+snapshot.key+"LoggedIn"] = false;
    window["player"+snapshot.key+"Object"] = {
        name: "",
        choice:"",
        wins: 0,
        loss: 0
    };

    // When both palyers are disconnected.
    if(!player1LoggedIn && !player2LoggedIn){
        chatRef.remove();
    }
},errorHandler);

// When a new chat is added.
chatRef.on("child_added", function(snapshot){
    window["player"+snapshot.key+"ChatObject"] = snapshot.val();
    updateChat();
});

// When a child is changed.
chatRef.on("child_changed", function(snapshot){
    window["player"+snapshot.key+"ChatObject"] = snapshot.val();
    updateChat();
});

// if a chat message is removed, remove it from the DOM
chatRef.on("child_removed", function (chatSnap) {
    $("#" + chatSnap.key).remove();
}, errorHandler);

// When any general change is made.
playersRef.on("value",function(snapshot){

    // Update the player if logged in
    $("#player-1").text(player1Object.name || "Waiting for player1");
    $("#player-2").text(player2Object.name || "Waiting for Player2");

    // update which part of the player box is showing based on whether a selection has been made
    updatePlayerBox("1", snapshot.child("1").exists(), snapshot.child("1").exists() && snapshot.child("1").val().choice);
    updatePlayerBox("2", snapshot.child("2").exists(), snapshot.child("2").exists() && snapshot.child("2").val().choice);

    // Display the right screen depending on the logged in status.
    if (player1LoggedIn && player2LoggedIn && !playerNumber){
        showLoginPending();
    } else if (playerNumber && !playerObject.choice){
        showLoggedInScreen();
    } else if((!player1LoggedIn && !playerNumber) || (!player2LoggedIn&&!playerNumber)){
        showLoginScreen();
    }

    // If both the players selected a choice call rps function.
    if(player1Object.choice && player2Object.choice){

        rps(player1Object.choice,player2Object.choice);
    }

},errorHandler);

// Funtion to handle errors.
function errorHandler(error){
    console.log("ERROR: "+error.code);
}


/**
 * Update the player box state
 * @param {string} playerNum 1 or 2
 * @param {boolean} exists 
 * @param {boolean} choice 
 */
function updatePlayerBox(playerNum, exists, choice) {
    if (exists) {
        if (playerNumber != playerNum) {
            if (choice) {
                $(".p" + playerNum + "-selection-made").show();
                $(".p" + playerNum + "-pending-selection").hide();
            } else {
                $(".p" + playerNum + "-selection-made").hide();
                $(".p" + playerNum + "-pending-selection").show();
            }
        }
    } else {
        $(".p" + playerNum + "-selection-made").hide();
        $(".p" + playerNum + "-pending-selection").hide();
    }
}


/**
 * Update status for both players based off most recently-pulled data
 */
function updateStats() {

    ["1", "2"].forEach(playerNum => {
        var obj = window["player" + playerNum + "Object"];
        $("#p" + playerNum + "-wins").text(obj.wins);
        $("#p" + playerNum + "-loss").text(obj.loss);
    });

    player1LoggedIn ? $(".p1-status").show() : $(".p1-status").hide();
    player2LoggedIn ? $(".p2-status").show() : $(".p2-status").hide();
}

/**
 * Update the chat list
 */
function updateChat() {

    ["1", "2"].forEach(playerNum => {
        var obj = window["player" + playerNum + "ChatObject"];
        var chatText = obj.text;
        var listText = $("<li>").attr("id",playerNum);
        if(playerNum == obj.userId){
            listText.addClass("current-user");
        }
        if(playerNum != obj.userId){
            listText.addClass("other-user");
        }
        chatText = "<strong>"+obj.name +": <strong>" +chatText;
        listText.html(chatText);
        $("#chat-log").append(listText);
    });

    // Scroll to bottom
    $("#chat-log").scrollTop($("#chat-log")[0].scrollHeight);
}

/**
 * Compares 2 choices and determines a tie or winner
 * @param {string} p1choice rock, paper, scissors
 * @param {string} p2choice rock, paper, scissors
 */
// Function to compute the game.
function rps(p1choice,p2choice){
    
    $(".p1-selection-reveal").text(p1choice);
    $(".p2-selection-reveal").text(p2choice);

    showSelections();

    if (p1choice == p2choice) {
        //tie
        $("#feedback").text("TIE");
    }
    else if ((p1choice == "rock" && p2choice == "scissors") || (p1choice == "paper" && p2choice == "rock") || (p1choice == "scissors" && p2choice == "paper")) {
        // p1 wins
        $("#feedback").html("<small>" + p1choice + " beats " + p2choice + "</small><br/><br/>" + player1Object.name + " wins!");

        if (playerNumber == "1") {
            playerObject.wins++;
        } else {
            playerObject.loss++;
        }
    } else {
        // p2 wins
        $("#feedback").html("<small>" + p2choice + " beats " + p1choice + "</small><br/><br/>" + player2Object.name + " wins!");

        if (playerNumber == "2") {
            playerObject.wins++;
        } else {
            playerObject.loss++;
        }
    }

    resetId = setTimeout(reset, 10*1000);
    
} 

/**
 * When the login button is clicked, new player is added to the available player slot.
 */
$("#login-btn").on("click",function(e){

    e.preventDefault();

    // Check for the available slot.
    if(!player1LoggedIn){
        playerNumber = "1";
        playerObject = player1Object;
        playerChatObject = player1ChatObject;
    } 
    else if(!player2LoggedIn){
        playerNumber = "2";
        playerObject = player2Object;
        playerChatObject = player2ChatObject;
    }
    else {
        playerNumber = null;
        playerObject = null;
        playerChatObject = null;
    }

    // If slot available, put the values to firebase.
    if(playerNumber){
        playerName = $(".login-input").val().trim();
        playerObject.playerId = playerNumber;
        playerObject.name = playerName;
        playerChatObject.userId = playerNumber;
        playerChatObject.name = playerName;
        $(".player-name-display").text(playerName);
        $(".player-number-display").text(playerNumber);
        database.ref("/players/"+playerNumber).set(playerObject);
        database.ref("/players/"+playerNumber).onDisconnect().remove();
    }
    $(".login-input").val("");
})

/**
 * Update the firebase database when a selection is made.
 */
$(".selection").on("click",function(){

    // failsafe for if the player isn't logged in.
    if(!playerNumber) return;
    
    playerObject.choice = this.id;
    database.ref("/players/"+playerNumber).set(playerObject);
    
    $(".p"+playerNumber+"-selections").hide();
    $(".p"+playerNumber+"-selection-reveal").text(this.id).show();
});

// when the Chat send is clicked.
$("#send-chat").on("click", function(event){

    event.preventDefault();

    // Push the chats into the database.
    var text = $("#chat").val().trim();
    playerChatObject.text = text;
    database.ref("/chat/"+playerNumber).set(playerChatObject);
    database.ref("/chat/"+playerNumber).onDisconnect().remove();
    $("#chat").val("");
});

// Display functions
function showLoginScreen(){
    $(".pre-connection,.post-login,.pending-login,.selections").hide();
    $(".pre-login").show();
}

function showLoginPending(){
    $(".pre-connection,.post-login,.pre-login,.selections").hide();
    $(".pending-login").show();
}

function showLoggedInScreen(){
    $(".pre-connection,.pre-login,.pending-login").hide();
    $(".post-login").show();
    if(playerNumber == "1"){
        $(".p1-selections").show();
    } else {
        $(".p1-selections").hide();
    }
    if(playerNumber == "2"){
        $(".p2-selections").show();
    } else {
        $(".p2-selections").hide();
    }
}

function showSelections() {
    $(".selections, .pending-selection, .selection-made").hide();
    $(".selection-reveal").show();
}