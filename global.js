// Userlist data array for filling in info box
var userArray = [];

// DOM Ready =============================================================
$(document).ready(function() {

    userArray.length = 0;

  // Add User button click
  $('#create').on('click', addNewUser);
    
  $('#calc').on('click', GetNewScore);
    
    $(document).on('click', '.onePlayer', function(event){

        var parm = $(this).attr("data-parm");  // passing in the fullname
        //write that fullname value into the  pickbet page
        $('#IDparmHere').text(parm);
    });
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
            var playerInfo = element.MongoName + "Value:" + element.MongoKnownVal + "Guess:" + element.MongoGuess+ "Score:" + element.MongoScore;
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

function GetNewScore(score, currentPlayer) { 
    var sumInt = 0;
    var sum = 0;

    userArray.forEach(function(element) {

        var parsedVal = parseInt(element.MongoKnownVal);
        sum = sum + parsedVal;
    
    });
    
    sumInt = parseInt(sum);
    var avg = Math.round(sumInt / userArray.length);                  
    
    userArray.forEach(function(element){
    
    (document.getElementById("score")).innerText = " Zero!";
    (document.getElementById("status")).innerText = "";
        
    var sumGuess = parseInt(element.MongoGuess);
     
    var which = $('#IDparmHere').text();  // get the full name out of the hidden HTML
    state.current_playerInfo = which;
    setCurrent_index(which); // get pointer in our array of users based on fullname
    state.current_score = parseInt(userArray[state.current_index].MongoScore);
    alert(state.current_index);
 if (avg === sumGuess)
 {
     var score = state.current_score + 10;
     element.MongoScore = score;
     state.current_score = parseInt(userArray[state.current_index].MongoScore);
     
     modifyUser();
     (document.getElementById("score")).innerText = userArray[state.current_index].MongoScore;
     (document.getElementById("status")).innerText = "You Win! " + userArray[state.current_index].MongoName;
 }
 else {
     score = element.current_score;
     (document.getElementById("status")).innerText = "You Lost! " + userArray[state.current_index].MongoName;
     deleteUser();
 }
});
}
    
function setCurrent_index(playerInfo) {
    var pointer = 0;
    userArray.forEach(function(element) {
        if (userArray[pointer].MongoName + "Value:" + userArray[pointer].MongoKnownVal + "Guess:" + userArray[pointer].MongoGuess + "Score:" + userArray[pointer].MongoScore == playerInfo) { 
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
  var playerScore =  parseInt(state.current_score);
  var userID =  userArray[state.current_index]._id;
  // do our modify on the server
  $.ajax({
    type: 'PUT',
    url: '/users/updateuser/' + userID + '*' + playerScore  // passsing 2 arguements as one
    }).done(function( response ) {
      if(response.msg === ''){
          
          document.location.href = "#WinPage";
      }
      else{
          alert('Error: ' + response.msg);
      }     
  })
};

// Delete User
function deleteUser() {
  
  var userID =  userArray[state.current_index]._id;
  // Check and make sure the user confirmed

    // If they did, do our delete
    $.ajax({
      type: 'DELETE',
      url: '/users/deleteplayer/' + userID
    }).done(function( response ) {

      if (response.msg === '') {
          
          document.location.href = "#WinPage";
      }
      else {
        alert('Error: ' + response.msg);
      }
    });

};