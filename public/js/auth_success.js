// Url fragment after # is only available on the client side.
var params = window.utils.parseQueryString(window.location.hash)
localStorage.setItem("dropbox_token", params.access_token)

function showDropbox () {
  if (localStorage.getItem("user")) {
    var url = window.location.origin + "/web/listDropbox"
    url = url + "?user=" + localStorage.getItem("user")
    window.location.href = url
  }
  else {
    alert("Error: missing user type!")
  }
}
