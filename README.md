# ROCK PAPER SCISSORS

### Overview
---
In this assignment, create Rock Paper Scissors game,as multiplayer game, all with the help of Firebase.

### Requirements
---
* Create a game that suits this user story:

  * Only two users can play at the same time.

  * Both players pick either `rock`, `paper` or `scissors`. After the players make their selection, the game will tell them whether a tie occurred or if one player defeated the other.

  * The game will track each player's wins and losses.

  * Throw some chat functionality in there! No online multiplayer game is complete without having to endure endless taunts and insults from your jerk opponent.
  
### Files
---
* [index.html](https://github.com/liaswapna/RPS-Multiplayer/blob/master/index.html)

* [style.css](https://github.com/liaswapna/RPS-Multiplayer/blob/master/assets/css/style.css)

* [app.js](https://github.com/liaswapna/RPS-Multiplayer/blob/master/assets/javascript/app.js)

### Technologies Used
---
* HTML
* CSS Bootstrap
* JavaScript to make the page dynamic
* jQuery for Dom Manipulation
* Firebase Database for data storage

### Code Explanation
---
* CSS Bootstrap was used to arrange the page into columns, tables and form.
* A form was implemented to add the login details.
* Firebase is used to store the data remotely so that other player must be able to view the status of game.
    * Code and Syntax for push the data to firbase.
    ```javascript
    var database = firebase.database();
    database.ref().push(data);
    ```
* Event listener for login submit button is utilized: 
    * To get the inputted data and store in a variable.
    * To push the data into firesbase.
    * To clear the input field.
* Event listener for chat submit button is utilized:
    * To get the chat input and store in a variable.
    * To push the data into firesbase.
    * To clear the input field.
* Functions to update data, display the data correctly on the output field & update the chat.
* The data is retieved from the firebase is done in the function.
    * Code and Syntax for retrieving data.
    ```javascript
    database.ref().on("child_added", function(snaphotChild){
    
    }
    ```
* The reset function is called in regular intervals using setInterval().
    * Code and Syntax for setInterval().
    ```javascript
    setInterval(reset,10*1000);
    ```
    

### NOTE
* [Link to my Train Scheduler App] (https://liaswapna.github.io/RPS-Multiplayer/)
