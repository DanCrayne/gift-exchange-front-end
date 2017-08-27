var hostUrl = 'http://localhost:8080';
var eventId = 'new';
// TODO: this should be set via authentication
var loginId = 1;

// TODO: form validation


// *** Initial Setup ***
jQuery(document).ready(function() {
  refreshEventSelectionList();
  clearAllFormValues();
  disableAllFormInputs();
  enableEventSelectInput();

  jQuery(function() {
    jQuery('#eventForm input[name=date]').datepicker();
  });

  jQuery(function() {
    jQuery('#eventForm input[name=time]').timepicker();
  });
});

// *** Event Selection ***
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


// **** Event Actions ****

// *** Add Event ***
jQuery('#createEvent').click(function() {
  eventFormData = getSerializedFormData();

  jQuery.post(hostUrl + '/events', eventFormData)
    .done(function(result) {
      jQuery('#eventResult').attr('class', 'alert alert-success');
      jQuery('#eventResult').html('<strong>Event Created</strong>');
      eventId = result.split('/')[2];
      refreshEventSelectionList();
      switchToUpdateEventMode();
    })

    .fail(function(result) {
      jQuery('#eventResult').attr('class', 'alert alert-danger');
      jQuery('#eventResult').html('<strong>Error: </strong>cannot create event');
    })

    .always(function() {
      jQuery('#eventResult').fadeTo(2000, 500).slideUp(500, function() {
        jQuery('#eventResult').slideUp(500);
      });
    })
});


// *** Update Event ***
jQuery('#updateEvent').click(function() {
  eventFormData = getSerializedFormData();

  jQuery.ajax({
    url: hostUrl + '/events/' + eventId
  , method: 'PUT'
  , crossDomain: true
  , dataType: 'text'
  , data: eventFormData
  , success: function(response) {
      jQuery('#eventResult').attr('class', 'alert alert-success');
      jQuery('#eventResult').html('<strong>Event Updated</strong>');
    }
  , error: function(response) {
      jQuery('#eventResult').attr('class', 'alert alert-danger');
      jQuery('#eventResult').html('<strong>Error: </strong>cannot update event');
    }
  });

  jQuery('#eventResult').fadeTo(2000, 500).slideUp(500, function() {
    jQuery('#eventResult').slideUp(500);
  });
});


// *** Delete Event ***

jQuery('#deleteEvent').click(function() {

  jQuery.ajax({
    url: hostUrl + '/events/' + eventId
  , method: 'DELETE'
  , crossDomain: true
  , dataType: 'text'
  , success: function(response) {
      jQuery('#eventResult').attr('class', 'alert alert-success');
      jQuery('#eventResult').html('<strong>Event Deleted</strong>');

      refreshEventSelectionList();
      clearAllFormValues();
      disableAllFormInputs();
      enableEventSelectInput();
    }

  , error: function(response) {
      jQuery('#eventResult').attr('class', 'alert alert-danger');
      jQuery('#eventResult').html('<strong>Error: </strong>Cannot Delete Event');
    }
  });

  jQuery('#eventResult').fadeTo(2000, 500).slideUp(500, function() {
    jQuery('#eventResult').slideUp(500);
  });
});


// *** Add user to event ***

jQuery('#addUser').click(function() {
  userFormData = jQuery('#addUserForm').serialize();

  jQuery.post(hostUrl + '/users', userFormData)
    .then(function(result) {
      // Get the new user ID - this is done using the creation response, which 
      // returns the location of the new resource (e.g. /users/32)
      return newUserId = result.split('/')[2];
    })

    .then(function(newUserId) {

      // add new user to event_users table
      return jQuery.post(hostUrl + '/events/' + eventId + 
                                   '/users/' + newUserId, userFormData)
    })

    .then(function(result) {
        jQuery('#creationResult').attr('class', 'alert alert-success');
        jQuery('#creationResult').html('<strong>User added to event</strong>');
        refreshEventUsersTable();
        clearAddUserForm();

    })

    .catch(function(err) {
        jQuery('#creationResult').attr('class', 'alert alert-danger');
        jQuery('#creationResult').html('<strong>Error: </strong>cannot add user');
    });

    jQuery('#creationResult').fadeTo(2000, 500).slideUp(500, function() {
      jQuery('#creationResult').slideUp(500);
    });
});


// *** randomize participant (giver, receiver) pairs and send messages ***

jQuery('#randomize').click(function() {
  if (window.confirm("This operation cannot be reversed! All participants will be sent messages containing their recipients. Any changes from this point will require re-assignment of gift recipients. Are you sure you want to continue?")) {

    jQuery.post(hostUrl + '/events/' + eventId + '/randomize') 
      .then(function(result) {
        return jQuery.post(hostUrl + '/events/' + eventId + '/sendmsgs')
      })

      .then(function(result) {
        for (pair of result) {
          console.log(JSON.stringify(pair));
        }
        jQuery('#randomizeAndSendResult').attr('class', 'alert alert-success');
        jQuery('#randomizeAndSendResult').html('<strong>Participants have been notified!</strong>');
      })

      .catch(function(err) {
        jQuery('#randomizeAndSendResult').attr('class', 'alert alert-danger');
        jQuery('#randomizeAndSendResult').html('<strong>Error: </strong>Something icky happend! Cannot randomizeAndSendResult or send messages :(');
        console.log(err);
      });

      jQuery('#randomizeAndSendResult').fadeTo(2000, 500).slideUp(500, function() {
        jQuery('#randomizeAndSendResult').slideUp(500);
      });
  }
});


// *** Helper Functions ***

function getSerializedFormData() {
  eventFormData = jQuery('#eventForm').serialize();
  eventFormData += '&dateOccurs=' 
                 +       jQuery('#eventForm input[name=date]').val()
                 + ' ' + jQuery('#eventForm input[name=time]').val();
  eventFormData += '&adminId=' + loginId;

  return eventFormData;
}


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

      let dateOccurs = removeQuotes(result.occurs);
      let datePart = '';
      let timePart = '';
      if (dateOccurs !== undefined) {
        datePart = dateOccurs.split(' ')[0];
        timePart = dateOccurs.split(' ')[1];
      }

      jQuery('#eventForm input[name=name]')           
        .val(removeQuotes(result.name));

      jQuery('#eventForm textarea[name=description]') 
        .val(removeQuotes(result.description));

      jQuery('#eventForm input[name=maxGiftPrice]')   
        .val(result.max_gift_price);

      jQuery('#eventForm input[name=street]')
        .val(removeQuotes(result.loc_street));

      jQuery('#eventForm input[name=city]')
        .val(removeQuotes(result.loc_city));

      jQuery('#eventForm input[name=state]')
        .val(removeQuotes(result.loc_state));

      jQuery('#eventForm input[name=zipcode]')
        .val(removeQuotes(result.loc_zipcode));

      jQuery('#eventForm input[name=date]')
        .val(datePart);

      jQuery('#eventForm input[name=time]')
        .val(timePart);
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

    // TODO: implement modify and delete actions
    for (user of result) {
      let userId = removeQuotes(JSON.stringify(user["id"]));
      userRows += '<tr>' 
                + '<td>' + JSON.stringify(user["id"]) + '</td>'
                + '<td>' + removeQuotes(JSON.stringify(user["first_name"])) + '</td>'
                + '<td>' + removeQuotes(JSON.stringify(user["last_name"]))  + '</td>'
                + '<td>' + removeQuotes(JSON.stringify(user["email_addr"])) + '</td>'
                + '<td>'
                + '<button name="modifyUser_' + userId + '" value="' + userId 
                +   '" class="btn btn-default" disabled>Modify</button>'

//                + '<button name="deleteUser_' + userId + '" value="' + userId 
//                +   '" class="btn btn-default">Delete</button>'

                + '<button name="deleteUser" value="' + userId 
                +   '" class="btn btn-default">Delete</button>'

                + '<button name="sendAgain_' + userId + '" value="' + userId 
                +   '" class="btn btn-default" disabled>Resend</button>'
                + '</td>'
                + '</tr>';
    }

  })
    .then(function() {
      jQuery('#userTable > tbody').html(userRows);
    })

    .then(function() {
      listenForDeleteUser();
    })

    .catch(function(err) {
      alert('Could not get list of users');
    });
};

function listenForDeleteUser() {
  jQuery('#userTable button[name=deleteUser]').click(function() {
    userId = jQuery(this).val();

    jQuery.ajax({
      url: hostUrl + '/users/' + userId
    , method: 'DELETE'
    , crossDomain: true
    , dataType: 'text'
    , success: function(response) {
        refreshEventUsersTable();
      }

    , error: function(response) {
        return response;
      }
    });
  })
};


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
  enableAddUserFormInputs();
  enableAddUserButton();
  enableEventFormTextInputs();
  enableRandomizeButton();
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

function enableDeleteUserButtons() {
  jQuery('#userTable button[name=deleteUser]').prop('disabled', false);
}

function enableRandomizeButton() {
  jQuery('#randomize').prop('disabled', false);
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
