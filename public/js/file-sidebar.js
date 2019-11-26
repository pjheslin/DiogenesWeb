// const parseURL = 'http://localhost:8990/parse?'
const parseURL = window.origin.replace(':8989', ':8990') + '/parse?'

/* Send Ajax request to Perseus data server */
var req
function sendRequest(action, lang, query, enc) {
  /* Check for running connections */
  if (req != null && req.readyState != 0 && req.readyState != 4) {
    req.abort();
  }
  if (window.XMLHttpRequest) {
    req = new XMLHttpRequest();     // Firefox, Safari, ...
  } else if (window.ActiveXObject) {
    req = new ActiveXObject("Microsoft.XMLHTTP");  // Internet Explorer
  }
  req.onreadystatechange = stateHandler;
  // For safety, we should really use encodeURIComponent() to
  // encode these params and then decode them in Perseus.cgi.
  var uri = parseURL + "do=" + action + "&lang=" + lang + "&q="+ query
  if (enc) {
    // Send utf8 from user input (as opposed to text links, which use transliteration)
    uri = uri + "&inp_enc=" + enc
  }
  req.open("GET", uri);
  req.send();
}
function stateHandler() {
  if (req.readyState == 4) {
    if (req.status && req.status == 200) {
      initializeSidebar();
    }
  }
}
var sidebarOpen = false
function initializeSidebar () {
  var sidebar = document.getElementById("sidebar")
  if (sidebar == null) {
    alert("Error: no sidebar")
  }
  else {
    sidebar.innerHTML = req.responseText
    makeSidebarControl()
    sidebar.scrollTop = 1
  }
  showSidebar()
}
function showSidebar () {
  if (!sidebarOpen) {
    closeNav()
    sidebar.style.width = "50%"
    document.getElementById("main").style.marginRight = "50%";
    document.getElementById("hamburger").style.display = "none";
    document.getElementById("parseCloseBtn").style.display = "inline";
    // When sidebar opens, main text reflows and often hides the word clicked
    current_parse.scrollIntoView({block: "center"})
    sidebarOpen = true
  }
}
function hideSidebar () {
  var sidebar = document.getElementById("sidebar")
  sidebar.style.width = "0px"
  document.getElementById("main").style.marginRight = "0px";
  document.getElementById("parseCloseBtn").style.display = "none";
  document.getElementById("hamburger").style.display = "inline";
  current_parse.scrollIntoView({block: "center"})
  sidebarOpen = false
}
function makeSidebarControl () {
  var sidebarControl = document.getElementById("sidebar-control");
  sidebarControl.innerHTML = '<a href="javascript:void(0)" id="parseCloseBtn" onclick="hideSidebar()">&times;</a>'
}

/* General function for parsing a word within a *text* */
var current_parse
function p (element) {
  if (current_parse) {
    current_parse.classList.remove("highlighted-word");
  }
  current_parse = element
  current_parse.classList.add("highlighted-word");
  // console.log(element)
  var word = element.textContent
  if  (word.match(/[\u0370-\u03FF\u1F00-\u1FFF]/)) {
    sendRequest("parse", "grk", word, 'utf8')
  }
  else {
    sendRequest("parse", "lat", word, 'utf8')
  }
}
/* We also need these, for links within lexicon defintions */
function parse_grk (word) {
  // if (current_parse) {
  //   current_parse.classList.remove("highlighted-word");
  // }
  sendRequest("parse", "grk", word, 'utf8')
}
function parse_lat (word) {
  // if (current_parse) {
  //   current_parse.classList.remove("highlighted-word");
  // }
  sendRequest("parse", "lat", word)
}
function parse_eng (word) {
  // if (current_parse) {
  //   current_parse.classList.remove("highlighted-word");
  // }
  sendRequest("parse", "eng", word)
}

function getEntrygrk (loc) {
    sendRequest("get_entry", "grk", loc)
    // window.scrollTo(0,0)
}
function getEntrylat (loc) {
    sendRequest("get_entry", "lat", loc)
    // window.scrollTo(0,0)
}
function getEntryeng (loc) {
    sendRequest("get_entry", "eng", loc)
    // window.scrollTo(0,0)
}

function prevEntrygrk (loc) {
    sendRequest("prev_entry", "grk", loc)
    // window.scrollTo(0,0)
}
function prevEntrylat (loc) {
    sendRequest("prev_entry", "lat", loc)
    // window.scrollTo(0,0)
}
function prevEntryeng (loc) {
    sendRequest("prev_entry", "eng", loc)
    // window.scrollTo(0,0)
}

function nextEntrygrk (loc) {
    sendRequest("next_entry", "grk", loc)
    // window.scrollTo(0,0)
}
function nextEntrylat (loc) {
    sendRequest("next_entry", "lat", loc)
    // window.scrollTo(0,0)
}
function nextEntryeng (loc) {
    sendRequest("next_entry", "eng", loc)
    // window.scrollTo(0,0)
}
