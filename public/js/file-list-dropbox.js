var fileList = []

var token = localStorage.getItem("access_token")
var dbx = new Dropbox.Dropbox({ accessToken: token });
console.log('dbx', dbx)
refreshListDropbox()


function refreshListDropbox () {
  dbx.filesListFolder({path: '', recursive: true, include_deleted: false})
  .then(function(response) {
    console.log('response', response)
    displayFiles(response.entries);
    console.log(response);
  })
  .catch(function(error) {
    console.error(error);
  });
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
