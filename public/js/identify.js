// Is localStorage available?
var lsTest = function () {
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}();

function setUser (type) {
  if (lsTest === true) {
    localStorage.setItem("user", type)
    var newUrl = "../web/?user=" + type
    window.location.replace(newUrl)
  } else {
    alert("Error: DiogenesWeb will not work with this browser, as Local Storage is not available.")
  }
}
