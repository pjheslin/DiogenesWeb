window.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById("provider").innerHTML = ' (' +  localStorage.getItem("cloudHost") + ')'
});


// Url fragment after # is only available on the client side.
var params = window.utils.parseQueryString(window.location.hash)
localStorage.setItem("access_token", params.access_token)

// Dropbox
//createFolder

function goHome () {
  var newUrl = window.location.origin// + "/home"
  if (localStorage.getItem("user")) {
    newUrl = newUrl + "?user=" + localStorage.getItem("user")
    window.location.replace(newUrl)
  }
  else {
    alert("Error: missing user type!")
  }
}
