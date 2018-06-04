// Userlist data array for filling in info box
var userArray = [];

// DOM Ready =============================================================
$(document).ready(function() {

  // Populate the user table on initial page load
  //createList();

  // Username link click
 // $('#userList table tbody').on('click','td a.linkshowuser', showUserInfo);

  // Add User button click
  $('#create').on('click', addNewUser);
    
  $('#calc').on('click', modifyUser);

  // Delete User link click
  // $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

  // Modify User button click
  //$('#btnModifyUser').on('click', modifyUser);
   

});

// Functions =============================================================
var state = {
    current_index: 999,  // these values better get set before we use them
    //current_balance: 20.20,
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
  // event.preventDefault();
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

function calculate() {
    state.current_score = GetNewBalance(state.current_score);  // run one cycle of the game
    (document.getElementById("score")).innerText = (state.current_score).toString();
    if(state.current_score <= 0) {
        //(document.getElementById("ButtonBet")).style.visibility = 'hidden';
        setCurrent_index(state.current_playerInfo); // shouldn't need to do this, as the  state.current_index should still be accurate
        state.currentPlayerInfo = ""; 
        state.current_score = userArray[state.current_index].playerScore = 0.0;
        // delete them from Mongo rigth here
       //deleteuser();
        document.location.href = "index.html#LosePage";  // take player to lose page
    }
    if(state.current_score >= 20.0) {
        state.current_score = userArray[state.current_index].playerScore = 0;  // set player back to 0
        document.location.href = "index.html#WinPage";
    }
}

function GetNewScore(score) {    
    var sum = 0;
    userArray.forEach(function(element) {
        sum = sum + this.MongoKnownVal;
    });
    
    var avg = sum / userArray.length;

 if (avg == userArray[state.current_index].MongoGuess)
 {
     score = score + 10;
     score = score + state.current_score;
     (document.getElementById("status")).innerText = "You Win!";
 }
 else {
     score = state.current_score;
     (document.getElementById("status")).innerText = "You Lost!";
 }
 return score;
}
    
function setCurrent_index(playerInfo) {
    var pointer = 0;
    userArray.forEach(function(element) {
        if( (userArray[pointer].MongoName + " No.Entered: " + userArray[pointer].MongoKnownVal + " Guess: " + userArray[pointer].MongoGuess + " Score: " + userArray[pointer].MongoScore) == playerInfo )  {
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
function modifyUser(event) {
  var playerScore =  parseInt(state.current_score);
  var userID =  userArray[state.current_index]._id;
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
function deleteUser(event) {
  event.preventDefault();  // think we need this as this page is a form

  // Pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to delete this user?');
  setCurrent_index(state.current_playerInfo)
  var userID = userArray[state.current_index]._id;
  // Check and make sure the user confirmed
  if (confirmation === true) {

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
  }
  else {
    // If they said no to the confirm, do nothing
    return false;
  }
};