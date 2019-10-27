var fileList = []

var token = localStorage.getItem("access_token")
var host = localStorage.getItem("cloudHost")

var listURL = {}
var listHeaders = {}
var listData = {}
var continueURL = {}
// Dropbox settings
listURL['dropbox'] = 'https://api.dropboxapi.com/2/files/list_folder'
listHeaders['dropbox'] = {
  "Authorization": "Bearer " + token,
  "Content-Type": "application/json"
}
listData['dropbox'] = {path: "/DiogenesWeb", recursive: true, include_deleted: false, include_has_explicit_shared_members: false, include_mounted_folders: true, include_non_downloadable_files: false}
continueURL['dropbox'] = 'https://api.dropboxapi.com/2/files/list_folder/continue'

var dbx = new Dropbox.Dropbox({ accessToken: token });
console.log('dbx', dbx)
function refreshList () {
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
     li.appendChild(document.createTextNode(files[i].name));
     filesList.appendChild(li);
   }
 }

function goUrl (path) {
  var newUrl = window.location.origin + '/' + path
  if (localStorage.getItem("user")) {
    newUrl = newUrl + "?user=" + localStorage.getItem("user")
    window.location.assign(newUrl)
  }
  else {
    alert("Error: missing user type!")
  }
}

function showList () {

  goUrl('showList')
}

// function refreshList () {
//   $.ajax({
//     url: listURL[host],
//     method: "POST",
//     headers: listHeaders[host],
//     contentType: 'application/json',
//     //data: JSON.stringify(listData[host]),
//     data: "foobar",
//     dataType: "JSON",
//     processData: false
//   }).done(function(data){
//     processList(data)
//   })
// }

function processList (data) {
  fileList.push(data.file_requests)
  if (data.has_more) {
    continueList(data.cursor)
  }
  else {
    finishList()
  }
}

function continueList (cursor) {
  $.ajax({
    url: continueURL[host],
    method: "POST",
    headers: listHeaders[host],
    contentType: 'application/json',
    data: JSON.stringify({cursor: cursor}),
    processData: false
  }).done(function(data){
    processList(data)
  })
}

function finishList () {
  localStorage.setItem("fileList", JSON.stringify(fileList))
  fileList.forEach(function (el) {
    console.log(el.path_display)
  })
}

function searchList () {

  goUrl('search')
}

function settings () {
  goUrl('settings')
}
