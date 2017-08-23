var hostUrl = 'http://localhost:8080';
var eventId = 'new';
// TODO: this should be set via authentication
var loginId = 1;

// *** Initial Setup ***
jQuery(document).ready(function() {
  refreshEventSelectionList();
  clearAllFormValues();
  disableAllFormInputs();
  enableEventSelectInput();
});


jQuery("#eventSelect").change(function() {
  eventId = jQuery("#eventSelect").val();

  initializeFormInputs();

  if (eventId === 'new') {
    switchToCreateEventMode();
  }

  else {
    refreshEventSelectionList();
    refreshEventFormInputs();
    switchToUpdateEventMode();
  } 

  refreshEventUsersTable();
});


// *** Add User ***
jQuery('#addUser').click(function() {
  userFormData = jQuery('#addUserForm').serialize();

  jQuery.post(hostUrl + '/users', userFormData)
    .done(function(result) {
      // Get the new user ID - this is done using the creation response, which 
      // returns the location of the new resource (e.g. /users/32)
      newUserId = result.split('/')[2];

      // add new user to event_users table
      jQuery.post(hostUrl + '/events/' + eventId + '/users/' + newUserId, userFormData)
        .done(function(result) {
          jQuery('#creationResult').addClass('alert alert-success');
          jQuery('#creationResult').html('<strong>User added to event</strong>');
          refreshEventUsersTable();
          clearAddUserForm();
        })

        .fail(function(result) {
          jQuery('#creationResult').addClass('alert alert-danger');
          jQuery('#creationResult').html('<strong>Error: </strong>cannot add user');
        })

        .always(function() {
          jQuery('#creationResult').fadeTo(2000, 500).slideUp(500, function() {
            jQuery('#creationResult').slideUp(500);
          });
        })
    })

    .fail(function(result) {
      jQuery('#creationResult').addClass('alert alert-danger');
      jQuery('#creationResult').html('<strong>Error: </strong>cannot create user');
    })

    .always(function() {
      jQuery('#creationResult').fadeTo(2000, 500).slideUp(500, function() {
        jQuery('#creationResult').slideUp(500);
      });
    })
});


// *** Add Event ***
jQuery('#createEvent').click(function() {
  eventFormData = jQuery('#eventForm').serialize();
  eventFormData += '&adminId=' + loginId;

  jQuery.post(hostUrl + '/events', eventFormData)
    .done(function(result) {
      jQuery('#eventResult').addClass('alert alert-success');
      jQuery('#eventResult').html('<strong>Event Created</strong>');
      eventId = result.split('/')[2];
      refreshEventSelectionList();
      switchToUpdateEventMode();
    })

    .fail(function(result) {
      jQuery('#eventResult').addClass('alert alert-danger');
      jQuery('#eventResult').html('<strong>Error: </strong>cannot create event');
    })

    .always(function() {
      jQuery('#eventResult').fadeTo(2000, 500).slideUp(500, function() {
        jQuery('#eventResult').slideUp(500);
      });
    })
});


// *** Helper Functions ***

function removeQuotes(str) {
  if (str !== null)
    return str.replace(/['"]+/g, '');
}


function refreshEventFormInputs() {
  if (eventId === 'new') {
    clearEventForm();
    return
  }

  jQuery.get(hostUrl + '/events/' + eventId, function(result) {
  })
    .done(function(result) {
      jQuery('#eventForm input[name=name]')           .val(removeQuotes(result.name));
      jQuery('#eventForm textarea[name=description]') .val(removeQuotes(result.description));
      jQuery('#eventForm input[name=maxGiftPrice]')   .val(result.max_gift_price);
      jQuery('#eventForm input[name=street]')         .val(removeQuotes(result.loc_street));
      jQuery('#eventForm input[name=city]')           .val(removeQuotes(result.loc_city));
      jQuery('#eventForm input[name=state]')          .val(removeQuotes(result.loc_state));
      jQuery('#eventForm input[name=zipcode]')        .val(removeQuotes(result.loc_zipcode));
      jQuery('#eventForm input[name=date]')           .val(removeQuotes(result.occurs));
    })
    .fail(function() {
      alert('Could not get event info');
    });
}

function refreshEventSelectionList() {
  // initial items
  let listItems = '<option value="" disabled selected>Select event...</option>'
                + '<option value="new">Add...</option>';

  jQuery.get(hostUrl + '/events', function(result) {
    // add the events from API query
    for (thisEvent of result) {
      listItems += '<option value="' + JSON.stringify(thisEvent["id"]) + '">' 
                + removeQuotes(JSON.stringify(thisEvent["name"]))
                + '</option>';
    }
  })
    .done(function() {
      jQuery('#eventSelect').html(listItems);
    })
    .fail(function() {
      alert('Could not get list of events');
    });
}

function refreshEventUsersTable() {
  if (eventId === 'new') {
    clearEventUsersTable();
    return;
  }

  let userRows = '';

  jQuery.get(hostUrl + '/events/' + eventId + '/users', function(result) {

    for (user of result) {
      userRows += '<tr>' 
                + '<td>' + JSON.stringify(user["id"]) + '</td>'
                + '<td>' + removeQuotes(JSON.stringify(user["first_name"])) + '</td>'
                + '<td>' + removeQuotes(JSON.stringify(user["last_name"]))  + '</td>'
                + '<td>' + removeQuotes(JSON.stringify(user["email_addr"])) + '</td>'
                + '</tr>';
    }
  })
    .done(function() {
      jQuery('#userTable > tbody').html(userRows);
    })
    .fail(function() {
      alert('Could not get list of users');
    });
}


// *** Edit Modes ***

function initializeFormInputs() {
  clearAllFormValues();
  disableAllFormInputs();
  enableEventSelectInput();
}

function switchToCreateEventMode() {
  enableCreateEventButton();
  enableEventFormTextInputs();
}

function switchToUpdateEventMode() {
  enableUpdateEventButton();
  enableDeleteEventButton();
  enableAddUserButton();
  enableAddUserFormInputs();
  enableEventFormTextInputs();
}


// *** Form Controls ***

function clearAllFormValues() {
  jQuery(':input').val('');
}

function clearEventsForm() {
  jQuery('#eventsForm :input').val('');
}

function clearAddUserForm() {
  jQuery('#addUserForm :input').val('');
}

function clearEventUsersTable() {
  jQuery('#userTable > tbody').html('');
}

function disableAllFormInputs() {
  jQuery(':input').prop('disabled', true);
}

function disableAllButtons() {
  jQuery('button').prop('disabled', true);
}

function disableAddUserFormInputs() {
  jQuery('form#addUserForm :input').prop('disabled', true);
}

function enableCreateEventButton() {
  jQuery('#createEvent').prop('disabled', false);
}

function enableUpdateEventButton() {
  jQuery('#updateEvent').prop('disabled', false);
}

function enableDeleteEventButton() {
  jQuery('#deleteEvent').prop('disabled', false);
}

function enableAddUserButton() {
  jQuery('#addUser').prop('disabled', false);
}

function enableAllFormInputs() {
  jQuery(':input').prop('disabled', false);
}

function enableEventSelectInput() {
  jQuery('#eventSelect').prop('disabled', false);
}

function enableEventFormInputs() {
  jQuery('form#eventForm :input').prop('disabled', false);
}

function enableEventFormTextInputs() {
  jQuery('form#eventForm input').prop('disabled', false);
//  jQuery('form#eventForm input[type=text]').prop('disabled', false);
  jQuery('form#eventForm textarea').prop('disabled', false);
}

function enableAddUserFormInputs() {
  jQuery('form#addUserForm :input').prop('disabled', false);
}
