$( document ).ready(function() {
 var db,
     trainTable = $('.train-table tbody'),
     trainName = '',
     destination = '',
     trainTime = '',
     frequency = '';

 // Initialize Firebase
 var config = {
    apiKey: "AIzaSyDS60z9Rui-EkBU3sM5wLU2iQn22r8DZO8",
    authDomain: "timesheet-6e4b2.firebaseapp.com",
    databaseURL: "https://timesheet-6e4b2.firebaseio.com",
    projectId: "timesheet-6e4b2",
    storageBucket: "timesheet-6e4b2.appspot.com",
    messagingSenderId: "78664055004"
};

firebase.initializeApp(config);

db = firebase.database().ref('trainScheduleApp');

db.on('child_added', function(childSnapshot, prevChildKey) {    //Retrieve all JSON objects in the DB when the page loads, then do so only when a new JSON object is pushed to the DB
    var newTr = $("<tr>");
    newTr = addRow(newTr, childSnapshot);
    trainTable.append(newTr);
});

function instantInterval( fn, delay ) {
    fn();
    setInterval( fn, delay );
  }

function check(){
  var btnSubmit = $('.btn-submit'),
      cityName= /^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/,
      mins = /^\d+$/,
      militaryTime = /^([01]\d|2[0-3]):?([0-5]\d)$/,
      ids =["trainName","destination","trainTime","frequency"],
      counter = 0;

  ids.forEach(function(element){
    if($('#' + element).val() != ''){
      if(cityName.test($('#' + element).val())){
        counter++;
      }else if(militaryTime.test($('#' + element).val())){
        counter++;
      }else if(mins.test($('#' + element).val())){
        counter++;
      }
    }
  })

  if(counter === 4){
    btnSubmit.removeAttr("disabled");
    return true;
  }else{
    btnSubmit.attr("disabled","");
    return false;
  }
}

function addRow(tr, childSnapshot){
  arrivalObj = calcNextArrival(childSnapshot.val().trainTime_, childSnapshot.val().frequency_),
  nextArrival = arrivalObj.nextArrival_,
  minutesAway = arrivalObj.tMinutesTillTrain_;

  tr.append($("<td> " + childSnapshot.val().trainName_ + "</td>"));
  tr.append($("<td> " + childSnapshot.val().destination_ + "</td>"));
  tr.append($("<td> " + childSnapshot.val().frequency_ + "</td>"));
  tr.append($("<td> " + nextArrival + "</td>"));
  console.log('addRow nextArrival: ' + nextArrival);
  tr.append($("<td> " + minutesAway + "</td>"));
  console.log('addRow minutesAway: ' + minutesAway);
  tr.append($("<td class='hide-row'> " + childSnapshot.val().trainTime_ + "</td>"));

  return tr;
}

function calcNextArrival(firstTime, frecuency){
    var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    var tRemainder = diffTime % frecuency;
    var tMinutesTillTrain = frecuency - tRemainder;
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");

    return {
        nextArrival_ : moment(nextTrain).format("hh:mm"),
        tMinutesTillTrain_ : tMinutesTillTrain
    }
}

$('.btn-submit').click(function(){
    event.stopPropagation();

    trainName = $('#trainName').val().trim(),
    destination = $('#destination').val().trim(),
    trainTime = $('#trainTime').val().trim(),
    frequency = $('#frequency').val().trim();

    db.push({       //Firebase automatically generates a unique ID for each JSON object pushed into the DB
          trainName_ : trainName,
          destination_ : destination,
          trainTime_ : trainTime,
          frequency_ : frequency
    });
  })

instantInterval(function(){
  var tableLength = trainTable.length;

  $(".train-table tr").each(function(){
    trainTime = frequency = '';
    counter = 1;
    $('td', this).each(function(){
        if(counter === 6){
          trainTime = this.innerHTML;
          console.log('Update nextArrival: ' + trainTime);
        }
        else if(counter === 3){
          frequency = this.innerText;
          console.log('Update nextArrival: ' + frequency);
        }
        counter++;
     })
     if(trainTime != "" && trainTime != undefined && trainTime != NaN){
       if(frequency != "" && frequency != undefined && frequency != NaN){
         arrivalObj = calcNextArrival(trainTime, frequency),
         nextArrival = arrivalObj.nextArrival_,
         minutesAway = arrivalObj.tMinutesTillTrain_;
         counter = 1;
         $('td', this).each(function(){
             if(counter === 4)
               this.innerText = nextArrival;
             else if(counter === 5)
               this.innerText = minutesAway;
             counter++;
          })
       }
     }
  })
  }, 10000);

  instantInterval(function(){
      check();
    }, 100);

});
