"use strict"
// Handlebars also requires the fs module
const fs = require('fs');
const path = require('path')
const express = require('express')
const app = express()
const port = 8989
const handlebars = require('handlebars')

// Read metadata index
var index = JSON.parse(fs.readFileSync('generated/index.json', 'utf8'))

// Set up handlebars
app.set('views', './views')
app.set('view engine', 'hbs')
app.engine('hbs', function (filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(err)
    // this is an extremely simple template engine
    var source = content.toString()
    var template = handlebars.compile(source)
    var html = template(options);
    return callback(null, html)
  })
})

// Get environment variables
require('dotenv').config()

// For speed, static files are not served by this server.

// Version in query string is ignored; it is only to force the browser not to
// use a cached version after upgradeœ 

// For HTML served from here, generated from templates
var htmlFileOptions = {
  root: path.join(__dirname, 'generated'),
  dotfiles: 'deny',
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true
  }
}

// For XML texts
var staticFileOptions = {
  root: path.join(__dirname, 'static'),
  dotfiles: 'deny',
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true
  }
}

// For metdata
app.use(express.json());

// Send user identification page unless param set
app.get('*', (req, res, next) => {
  // console.log('Getting: ' + req.path)
  if (req.query && req.query.user) {
    // console.log('User type: ' + req.query.user)
    next()
  }
  else if (req.path == '/web/authDropbox') {
    // Any pages that should be loaded without the user param go here.
    next()
  }
  else if (req.path == '/web/identify') {
    res.sendFile('identify.html', htmlFileOptions)
  }
  else {
    // console.log("No user type given")
    res.sendFile('identify.html', htmlFileOptions)
  }
})

// We are sent here after choosing cloud host, to which we now redirect
app.get('/web/authorizeDropbox', (req, res, next) => {
  var protocol = 'https'
  if (req.get('Host').match(/localhost/)) {
    protocol = 'http'
  }
  var origUrl = protocol + '://' + req.get('Host');
  // console.log('origURL: '+origUrl)
  var authRedirect = origUrl+'/web/authDropbox'
  // var authRedirect = 'https://d.iogen.es/web/authDropbox'
  var dropboxClientId = process.env.DROPBOX_APP_KEY;
  var dropboxAuthURL = "https://www.dropbox.com/oauth2/authorize?client_id=" + dropboxClientId + "&response_type=token&redirect_uri=" + authRedirect
  // console.log(dropboxAuthURL)
  res.redirect(dropboxAuthURL)
})

// We are redirected here after authorizing
app.get('/web/authDropbox', (req, res) => {
  // console.log("auth!")
  if (req.query.error) {
    res.render('auth_error', {error: req.query.error, desc: req.query.error_description})
  } else if (typeof req.query.dropbox_token === undefined) {
    res.render('auth_error', {error: 0, desc: "Unknown Error"})
  } else {
    //    console.log(req.query.dropbox_token)
    //    res.render('auth_success', {token: req.query.dropbox_token})
    res.sendFile('dropbox_success.html', htmlFileOptions)
  }
})

app.get('/web/listDropbox', (req, res) => {
  res.sendFile('file-list-dropbox.html', htmlFileOptions)
})

app.get('/web/fileDisplay', (req, res) => {
  var host = req.query.host
  var path = req.query.filePath
  // console.log('path! '+path)
  res.render('file_display', {host: host, path: path})
})

// Send home page otherwise
app.get('/web/', (req, res) => {
  res.sendFile('file-list-public.html', htmlFileOptions)
})

// For Ajax requests of XML files
app.get('/web/serveXml', (req, res) => {
  var path = req.query.xmlPath
  path = path.replace(/^static\//, '')
  res.sendFile(path, staticFileOptions, function (err) {
    if (err) {
      console.log(err)
      next(err)
    } else {
      // console.log('Sent:'+path)
    }
  })
})

// Get author and work names from list of filenames.
app.post('/web/getMetadata', (req, res) => {
  var files = req.body
  // console.log(req.body)
  var metadata = []
  files.forEach(fullPath => {
    var filename = path.parse(fullPath).base;
    var data
    if (index[filename]) {
      data = index[filename].slice() // clone array
      // console.log('D: '+data)
    }
    else {
      data = ["???", "???"]
    }
    data.unshift(fullPath)
    metadata.push(data)
  })
  // console.log(JSON.stringify(metadata))
  res.json(JSON.stringify(metadata))
})

app.get('/web/favicon.ico', (req, res) => {
  res.sendFile('images/favicon.ico', staticFileOptions)
})

// var os = require( 'os' );
// var networkInterfaces = os.networkInterfaces();
// var ipAddr = networkInterfaces['en0'][1]['address']
// app.listen(port, ipAddr, () => console.log(`DiogenesWeb listening on ${ipAddr}:${port}!`))

app.listen(port, '0.0.0.0', () => console.log(`DiogenesWeb listening on ${port}!`))
