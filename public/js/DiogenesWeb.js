// Non-page-specific code
NodeList.prototype.forEach = Array.prototype.forEach
NamedNodeMap.prototype.forEach = Array.prototype.forEach

window.addEventListener('DOMContentLoaded', (event) => {
  makeHamburgerMenu();
  // We may need to do this again after modifying the DOM.
  setupFolding();
})

/* Set the width of the side navigation to 250px */
function openNav () {
  document.getElementById("mySidenav").style.width = "150px"
  document.getElementById("navCloseBtn").style.display = "inline"
}

/* Set the width of the side navigation to 0 */
function closeNav () {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("navCloseBtn").style.display = "none";
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
      // If uncollape action scrolls section out of view, put it at top of screen.
      if (!isVisible(this)) {
        this.scrollIntoView({block: "start"})
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
  var href
  if (localStorage.getItem("user")) {
    href = window.location.origin + '/' +
    "?user=" + localStorage.getItem("user")
  }
  else {
    href = window.location.origin + '/'
  }
  window.location.href = href
}

function goSettings () {
  // FIXME
}

function isVisible (el) {
    var rect = el.getBoundingClientRect()
    var elemTop = rect.top
    var elemBottom = rect.bottom

    // Only completely visible elements return true:
    // var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    // Partially visible elements return true:
    var isVisible = elemTop < window.innerHeight && elemBottom >= 0
    return isVisible
}

var hamburgerNavbar =
`<div id="mySidenav" class="sidenav">
  <a href="javascript:void(0)" id="navCloseBtn"
  onclick="closeNav()">&times;</a>
  <a href="#" onclick="collapseAll()">Collapse&nbsp;All</a>
  <a href="#" onclick="expandAll()">Expand&nbsp;All</a>
  <a href="#" onclick="goHome()">Home</a>
  <a href="#" onclick="goSettings()">Settings</a>
</div>

<div class="hamburger" id="hamburger" onclick="openNav()">
  <div class="hamburger-bar"></div>
  <div class="hamburger-bar"></div>
  <div class="hamburger-bar"></div>
</div>`;

function makeHamburgerMenu () {
  var burger = document.getElementById('hamburger-navbar');
  if (burger) {
    burger.innerHTML = hamburgerNavbar
  }
}

function connectDropbox () {
  var newUrl = window.location.origin + "/authorizeDropbox"
  if (localStorage.getItem("user")) {
    newUrl = newUrl + "?user=" + localStorage.getItem("user")
  }
  else {
    newUrl = window.location.origin + '/'
  }
  console.log(newUrl)
  window.location.href = newUrl
}

function openLocalFile (path) {
  var body = document.getElementsByTagName("BODY")[0];
  body.classList.add("waiting");

  console.log('path:'+path)
  var href
  if (localStorage.getItem("user")) {
    href = window.location.origin + '/fileDisplay' +
    "?user=" + localStorage.getItem("user") +
    '&host=local' +
    '&filePath=' + path
  }
  else {
    href = window.location.origin + '/'
  }
  window.location.href = href
}
