const corpusNames = {
  phi: "PHI Latin Texts",
  tlg: "TLG Texts",
  misc: "Misc PHI Texts",
  unknown: "Texts of Unknown Provenance"
}

var fileList
window.addEventListener('DOMContentLoaded', (event) => {
  fileList = document.getElementById('fileList');
  showSavedDropbox()
})

function showSavedDropbox () {
  if (localStorage.getItem('dropboxFileList')) {
    showDropboxList(JSON.parse(localStorage.getItem('dropboxFileList')))
  }
  else {
    getListDropbox()
  }
}

function getListDropbox () {
  var token = localStorage.getItem("access_token")
  var dbx = new Dropbox.Dropbox({ accessToken: token });

  return dbx.filesListFolder({path: '', recursive: true, include_deleted: false})
  .then (function(response) {
    console.log('response', response)
    // console.log(response.entries);
    // Filter out folders
    var entries = response.entries.filter(ent => {return ent[".tag"] == "file"})
    // Filter out non-XML files
    entries = entries.filter(ent => {return ent.name.match(/\.xml$/)})
    // Is path_display the right feature to extract?
    var filenames = entries.map(file => file.path_display)
    return getMetadata(filenames);
  })
  .then (function (metadata) {
    console.log(metadata)
    sortFiles(metadata)
    //??
  })
  .catch (function(error) {
    console.error(error);
  });
}

function getMetadata (files) {
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest()
    req.onreadystatechange = function () {
      if (req.readyState !== 4) return;
      if (req.status >= 200 && req.status < 300) {
        console.log(req.response)
        resolve(JSON.parse(req.response))
      } else {
        // If failed
        reject({
          status: req.status,
          statusText: req.statusText
        })
      }
    }
    var url = window.location.origin + '/getMetadata' + "?user=" + localStorage.getItem("user")
    // console.log(url)
    req.open("POST", url);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.responseType = 'json'
    req.send(JSON.stringify(files));
  })
}

// For Perl-style autovivification
var tree = () => new Proxy({}, { get: (target, name) => name in target ? target[name] : target[name] = tree() })

// Test:
function sortFiles (files) {
  var presortObj = tree()
  for (var i = 0; i < files.length; i++) {
    console.log(files[1])
    var [filename, author, work] = files[i]
    var corpus = filename.match(/([a-z]+)\d+\.xml$/)[1]
    if (author == "???" & work == "???") {
      corpus = "unknown"
      author = filename
    }
    console.log(author, work, corpus)
    presortObj[corpus][author][work] = filename
  }
  console.log(presortObj)
  var sortedArr = []
  var unknownArr
  Object.keys(presortObj).sort().forEach(function (corpus) {
    var corpusArr = [corpus]
    if (corpus == "unknown") {
      unknownArr = Object.keys(presortObj[corpus]).sort()
      return
    }
    Object.keys(presortObj[corpus]).sort().forEach(function (author) {
      var authorArr = [author]
      Object.keys(presortObj[corpus][author]).sort().forEach(function (work) {
        var workArr = [work, presortObj[corpus][author][work]]
        console.log(JSON.stringify(authorArr))
        authorArr.push(workArr)
        // authorArr[1] = workArr
        console.log(JSON.stringify(authorArr))
      })
      corpusArr.push(authorArr)
      console.log(JSON.stringify(corpusArr))
    })
    console.log(corpusArr)
    console.log(JSON.stringify(sortedArr))
    sortedArr.push(corpusArr)
    console.log(JSON.stringify(sortedArr))
  })
  if (unknownArr) {
    sortedArr.push(unknownArr)
  }
  console.log(JSON.stringify(sortedArr))

  localStorage.setItem('dropboxFileList', JSON.stringify(sortedArr))
  showDropboxList(sortedArr)
}

function showDropboxList (sortedArr) {
  console.log(JSON.stringify(sortedArr))
  var html = ''
  sortedArr.forEach(corpusArr => {
    var corpus = corpusArr.shift()
    corpus_display = corpusNames[corpus];
    html += `<button type="button" class="collapsible" onClick="toggleFold(this)">${corpus_display}</button>\n`
    html += `<div type="corpus" class="content">\n`
    if (corpus == "unknown") {
      corpusArr.foreach(filename => {
        //??
      })
      return
    }
    corpusArr.forEach(authorArr => {
      var author = authorArr.shift()
      html += `<button type="button" class="collapsible authorName" onClick="toggleFold(this)">${author}</button>\n`
      html += `<div type="author" class="content">\n`
      authorArr.forEach(workArr => {
        var [work, filename] = workArr
        html += `<button type="button" class="uncollapsible fileName"  onClick="openDropboxFile('${filename}')">${work}</button>\n`
      })
      html += `</div>\n`
    })
    html += `</div>\n`
  })
  fileList.innerHTML = html
  // innerHTML can take too long, so we cannot use setupFolding here
}

function openDropboxFile (path) {
  console.log(path)
  var body = document.getElementsByTagName("BODY")[0];
  body.classList.add("waiting");

  var href
  if (localStorage.getItem("user")) {
    href = window.location.origin + '/fileDisplay' +
    "?user=" + localStorage.getItem("user") +
    '&host=dropbox' +
    '&filePath=' + path
  }
  else {
    href = window.location.origin + '/'
  }
  window.location.href = href
}
