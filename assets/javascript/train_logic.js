// Initialize Firebase
var config = {
  apiKey: "AIzaSyBVBG6OISnU7_xfGIe19JpaFLwYHlbHkR4",
  authDomain: "train-c1e32.firebaseapp.com",
  databaseURL: "https://train-c1e32.firebaseio.com",
  storageBucket: "train-c1e32.appspot.com",
  messagingSenderId: "485856207202"
};

firebase.initializeApp(config);

var database = firebase.database();

// Initial Values
var name = "";
var destination = "";
var firstTime = "";
var frequency = "";
var dateAdded = "";

// Capture Button Click
$("#submit").on("click", function(event) {
	event.preventDefault();
	// Make sure that all the input boxes have been filled in and have valid inputs
	if (validInput() && validFirstTime()) {
		// Grab values from text boxes in html
		name = $("#train-name").val().trim();
		destination = $("#train-destination").val().trim();
		firstTime = $("#train-first-time").val().trim();
		frequency = parseInt($("#train-frequency").val().trim());
		dateAdded = firebase.database.ServerValue.TIMESTAMP;

		// Push grabbed values to firebase
		database.ref().push({
			name: name,
			destination: destination,
			nextArrival: findNextArrival(),
			minutesAway: minutesAway(),
			frequency: frequency,
			dateAdded: dateAdded
		});
	}

});

//Order the entered trains by the time they were added, and limit the display to the last 10 upon refresh
database.ref().orderByChild("dateadded").limitToLast(10).on("child_added", function(snapshot) {
	// Create a new row and append each value to it (listed for clarity)
	var newRow = $('<tr>');
	newRow.append("<td>" + snapshot.val().name + "</td>");
	newRow.append("<td>" + snapshot.val().destination + "</td>");
	newRow.append("<td>" + snapshot.val().frequency + "</td>");
	newRow.append("<td>" + snapshot.val().nextArrival + "</td>");
	newRow.append("<td>" + snapshot.val().minutesAway + "</td>");
	// Append the new row to the appropriate div
	$(".train-entries").append(newRow);
	// Empty rows after appending the new row
	emptyInput();
	// Handle any errors
	}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);
});

function emptyInput() {
	$("#train-name").val('');
	$("#train-destination").val('');
	$("#train-first-time").val('');
	$("#train-frequency").val('');
};

// Calculate minutes away. Initial values "frequency" and "firstTime" taken from "submit" function
function minutesAway() {
	var tFrequency = frequency;
	var tfirstTime = firstTime;
	// Make sure first time comes before current time
	var firstTimeConverted = moment(tfirstTime, "hh:mm").subtract(1, "years");
	// Find difference between current time and current time in minutes
	var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
	// Calculate the remaining time
	var remainder = diffTime % tFrequency;
	// Subtract remainder to determine the minutes until the next train
	var minutesUntilTrain = tFrequency - remainder;
	return minutesUntilTrain;
};

function findNextArrival() {
	// Retrive value for minutes until next train from minutesAway function
	var tMinutesUntilTrain = minutesAway();
	// Add the minutes until the next train to the current time to get next time
	var nextArrival = moment().add(tMinutesUntilTrain, "minutes");
	// Format the next train time appropriately and return the value
	var tNextArrival = moment(nextArrival).format("LT");
	return tNextArrival;
};

// Overly verbose conditions for checking whether first time input is valid (is there 
// an easier way to do this than what I did?)
function validFirstTime() {
	var timeArray = $("#train-first-time").val().trim().split(":");
	var timeInput = $("#train-first-time").val().trim();
	var timeArrayParts = timeInput.split("");
	// Letters that should not be included in time (I could have included symbols
	// as well, but I'm not sure this method is very efficient)
	var alphabetArray = ["a","b","c","d","e","f","g","h","i","j","k","l","m",
	"n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F",
	"G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
	];
	//Check that numerical input includes a colon
	if (!timeInput.includes(":")) {
		alert('Please enter a valid time');
		return false;
	}
	// Check if there are an equal amount of digits on both sides of the colon
	else if (timeArray[0].length !== timeArray[1].length) {
		alert("Check colon placement in time entry!");
		return false;
	}
	// Check if either the hours or minutes are inappropriately entered
	else if (timeArray[0] > 23 || timeArray[1] > 59) {
		alert("Make sure hours and minutes are appropriately entered");
		return false;
	}
	// Check if the time entered contains letters
	for (var i = 0; i < timeArrayParts.length; i++) {
		for (var k = 0; k < alphabetArray.length; k++) {
			if (timeArrayParts[i] === alphabetArray[k]) {
				alert("Times don't include letters!")
				return false;
			}
		}
	}

	return true;

};

// Check if input values are blank (also prevents wonky values for frequency input)
function validInput() {
    var a = document.forms["inputForm"]["input_name"].value;
    var b = document.forms["inputForm"]["input_destination"].value;
    var c = document.forms["inputForm"]["input_first"].value;
    var d = document.forms["inputForm"]["input_frequency"].value;
    if (a === null || a === "", b === null || b === "", c === null || c === "", d === null || d === "")
      {
      alert("Please complete all of the fields, or make sure they are filled appropriately!");
      return false;
    };

    return true
};

