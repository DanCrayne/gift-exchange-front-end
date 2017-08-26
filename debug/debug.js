var hostUrl = 'http://localhost:8080';

jQuery('#randomize').click(function() {
  jQuery.post(hostUrl + '/events/1/randomize') 
    .done(function(result) {
      jQuery('#output').html(JSON.stringify(result));
      for (pair of result) {
        console.log(pair);
      }
    });
});

jQuery('#sendMessages').click(function() {
  jQuery.post(hostUrl + '/events/1/sendmsgs') 
    .done(function(result) {
      jQuery('#output').html(JSON.stringify(result));
      for (pair of result) {
        console.log(JSON.stringify(pair));
      }
    })
});

jQuery('#sendMessage').click(function() {
  jQuery.post(hostUrl + '/events/1/sendmsgs/1') 
    .done(function(result) {
      jQuery('#output').html(JSON.stringify(result));
      for (pair of result) {
        console.log(JSON.stringify(pair));
      }
    })
});
