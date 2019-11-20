window.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById("provider").innerHTML = ' (' +  localStorage.getItem("cloudHost") + ')'
});


// Url fragment after # is only available on the client side.
var params = window.utils.parseQueryString(window.location.hash)
localStorage.setItem("access_token", params.access_token)
