var token = localStorage.getItem("access_token")
var host = localStorage.getItem("cloudHost")
var filePath
var mainDiv
var dbx
window.addEventListener('DOMContentLoaded', (event) => {
  path = document.getElementById('path').textContent
  mainDiv = document.getElementById('main')

  if (path == "__test__") {
    getFileLocal("test.xml")
  }
  else if (host == "dropbox") {
    dbx = new Dropbox.Dropbox({ accessToken: token });
    console.log('dbx', dbx)
    //function getFile () {getFileDropbox()}
    getFileDropbox(path)
  }
});

function reqListener () {
  console.log(this.responseXML);
  processXML(this.responseXML)
}

function getFileLocal (path) {
  var req = new XMLHttpRequest();
  req.addEventListener("load", reqListener);
  req.open("GET", window.location.origin + "/" + path);
  req.send();
}

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
  processXML(xml)
}

var current
function processXML (xml) {
  current = mainDiv
  walkTheDOM(xml.getElementsByTagName('body')[0], processNode);
}

function walkTheDOM(node, func) {
  var oldCurrent = current
  func(node)
  node = node.firstChild;
  while (node) {
    walkTheDOM(node, func);
    node = node.nextSibling;
  }
  current = oldCurrent
}

const nodes = {
  l: function () {
    if (this.firstChild && this.firstChild.nodeName == 'label') { return }
    var div = document.createElement('div')
    div.setAttribute('name', 'line')
    var num = this.getAttribute('n')
    if (num && num % 5 === 0) {
      var lineNum = document.createElement('span')
      lineNum.setAttribute('class', 'lineNum')
      lineNum.appendChild(document.createTextNode(num))
      div.appendChild(lineNum)
    }
    return div
  },
  div: function () {
    // if (this.getAttribute('n') == 't') { return }
    var div = document.createElement('div')
    if (this.hasAttributes) {
      Array.prototype.slice.call(this.attributes).forEach(function (item) {
        div.setAttribute(item.name, item.value)
      })
    }
    return div
  },
  label: function () {
    var h1 = document.createElement('h1')
    return h1
  }
};



function processNode (node) {
  // console.log(current)
  if (node.nodeType === 3) {
    var text = node.data.trim();
    if (text.length > 0) {
      current.appendChild(node)
    }
  }
  else if (node.nodeType == 1) {
    var name = node.nodeName
    // console.log(name)
    // console.log(current)
    // console.log(nodes[str])
    var htmlNode
    if (nodes[name]) {
      htmlNode = nodes[name].apply(node)
      if (htmlNode) {
        // console.log(htmlNode.nodeName)
        var rend = node.getAttribute('rend')
        if (rend) {
          rend = rend.replace('(', '')
          rend = rend.replace(')', '')
          htmlNode.setAttribute('class', rend)
        }
        current.appendChild(htmlNode)
        if (node.firstChild && htmlNode.nodeName != 'BR') {
          // Make current element the new parent, unless XML node is empty or we want to force the htmlNode to be empty.
          current = htmlNode
        }
      }
    }
  }
}
