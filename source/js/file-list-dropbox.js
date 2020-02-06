var token = localStorage.getItem("dropbox_token")
var dbx = new Dropbox.Dropbox({ accessToken: token, fetch: fetch })

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

// A better design might make this much more efficient and parallelized.  To make sure that all of the calls to Dropbox and to the DiogenesWeb metadata server are finished before sorting the files, I had to put in lots of awaits.  But refreshing the filelist should be a relatively rare operation, so it will do.

var dbxMetadata = []
const addEntries = async (entries) => {
  // Filter out folders
  entries = entries.filter(ent => {return ent[".tag"] == "file"})
  // Filter out non-XML files
  entries = entries.filter(ent => {return ent.name.match(/\.xml$/)})
  entries = entries.filter(ent => {return !ent.name.match(/^authtab\.xml$/)})
  // Is path_display the right feature to extract?
  var filenames = entries.map(file => file.path_display)
  // console.log(filenames)
  var metadata = await getMetadata(filenames)
  dbxMetadata = dbxMetadata.concat(metadata)
}

const getMoreFiles = async (cursor) => {
  fileList.innerHTML += '<div class="centering">Loading more entries ...<br/></div>'
  var response = await dbx.filesListFolderContinue({ cursor })

  await addEntries(response.entries)

  // Recursive call
  if (response.has_more) {
    await getMoreFiles(response.cursor)
  }
}

const getFiles = async () => {
  var response = await dbx.filesListFolder({path: '', recursive: true, include_deleted: false})

  await addEntries(response.entries)

  if (response.has_more) {
    await getMoreFiles(response.cursor)
  }
}

// return dbx.filesListFolderContinue({cursor: cursor})
const getListDropbox = async () => {
  fileList.innerHTML = '<div class="centering">Loading entries ...<br/></div>'

  await getFiles()

  // console.log(dbxMetadata)
  sortFiles(dbxMetadata)
}

function getMetadata (files) {
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest()
    req.onreadystatechange = function () {
      if (req.readyState !== 4) return;
      if (req.status >= 200 && req.status < 300) {
        // console.log(req.response)
        resolve(JSON.parse(req.response))
      } else {
        // If failed
        reject({
          status: req.status,
          statusText: req.statusText
        })
      }
    }
    var url = '../web/getMetadata' + "?user=" + localStorage.getItem("user")
    req.open("POST", url);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.responseType = 'json'
    req.send(JSON.stringify(files));
  })
}

// For Perl-style autovivification
var tree = () => new Proxy({}, { get: (target, name) => name in target ? target[name] : target[name] = tree() })

function sortFiles (files) {
  var presortObj = tree()
  for (var i = 0; i < files.length; i++) {
    var [filename, author, work] = files[i]
    // console.log(filename +' '+ author +' '+ work)
    var corpus
    var res = filename.match(/([a-z]+)\d+\.xml$/);
    if (res) {
      corpus = res[1]
    }
    else {
      corpus = 'unknown'
      author = filename
    }
    if (author == "???" & work == "???") {
      corpus = "unknown"
      author = filename
    }

    presortObj[corpus][author][work] = filename
  }
  // console.log(presortObj)
  var sortedArr = []
  var unknownArr
  Object.keys(presortObj).sort().forEach(function (corpus) {
    var corpusArr = [corpus]
    if (corpus == "unknown") {
      unknownArr = [corpus]
      unknownArr.push(Object.keys(presortObj[corpus]).sort())
      return
    }
    Object.keys(presortObj[corpus]).sort().forEach(function (author) {
      var authorArr = [author]
      Object.keys(presortObj[corpus][author]).sort().forEach(function (work) {
        var workArr = [work, presortObj[corpus][author][work]]
        authorArr.push(workArr)
      })
      corpusArr.push(authorArr)
    })
    sortedArr.push(corpusArr)
  })
  if (unknownArr) {
    sortedArr.push(unknownArr)
  }
  // console.log(JSON.stringify(sortedArr))

  localStorage.setItem('dropboxFileList', JSON.stringify(sortedArr))
  showDropboxList(sortedArr)
}

function showDropboxList (sortedArr) {
  // console.log(JSON.stringify(sortedArr))
  var html = ''
  sortedArr.forEach(corpusArr => {
    var corpus = corpusArr.shift()
    corpus_display = corpusNames[corpus];
    html += `<button type="button" class="collapsible" onClick="toggleFold(this)">${corpus_display}</button>\n`
    html += `<div type="corpus" class="content">\n`
    if (corpus == "unknown") {
      corpusArr.forEach(filename => {
        html += `<button type="button" class="uncollapsible fileName"  onClick="openDropboxFile('${filename}')">${filename}</button>\n`
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
  // console.log(path)
  var body = document.getElementsByTagName("BODY")[0];
  body.classList.add("waiting");

  var href
  if (localStorage.getItem("user")) {
    href = '../web/fileDisplay?ver=' + Version +
    "&user=" + localStorage.getItem("user") +
    '&host=dropbox' +
    '&filePath=' + path
  }
  else {
    href = '../web/identify'
  }
  window.location.href = href
}
