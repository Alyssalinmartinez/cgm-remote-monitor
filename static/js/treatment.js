'use strict';

function initTreatmentDrawer()  {
  $('#eventType').val('BG Check');
  $('#glucoseValue').val('').attr('placeholder', 'Value in ' + browserSettings.units);
  $('#meter').prop('checked', true);
  $('#carbsGiven').val('');
  $('#insulinGiven').val('');
  $('#preBolus').val(0);
  $('#notes').val('');
  $('#enteredBy').val(browserStorage.get('enteredBy') || '');
  $('#nowtime').prop('checked', true);
  $('#eventTimeValue').val(new Date().toTimeString().slice(0,5));
  $('#eventDateValue').val(Nightscout.utils.toDateInputValue(new Date()));
}

function treatmentSubmit(event) {

  var data = {};
  data.enteredBy = $('#enteredBy').val();
  data.eventType = $('#eventType').val();
  data.glucose = $('#glucoseValue').val();
  data.glucoseType = $('#treatment-form input[name=glucoseType]:checked').val();
  data.carbs = $('#carbsGiven').val();
  data.insulin = $('#insulinGiven').val();
  data.preBolus = parseInt($('#preBolus').val());
  data.notes = $('#notes').val();
  data.units = browserSettings.units;

  var errors = [];
  if (isNaN(data.glucose)) {
    errors.push('Blood glucose must be a number');
  }

  if (isNaN(data.carbs)) {
    errors.push('Carbs must be a number');
  }

  if (isNaN(data.insulin)) {
    errors.push('Insulin must be a number');
  }

  if (errors.length > 0) {
    window.alert(errors.join('\n'));
  } else {
		if ($('#othertime').is(':checked')) {
			data.eventTime = Nightscout.utils.mergeInputTime('#eventTimeValue','#eventDateValue');
		}
    confirmPost(data);
  }

  if (event) {
    event.preventDefault();
  }
}

function confirmPost(data) {
  var confirmtext = 
      'Please verify that the data entered is correct: ' +
      '\nEvent type: ' + data.eventType +
      ( data.glucose ? '\nBlood glucose: ' + data.glucose +
      '\nMethod: ' + data.glucoseType : '' ) +
      ( data.carbs ? '\nCarbs Given: ' + data.carbs : '' ) +
      ( data.insulin ? '\nInsulin Given: ' + data.insulin : '' ) +
      ( data.preBolus ? '\nPre Bolus: ' + data.preBolus : '' ) +
      ( data.notes ? '\nNotes: ' + data.notes : '' ) +
      ( data.enteredBy ? '\nEntered By: ' + data.enteredBy : '') +
      ( data.eventTime ? '\nEvent Time: ' + data.eventTime.toLocaleString(): '' );

  if (window.confirm(confirmtext)) {
    var dataJson = JSON.stringify(data, null, ' ');
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/v1/treatments/', true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(dataJson);

    browserStorage.set('enteredBy', data.enteredBy);

    closeDrawer('#treatmentDrawer');
  }
}

$('#treatmentDrawerToggle').click(function(event) {
  toggleDrawer('#treatmentDrawer', initTreatmentDrawer);
  event.preventDefault();
});

$('#treatmentDrawer').find('button').click(treatmentSubmit);

$('#eventTime input:radio').change(function (event){
  if ($('#othertime').is(':checked')) {
    $('#eventTimeValue').focus();
  }
  event.preventDefault();
});

$('.eventtimeinput').focus(function (event) {
  $('#othertime').prop('checked', true);
  var time = Nightscout.utils.mergeInputTime('#eventTimeValue','#eventDateValue');
  $(this).attr('oldminutes',time.getMinutes());
  $(this).attr('oldhours',time.getHours());
  event.preventDefault();
});

$('.eventtimeinput').change(function (event) {
  $('#othertime').prop('checked', true);
  var time = Nightscout.utils.mergeInputTime('#eventTimeValue','#eventDateValue');
  if ($(this).attr('oldminutes')==='59' && time.getMinutes()===0) {
     Nightscout.utils.addHours(time,1);
  }
  if ($(this).attr('oldminutes')==='0' && time.getMinutes()===59) {
     Nightscout.utils.addHours(time,-1);
  }
  $('#eventTimeValue').val(time.toTimeString().slice(0,5));
  $('#eventDateValue').val(Nightscout.utils.toDateInputValue(time));
  $(this).attr('oldminutes',time.getMinutes());
  $(this).attr('oldhours',time.getHours());
  event.preventDefault();
});
