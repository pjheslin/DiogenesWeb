var token = localStorage.getItem("access_token")
var host = localStorage.getItem("cloudHost")
var filePath
var mainDiv
var dbx
window.addEventListener('DOMContentLoaded', (event) => {
  path = document.getElementById('path').textContent
  mainDiv = document.getElementById('main')

  if (host == "dropbox") {
    dbx = new Dropbox.Dropbox({ accessToken: token });
    console.log('dbx', dbx)
    //function getFile () {getFileDropbox()}
  }
  getFileDropbox(path)
});


function getFileDropbox (path) {
  dbx.filesDownload({path: path})
  .then(function(response) {
    console.log('response', response)
    processFile(response);
    //console.log(response);
  })
  .catch(function(error) {
    console.error(error);
  });
}

function processFile (data) {
  console.log(data.fileBlob)
  // filBlob.text() is only implemented in Chrome
  // data.fileBlob.text()
  // .then()
  // So we use this interface instead
  var reader = new FileReader()
  var text
  reader.onload = function(e) {
    text = reader.result;
    parseXML(text)
  }
  reader.readAsText(data.fileBlob);
}

function parseXML (xmlDoc) {
  var parser = new DOMParser();
  var xml = parser.parseFromString(xmlDoc, "application/xml");
  console.log(xml)
  walkTheDOM(xml.getElementsByTagName('body')[0], processNode);
}


function walkTheDOM(node, func) {
    func(node);
    node = node.firstChild;
    while (node) {
        walkTheDOM(node, func);
        node = node.nextSibling;
    }
}

function processNode (node) {
  if (node.nodeType === 3) { // Is it a Text node?
    var text = node.data.trim();
    if (text.length > 0) { // Does it have non white-space text content?
      mainDiv.appendChild(node)
    }
  }
  else if (node.nodeType == 1 && node.nodeName == 'l') {
    mainDiv.appendChild(document.createElement('br'))
  }
}
