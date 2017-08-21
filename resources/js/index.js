var hostUrl = 'http://localhost:8080';

jQuery(document).ready(function() {
jQuery.get(hostUrl + '/events', function(eventList) {
  let listItems = '<option value="" disabled selected>Select event...</option>'
                + '<option value="new">Add...</option>';

  for (thisEvent of eventList) {
    listItems += '<option value="' + JSON.stringify(thisEvent["id"]) + '">' 
              + JSON.stringify(thisEvent["name"]).replace(/['"]+/g, '')
              + '</option>';
  }

  jQuery('#eventSelect').html(listItems);
});

jQuery('input').val('');
jQuery('textarea').val('');
});

jQuery("#eventSelect").change(function() {
eventId = jQuery("#eventSelect").val();

// TODO: break population into functions
if (eventId !== 'new') {
  // Populate fields
  jQuery.get(hostUrl + '/events/' + eventId, function(result) {
    jQuery('input[name=eventName]').val(result.name.replace(/['"]+/g, ''));
    jQuery('textarea[name=eventDescription]').val(result.description.replace(/['"]+/g, ''));
    jQuery('input[name=maxGiftPrice]').val(result.max_gift_price);
    jQuery('input[name=eventStreet]').val(result.loc_street.replace(/['"]+/g, ''));
    jQuery('input[name=eventCity]').val(result.loc_city.replace(/['"]+/g, ''));
    jQuery('input[name=eventState]').val(result.loc_state.replace(/['"]+/g, ''));
    jQuery('input[name=eventZip]').val(result.loc_zipcode.replace(/['"]+/g, ''));
    console.log(result);
  });
  // Populate event users
  jQuery.get(hostUrl + '/events/' + eventId + '/users', function(userList) {
    jQuery('#output').html(JSON.stringify(userList));

    let userRows = '';
    console.log(JSON.stringify(userList));

    for (user of userList) {
      userRows += '<tr>' 
                + '<td>' + JSON.stringify(user["id"]) + '</td>'
                + '<td>' + JSON.stringify(user["first_name"]).replace(/['"]+/g, '') + '</td>'
                + '<td>' + JSON.stringify(user["last_name"]).replace(/['"]+/g, '') + '</td>'
                + '<td>' + JSON.stringify(user["email_addr"]).replace(/['"]+/g, '') + '</td>'
                + '</tr>';
      // Append this row to the end of the table's last row
      jQuery('#userTable > tbody').html(userRows);
    }
});
} else {
  // clear inputs
  jQuery('input').val('');
  jQuery('textarea').val('');
  jQuery('#userTable > tbody').html('');
  // add new event...
}
});


// TODO: add user to particular event
jQuery('#addUser').click(function() {
userFormData = jQuery('#addUserForm').serialize();
console.log(userFormData);

jQuery.post(hostUrl + '/users', userFormData)
  .done(function(result) {
    jQuery('#creationResult').addClass('alert alert-success');
    jQuery('#creationResult').html('<strong>Success: </strong>user created');
  })
  .fail(function(result) {
    jQuery('#creationResult').addClass('alert alert-danger');
    jQuery('#creationResult').html('<strong>Error: </strong>cannot create user');
    console.log(result);
  })
  .always(function() {
    // TODO: fade away message
  })
});

jQuery('#getEvents').click(function(event) {
jQuery.get(hostUrl + '/events', function(eventList) {
  jQuery('#output').html(JSON.stringify(eventList));
});
});

jQuery('#getUsers').click(function() {
jQuery.get(hostUrl + '/users', function(userList) {
  jQuery('#output').html(JSON.stringify(userList));

  let userRows = '';
  console.log(JSON.stringify(userList));

  for (user of userList) {
    userRows += '<tr>' 
              + '<td>' + JSON.stringify(user["id"]) + '</td>'
              + '<td>' + JSON.stringify(user["first_name"]).replace(/['"]+/g, '') + '</td>'
              + '<td>' + JSON.stringify(user["last_name"]).replace(/['"]+/g, '') + '</td>'
              + '<td>' + JSON.stringify(user["email_addr"]).replace(/['"]+/g, '') + '</td>'
              + '</tr>';
    // Append this row to the end of the table's last row
    jQuery('#userTable > tbody').html(userRows);
  }
});
});
