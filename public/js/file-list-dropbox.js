var fileList = []

var token = localStorage.getItem("access_token")
var dbx = new Dropbox.Dropbox({ accessToken: token });
console.log('dbx', dbx)

// showSavedDropbox()


function refreshListDropbox () {
  localStorage.removeItem('DropboxList')
  Promise.all([getListDropbox(), getMetadata()])
  .then(function(responses) {
    var list = responses[0].entries
    var data = responses[1]
    
  })
}

function getListDropbox () {
  // Returns a promise
  return dbx.filesListFolder({path: '', recursive: true, include_deleted: false})
}
//   .then(function(response) {
//     console.log('response', response)
//     saveListDropbox(response.entries);
//     // console.log(response);
//   })
//   .catch(function(error) {
//     console.error(error);
//   });
// }

function getMetadata () {
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest()
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.responseType = 'json'
    req.onreadystatechange = function () {
      if (request.readyState !== 4) return;
      if (request.status >= 200 && request.status < 300) {
        resolve(JSON.parse(request.responseText))
      } else {
        // If failed
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }
    }
    var url = window.location.origin + '/getMetadata' + "?user=" + localStorage.getItem("user")
    // console.log(url)
    req.open("GET", url);
    req.send();
}

function saveListDropbox (files) {
  var data = getMetadata(files)
  // for (var i = 0; i < files.length; i++) {
  //   var author = getAuthor(files[i])
  //   var title = getTitle(files[i])
  // }
  // showSavedDropbox()
}



function showSavedDropbox () {
  var entries = localStorage.getItem('DropboxList')
}

function displayFiles(files) {
   var filesList = document.getElementById('files');
   var li;
   for (var i = 0; i < files.length; i++) {
     li = document.createElement('li');
     var href = window.location.origin + '/fileDisplay' +
     "?user=" + localStorage.getItem("user") +
     '&host=dropbox' +
     '&filePath=' + files[i].path_lower
     var a = document.createElement('a')
     a.setAttribute('href', href)
     a.appendChild(document.createTextNode(files[i].name))
     li.appendChild(a)
     //li.appendChild(document.createTextNode(files[i].name));
     filesList.appendChild(li);
   }
 }
