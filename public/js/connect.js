"use strict"
console.log('LOADED')
function connect (host) {
  console.log(host)
  localStorage.setItem("cloudHost", host)
  var newUrl = window.location.origin + "/authRedirect?host=" + host
  if (localStorage.getItem("user")) {
    newUrl = newUrl + "&user=" + localStorage.getItem("user")
  }
  window.location.replace(newUrl)

}
