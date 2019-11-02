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
    // console.log('dbx', dbx)
    //function getFile () {getFileDropbox()}
    getFileDropbox(path)
  }
});

/* Set the width of the side navigation to 250px */
function openNav () {
  document.getElementById("mySidenav").style.width = "150px";
}

/* Set the width of the side navigation to 0 */
function closeNav () {
  document.getElementById("mySidenav").style.width = "0";
}

function setupFolding () {
  var coll = document.getElementsByClassName("collapsible")
  var i
  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active")
      var content = this.nextElementSibling
      if (content.style.display === "block") {
        content.style.display = "none"
      } else {
        content.style.display = "block"
      }
    })
  }
}

function expandAll () {
  var coll = document.getElementsByClassName("collapsible")
  var i
  for (i = 0; i < coll.length; i++) {
    var e = coll[i]
    if (!e.classList.contains("active")) {
      coll[i].classList.add("active")
      var content = coll[i].nextElementSibling
      content.style.display = "block"
    }
  }
  closeNav ()
}

function collapseAll () {
  var coll = document.getElementsByClassName("collapsible")
  var i
  for (i = 0; i < coll.length; i++) {
    var e = coll[i]
    if (e.classList.contains("active")) {
      e.classList.remove("active")
      var content = e.nextElementSibling
      content.style.display = "none"
    }
  }
  closeNav ()
}

function goHome () {
  var href = window.location.origin + '/' +
  "?user=" + localStorage.getItem("user")
  window.location.href = href
}

function goSettings () {
  // FIXME
}

function reqListener () {
  // console.log(this.responseXML);
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
    // console.log('response', response)
    processFile(response);
    //console.log(response);
  })
  .catch(function(error) {
    console.error(error);
  });
}

function processFile (data) {
  // console.log(data.fileBlob)
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
  // console.log(xml)
  processXML(xml)
}

function processXML (xml) {
  current = mainDiv
  walkTheDOM(xml.getElementsByTagName('body')[0], processNode)
  processingFinished()
}

var levels = {} // Current number of all div levels
var labels = {} // Names of divs
var level = 0 // Current level of div nesting
var suppress // Suppress title divs until we encounter a proper div at this same level
var current // Current HTML node to append to

function walkTheDOM(node, func) {
  var oldCurrent = current
  var oldLevel = level
  func(node)
  node = node.firstChild;
  while (node) {
    walkTheDOM(node, func);
    node = node.nextSibling;
  }
  current = oldCurrent
  level = oldLevel
}

const nodes = {
  l: function () {
    // if (this.firstChild && this.firstChild.nodeName == 'label') { return }
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
    var type = this.getAttribute('type')
    var n = this.getAttribute('n')
    if (n == 't') {
      suppress = type
      return
    }
    if (suppress && suppress == type) {
      suppress = ''
    }
    if (suppress) { return }

    level++
    labels[level] = type
    levels[level] = n
    var div = document.createElement('div')
    if (this.hasAttributes) {
      Array.prototype.slice.call(this.attributes).forEach(function (item) {
        div.setAttribute(item.name, item.value)
      })
    }
    div.setAttribute('class', 'content')
    var button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.setAttribute('class', 'collapsible')
    var label = ''
    for (let lev = 1; lev <= level; lev++) {
      label = label + capitalizeFirstLetter(labels[lev]) + ' ' + levels[lev]
      if (lev != level) {
        label = label + ', '
      } else {
        label = label + '.'
      }
    }
    button.appendChild(document.createTextNode(label))
    current.appendChild(button)
    return div
  },
  label: function () {
    var type = this.getAttribute('type')
    if (type == 'head') {
      var h1 = document.createElement('h1')
      return h1
    }
    else if (type == 'speaker') {
      var span = document.createElement('span')
      span.setAttribute('class', 'speaker')
      return span
    }
  },
  hi: function () {
     return document.createElement('span')
  },
  seg: function () {
     return document.createElement('span')
  },
  p: function () {
     return document.createElement('p')
  },
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function processNode (node) {
  // console.log(current)
  if (node.nodeType === 3) {
    var text = node.data;
    // console.log(text)
    current.appendChild(document.createTextNode(text))
  }
  else if (node.nodeType == 1) {
    var name = node.nodeName
     // console.log('>'+name)
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
      else {
         console.log('Unsupported element: ' + name)
      }
    }
  }
}

function processingFinished () {
  setupFolding ()
}
