var token = localStorage.getItem("dropbox_token")
var filePath
var mainDiv
var dbx
window.addEventListener('DOMContentLoaded', (event) => {
  host = document.getElementById('host').textContent
  path = document.getElementById('path').textContent
  mainDiv = document.getElementById('main')

  // console.log(path)
  if (host == 'local') {
    getFileLocal(path)
  }
  else if (host == "dropbox") {
    dbx = new Dropbox.Dropbox({ accessToken: token, fetch: fetch });
    // console.log('dbx', dbx)
    //function getFile () {getFileDropbox()}
    getFileDropbox(path)
  }
  else {
    console.log('Unknown host! '+host)
  }
});

var XMLurl;
function getFileLocal (path) {
  var req = new XMLHttpRequest();
  req.addEventListener("load", reqListener);
  // var url = window.location.origin + '/serveXml' + "?user=" + localStorage.getItem("user") + '&xmlPath=' + path
  var url = '../static/' + path
  // console.log(url)
  XMLurl = url
  req.open("GET", url);
  req.send();
}
function reqListener () {
  // responseXML runs the parser
  if (this.responseXML === null) {
    // Errors in parsing XML
    mainDiv.innerHTML = `<h1>Error</h1><p class="centering">An error occurred when parsing this XML file.</p>.<p class="centering"><a href="${XMLurl}">Inspect XML file</a></p>`
  }
  // console.log(this.responseXML);
  processXML(this.responseXML)
  // parseXML(this.responseXML)
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

function makeTitle (xml) {
  var author
  if (xml.getElementsByTagName('author')[0]) {
    author = xml.getElementsByTagName('author')[0].textContent
  }
  var title
  if (xml.getElementsByTagName('title')[0]) {
    title = xml.getElementsByTagName('title')[0].textContent
  }
  if (author || title) {
    var button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.setAttribute('class', 'collapsible xml-header')
    button.setAttribute('onClick', 'toggleFold(this)')

    //h1.setAttribute('class', 'xml-header')
    if (author) {
      button.appendChild(document.createTextNode(author))
    }
    if (author && title) {
      button.appendChild(document.createTextNode(', '))
    }
    if (title) {
      var span = document.createElement('span')
      span.setAttribute('class', 'italic')
      span.appendChild(document.createTextNode(title))
      button.appendChild(span)
    }
    var div = document.createElement('div')
    div.setAttribute('class', 'content')
    var source = xml.getElementsByTagName('sourceDesc')[0]
    if (source) {
      div.appendChild(source)
    } else {
      div.appendChild(document.createTextNode('No source-text description available.'))
    }
    var link = document.createElement('a')
    link.setAttribute('onclick', 'showRawXML()')
    link.setAttribute('class', 'xmlLink')
    link.appendChild(document.createTextNode(' [Show raw XML]'))
    div.appendChild(link)
    mainDiv.appendChild(button)
    mainDiv.appendChild(div)
  }
}

var rawXML
// Very slow on large files
function showRawXML () {
  var serializer = new XMLSerializer();
  var xmlstring = serializer.serializeToString(rawXML);
  let blob = new Blob([xmlstring], {type: 'text/xml'});
  let url = URL.createObjectURL(blob);
  window.open(url);
  URL.revokeObjectURL(url); //Releases the resources
}

// For use outside the browser
exports.xml2html = function (xml) {
  console.log(document)
  processXML(xml)
}

function processXML (xml) {
  // console.log(xml)
  rawXML = xml
  makeTitle(xml)
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
    name = node.nodeName
    // If there are nodes we want to suppress with all children, we just need to
    // skip the following line.
    walkTheDOM(node, func);
    node = node.nextSibling;
  }
  current = oldCurrent
  level = oldLevel
}

var unsupported = {}
var noteNum = 0
/* Process each XML node and return an HTML node */
function translateNode (node) {
  switch (node.nodeName) {
    case 'milestone':
    case 'l': {
      // if (node.firstChild && node.firstChild.nodeName == 'label') { return }
      if (node.nodeName == 'milestone' && node.getAttribute('unit') != 'line' && node.getAttribute('unit') != 'verse') {
        return
      }
      var div = document.createElement('div')
      div.setAttribute('class', 'line')
      var num = node.getAttribute('n')
      if (num && num % 5 === 0) {
        var lineNum = document.createElement('span')
        lineNum.setAttribute('class', 'lineNum')
        lineNum.appendChild(document.createTextNode(num))
        div.appendChild(lineNum)
      }
      return div
    }
    case 'div1':
    case 'div2':
    case 'div3':
    case 'div4':
    case 'div5':
    case 'div6':
    case 'div7':
    case 'div': {
      var type = node.getAttribute('type')
      var subtype = node.getAttribute('subtype')
      var n = node.getAttribute('n')
      if (!n && !subtype) {
        return
      }
      if (n && n.match(/^urn:cts/)) {
        return
      }
      if (n == 't') {
        suppress = type
        return
      }
      if (suppress && suppress == type) {
        suppress = ''
      }
      if (suppress) { return }

      level++
      // Perseus idiosyncracy
      if (subtype && type == 'textpart') {
        labels[level] = subtype
        levels[level] = n || ''
      }
      else {
        labels[level] = type
        levels[level] = n || subtype
      }
      var div = document.createElement('div')
      if (node.hasAttributes) {
        var attrs = Array.prototype.slice.call(node.attributes);
        attrs.forEach(function (item) {
          div.setAttribute(item.name, item.value)
        })
      }
      var button = document.createElement('button')
      button.setAttribute('type', 'button')
      // if (type === 'Section' || type === 'section') {
      // if (node.textContent.length < 500) {
        // button.setAttribute('class', 'uncollapsible')
      // }
      // else {
        button.setAttribute('class', 'collapsible '+'divLevel'+level)
        button.setAttribute('onClick', 'toggleFold(this)')
        div.setAttribute('class', 'content')
      // }
      var label = ''
      for (let lev = 1; lev <= level; lev++) {
        label = label + capitalizeFirstLetter(labels[lev])
        if (levels[lev] && labels[lev]) {
          label = label + '\u00A0' + levels[lev]
        }
        else if (levels[lev]) {
          label = levels[lev]
        }
        if (lev != level) {
          label = label + ', '
        } else {
          label = label + '.'
        }
      }
      button.appendChild(document.createTextNode(label))
      current.appendChild(button)
      return div
    }
    case 'label': {
      var type = node.getAttribute('type')
      if (type == 'head') {
        var h1 = document.createElement('h1')
        return h1
      }
      else if (type == 'speaker') {
        var span = document.createElement('span')
        span.setAttribute('class', 'speaker')
        return span
      }
    }
    case 'speaker': {
      var span = document.createElement('span')
      span.setAttribute('class', 'speaker')
      return span
    }
    case 'head': {
      var h1 = document.createElement('h1')
      return h1
    }
    case 'sp': {
      return
    }
    case 'space': {
      var q = node.getAttribute('quantity') || 1
      var sp = '\u00A0'
      var str = sp.repeat(q)
      return document.createTextNode(str)
    }
    case 'hi': {
      return document.createElement('span')
    }
    case 'i':
    case 'emph':
    case 'term':
    case 'title': {
      var span = document.createElement('span')
      span.setAttribute('class', 'italic')
      return span
    }
    case 'seg': {
      return document.createElement('span')
    }
    case 'p': {
      return document.createElement('p')
    }
    case 'lg': {
      return document.createElement('p')
    }
    case 'lb': {
      return document.createElement('br')
    }
    case 'cb': {
      return document.createElement('br')
    }
    case 'g': {
      return document.createTextNode('[?]')
    }
    case 'body': {
      return
    }
    case 'pb': {
      return
    }
    // case 'milestone': {
    //   return
    // }
    case 'del': {
      return document.createElement('del')
    }
    case 'add':
    case 'corr':
    case 'supplied': {
      var span = document.createElement('span')
      span.setAttribute('class', 'supplied')
      return span
    }
    case 'sic':
    case 'unclear': {
      var span = document.createElement('span')
      span.setAttribute('class', 'unclear')
      return span
    }
    case 'gap': {
      return document.createTextNode('[...]')
    }
    case 'quote': {
      return document.createElement('blockquote')
    }
    case 'q': {
      if (node.getAttribute('rend') == 'blockquote') {
        return document.createElement('blockquote')
      }
      else {
        // In verse, the next line will be in a div, which will put it on
        // separate lines from the quote marks, which looks odd
        // return document.createElement('q')
        return document.createElement('blockquote')
      }
    }
    case 'graphic': {
      var img = document.createElement('img')
      var url = fixDltUrl(node.getAttribute('url'))
      img.setAttribute('src', url)
      img.setAttribute('class', 'dlt-img')
      return img
    }
    case 'list': {
      return document.createElement('ul')
    }
    case 'item': {
      return document.createElement('li')
    }
    case 'note': {
      noteNum += 1
      var mark = document.createElement('span')
      mark.setAttribute('class', 'noteMark')
      mark.setAttribute('id', 'noteMark-' + noteNum)
      mark.appendChild(document.createTextNode('*'))
      // mark.setAttribute('onclick', 'toggleNext(this)')
      var div = document.createElement('div')
      div.setAttribute('class', 'noteText')
      div.setAttribute('id', 'noteText-' + noteNum)
      // div.setAttribute('style', 'display: none;')
      div.style.display = 'none';
      // div.setAttribute('onclick', 'toggleNote(this)')
      return [mark, div, undefined]
    }
    case 'figure':
    case 'choice':
    case 'surname':
    case 'persName':
    case 'placeName':
    case 'name':
    case 'bibl':
    case 'ref':
    case 'foreign': {
      return
    }
    default: {
      // Only complain once
      if (!unsupported[node.nodeName]) {
        console.log('Unsupported element: ' + node.nodeName)
      }
      unsupported[node.nodeName] = true
      return
    }
  }
}

function fixDltUrl (url) {
  var match = url.match(/dlt\d\d\d\d\d\d/)
  if (match) {
    var num = match[0]
    return 'texts/DigiLibLT/'+num+'\/'+url
  }
  return url
}

function capitalizeFirstLetter(string) {
  if (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

/* Adapted from the smartquotes.js library */
function smartquotesString(str) {
  return str
  .replace(/'''/g, '\u2034') // triple prime
  .replace(/(\W|^)"(\S)/g, '$1\u201c$2')  // beginning "
  .replace(/(\u201c[^"]*)"([^"]*$|[^\u201c"]*\u201c)/g, '$1\u201d$2') // ending "
  .replace(/([^0-9])"/g,'$1\u201d')  // remaining " at end of word
  .replace(/''/g, '\u2033') // double prime
  // .replace(/(\W|^)'(\S)/g, '$1\u2018$2') // beginning '
  // .replace(/([a-z])'([a-z])/ig, '$1\u2019$2') // conjunction's possession
  // .replace(/((\u2018[^']*)|[a-z])'([^0-9]|$)/ig, '$1\u2019$3') // ending '
  // .replace(/'/g, '\u2032');
  .replace(/'/g, '\u2019'); // mark of elision
};

/* Create parsing links for each word */
var noLinks = false
exports.stopLinks = function () { noLinks = true }
const latinRegex = /[a-zA-Z]+/g
const greekRegex = /[\u0027\u2019\u0370-\u03FF\u1F00-\u1FFF]+/g
function parseReplace (match) {
  // return '<a onclick="parse_'+parseLang+'(\''+match+'\')">'+match+'</a>'
  if (noLinks) {
    return match
  }
  else {
    return '<a onclick="p(this)">'+match+'</a>'
  }
}
function addParseLinks (text) {
  text = text.replace(latinRegex, parseReplace)
  text = text.replace(greekRegex, parseReplace)
  var span = document.createElement('span')
  span.setAttribute('class', 'text')
  span.innerHTML = text
  return span
}

function processNode (node) {
  // console.log(current)
  if (node.nodeType === 3) {
    var text = smartquotesString(node.data)
    var span = addParseLinks(text)
    // var textNode = document.createTextNode(text)
    // smartquotes(textNode)
    // console.log(text)
    current.appendChild(span)
  }
  else if (node.nodeType == 1) {
    var name = node.nodeName
     // console.log('>'+name)
    // console.log(current)
    // console.log(nodes[str])
    let [prefix, htmlNode, suffix] = [undefined, undefined, undefined]
    let ret = translateNode(node)
    if (Array.isArray(ret)) {
      [prefix, htmlNode, suffix] = ret
    }
    else {
      htmlNode = ret
    }
    if (prefix) {
      current.appendChild(prefix)
    }
    //htmlNode = translateNode(node)
    if (htmlNode && htmlNode.nodeType != 3) {
      // console.log(htmlNode.nodeName, htmlNode.nodeType, node.nodeName)
      var rend = node.getAttribute('rend')
      if (rend) {
        rend = rend.replace('(', '')
        rend = rend.replace(')', '')
        htmlNode.setAttribute('class', rend)
      }
      current.appendChild(htmlNode)
      if (suffix) {
        current.appendChild(suffix)
      }

      if (node.firstChild && htmlNode.nodeName != 'BR') {
        // Make current element the new parent, unless XML node is empty or we want to force the htmlNode to be empty.
        current = htmlNode
      }
    }
  }
}

function setupTooltips () {
  tippy.setDefaultProps({
    allowHTML: true,
    arrow: true,
    hideOnClick: true,
    trigger: 'click',
    placement: 'auto'
  })
  for (let n = 1; n <= noteNum; n++) {
    let mark = document.getElementById('noteMark-'+n)
    let content = document.getElementById('noteText-'+n)
    content.style.display = 'block';
    tippy(mark, {content: content})
  }
}

function processingFinished () {
  // setupFolding ()
  setupTooltips()
  var body = document.getElementsByTagName("BODY")[0]
  body.classList.remove("waiting")
  var loading = document.getElementById('loading')
  loading.parentNode.removeChild(loading)
}
