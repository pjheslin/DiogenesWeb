"use strict"
console.log('LOADED')

$.ajax({
  type: 'GET',
  url: 'test.xml',
  dataType: 'xml',
  //data: {someData: true}
  statusCode: {
    404: function(responseObject, textStatus, jqXHR) {
      // No content found (404)
      // This code will be executed if the server returns a 404 response
    },
    503: function(responseObject, textStatus, errorThrown) {
      // Service Unavailable (503)
      // This code will be executed if the server returns a 503 response
    }
  }
})
.done(function(data){
    processXML(data)
})
.fail(function(jqXHR, textStatus){ alert('Something went wrong: ' + textStatus);
})


// .always(function(jqXHR, textStatus) {
// alert('Ajax request was finished') });

function processXML (xml) {
  console.log(xml)
  //xml.find('body')
}
