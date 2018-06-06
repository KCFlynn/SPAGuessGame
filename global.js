// Userlist data array for filling in info box
var userArray = [];

// DOM Ready =============================================================
$(document).ready(function() {

    userArray.length = 0;
  // Populate the user table on initial page load
  //createList();

  // Username link click
 // $('#userList table tbody').on('click','td a.linkshowuser', showUserInfo);

  // Add User button click
  $('#create').on('click', addNewUser);
    
  $('#calc').on('click', GetNewScore);

  // Delete User link click
  // $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

  // Modify User button click
  //$('#btnModifyUser').on('click', modifyUser);
   

});

// Functions =============================================================
var state = {
    current_index: 999,  // these values better get set before we use them
    current_score: 0,
    current_playerInfo: "?"
}

var PlayerObject = function(pName, pKnownVal, pGuess, pScore) {
 this.MongoName = pName;
 this.MongoKnownVal = pKnownVal;
 this.MongoGuess = pGuess;
 this.MongoScore = pScore;
};
// Fill table with data
function createList() {

  // jQuery AJAX call for JSON
  $.getJSON( '/users/createlist', function( data ) {
    userArray.length = 0;
    userArray = data;
    $('#playerul').empty(); // don't want to keep adding old li s to old li s 
     userArray.forEach(function(element) {
            var playerInfo = element.MongoName + " No.Entered: " + element.MongoKnownVal + " Guess: " + element.MongoGuess+ " Score: " + element.MongoScore
            $('#playerul').append('<li><a data-transition="pop" class="onePlayer" data-parm=' + 
                playerInfo + ' href="#playerlist" > ' + playerInfo + '</a></li>' );
        });
    $('#playerul').listview('refresh');
    });
};  // end of createList
  
// Add User
function addNewUser(event) {
  // Super basic validation - increase errorCount variable if any fields are blank
  var errorCount = 0;
  $('#create').each(function(index, val) {
    if($(this).val() === '') { errorCount++; }
  });

  // Check and make sure errorCount's still at zero
  if(errorCount === 1) {

    // If it is, compile all user info into one object
    var newUser = new PlayerObject($('#name').val(), $('#knownVal').val(), $('#guess').val(), 0)
    
    // Use AJAX to post the object to our adduser service
    $.ajax({
      type: 'POST',
      data: newUser,
      url: '/users/addnewuser',
  dataType: 'JSON'
    }).done(function( response ) {
      if (response.msg === '') {
        // Clear the form inputs
        $('#name').val('');
        $('#knownVal').val('');
        $('#guess').val('');
        // Update the table
        createList();
      }
      else {
        // If something goes wrong, alert the error message that our service returned
        alert('Error: ' + response.msg);
      }
    });
  }
  else {
    // If errorCount is more than 0, error out
    alert('Please fill in all fields');
    return false;
  }
    
};

/*function calculate() {
    //alert(state.current_playerInfo);
 
  /*  setCurrent_index(state.current_playerInfo); // shouldn't need to do this, as the  state.current_index should still be accurate
        
        
        var which = $('#IDparmHere').text();  // get the full name out of the hidden HTML
        state.current_playerInfo = which;
        setCurrent_index(which);
        
         alert(state.current_index);*/
    
    
   /* state.current_score = GetNewScore(state.current_score, userArray[state.current_index]);  // run one cycle of the game
    (document.getElementById("score")).innerText = (state.current_score).toString();
  /*  if(state.current_score <= 0) {
        //(document.getElementById("ButtonBet")).style.visibility = 'hidden';
        setCurrent_index(state.current_playerInfo); // shouldn't need to do this, as the  state.current_index should still be accurate
        state.currentPlayerInfo = ""; 
        //state.current_score = userArray[state.current_index].MongoScore = 0;
        // delete them from Mongo rigth here
        //deleteuser();
        document.location.href = "index.html#LosePage";  // take player to lose page
    }*/
   /* if(state.current_score >= 10) {
        //state.current_score = userArray[state.current_index].MongoScore = 0;  // set player back to 0
        modifyUser();
        (document.getElementById("status")).innerText = "You Win!";
        //document.location.href = "index.html#WinPage";
    }
}*/

function GetNewScore(score, currentPlayer) { 
    
    var which = $('#IDparmHere').text();  // get the full name out of the hidden HTML
    state.current_playerInfo = which;
    setCurrent_index(which); // get pointer in our array of users based on fullname
    state.current_score = parseInt(userArray[state.current_index].MongoScore);
    
    var sumInt = 0;
    var sum = 0;
   //state.current_score = GetNewScore(state.current_score, userArray[state.current_index]);  // run one cycle of the game
    //(document.getElementById("score")).innerText = (state.current_score).toString();
    userArray.forEach(function(element) {
    //score = state.current_score;
    //currentPlayer = state.current_playerInfo;
        var parsedVal = parseInt(element.MongoKnownVal);
        sum = sum + parsedVal;
    
    });
    
    sumInt = parseInt(sum);
    var avg = Math.round(sumInt / userArray.length);                  
    //alert(currentPlayer);
    //alert(state.current_playerInfo);
    
    userArray.forEach(function(element){
        
    var sumGuess = parseInt(element.MongoGuess);
        
 if (avg === sumGuess)
 {
     var score = 10;
     //score = parseInt(score) + 10;
     element.MongoScore = score;
     //(document.getElementById("status")).innerText = "You Win!";
     modifyUser();
     (document.getElementById("score")).innerText = (element.current_score).toString();
     (document.getElementById("status")).innerText = "You Win!";
 }
 else {
     score = element.current_score;
     //(document.getElementById("status")).innerText = "You Lost!";
     deleteUser();
 }
});
}
    
function setCurrent_index(playerInfo) {
    var pointer = 0;
    userArray.forEach(function(element) {
        if (userArray[pointer].MongoName + "_" + userArray[pointer].MongoKnownVal + "_" + userArray[pointer].MongoGuess + "_" + userArray[pointer].MongoScore == playerInfo) { 
            // This is where our code is going wrong and causing the current index to mess up
            state.current_index = pointer;
            return;
        }
        else {
            pointer++;
            state.current_index = -1; // indicates bug in code
        }
    });
};

// Modify User
function modifyUser() {
  var playerScore =  PlayerObject.MongoScore;
  var userID =  userArray[state.current_index];
  // do our modify on the server
  $.ajax({
    type: 'PUT',
    url: '/users/updateuser/' + userID + '*' + playerScore  // passsing 2 arguements as one
    }).done(function( response ) {
      if(response.msg === ''){
          
          document.location.href = "#listOfPlayers";
      }
      else{
          alert('Error: ' + response.msg);
      }
      
  })
    document.location.href = "#Home";
};

// Delete User
function deleteUser() {
  //event.preventDefault();  // think we need this as this page is a form

  // Pop up a confirmation dialog
  //var confirmation = confirm('Are you sure you want to delete this user?');
  setCurrent_index(state.current_playerInfo)
  var userID = userArray[state.current_index];
  // Check and make sure the user confirmed
  //if (confirmation === true) {

    // If they did, do our delete
    $.ajax({
      type: 'DELETE',
      url: '/users/deleteplayer/' + userID
    }).done(function( response ) {

      // Check for a successful (blank) response
      if (response.msg === '') {
        // Update the table
        window.location.reload()
      }
      else {
        alert('Error: ' + response.msg);
      }
    });
  //}
  //else {
    // If they said no to the confirm, do nothing
    return false;
  //}
};