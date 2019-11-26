"use strict"
// Handlebars also requires the fs module
const fs = require('fs');
const path = require('path')
const express = require('express')
const app = express()
const port = 8989
const handlebars = require('handlebars')

// Read metadata index
var index = JSON.parse(fs.readFileSync('utils/index.json', 'utf8'))

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

var sendFileOptions = {
  root: path.join(__dirname, 'public'),
  dotfiles: 'deny',
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true
  }
}

// Log all requests first
app.use(function (req, res, next) {
  console.log("Request: "+req.url);
  next();
});

// For misc assets
app.use(express.static('public'))
// For sidebar
app.use('/images', express.static(path.join(__dirname, 'public/images')))
// For metdata
app.use(express.json());

// Send user identification page unless param set
app.get('*', (req, res, next) => {
  // console.log('Getting: ' + req.path)
  if (req.query && req.query.user) {
    console.log('User type: ' + req.query.user)
    next()
  }
  else if (req.path == '/authDropbox') {
    // Any pages that should be loaded without the user param.
    next()
  }
  else {
    console.log("No user type given")
    res.sendFile('identify.html', sendFileOptions)
  }
})

// We are sent here from user id page
// app.get('/authOptions', (req, res, next) => {
//   //  res.render('connect', connections)
//   res.sendFile('connect.html', sendFileOptions)
// })

// We are sent here after choosing cloud host, to which we now redirect
app.get('/authorizeDropbox', (req, res, next) => {
  var protocol = 'https'
  if (req.get('Host').match(/localhost/)) {
    protocol = 'http'
  }
  var origUrl = protocol + '://' + req.get('Host');
  console.log('origURL: '+origUrl)
  var authRedirect = origUrl+'/authDropbox'
  var dropboxClientId = process.env.DROPBOX_APP_KEY;
  var dropboxAuthURL = "https://www.dropbox.com/oauth2/authorize?client_id=" + dropboxClientId + "&response_type=token&redirect_uri=" + authRedirect
  // console.log(authURL)
  res.redirect(dropboxAuthURL)
})

// We are redirected here after authorizing
app.get('/authDropbox', (req, res) => {
  // console.log("auth!")
  if (req.query.error) {
    res.render('auth_error', {error: req.query.error, desc: req.query.error_description})
  } else if (typeof req.query.access_token === undefined) {
    res.render('auth_error', {error: 0, desc: "Unknown Error"})
  } else {
    //    console.log(req.query.access_token)
    //    res.render('auth_success', {token: req.query.access_token})
    res.sendFile('dropbox_success.html', sendFileOptions)
  }
})

app.get('/listDropbox', (req, res) => {
  res.sendFile('file-list-dropbox.html', sendFileOptions)
})

app.get('/fileDisplay', (req, res) => {
  var host = req.query.host
  var path = req.query.filePath
  // console.log('path! '+path)
  res.render('file_display', {host: host, path: path})
})

// Send home page otherwise
app.get('/', (req, res) => {
  res.sendFile('file-list-public.html', sendFileOptions)
})

// Settings (set on client side)
app.get('/settings', (req, res) => {
  res.sendFile('settings.html', sendFileOptions)
})

// For Ajax requests of XML files
app.get('/serveXml', (req, res) => {
  var path = req.query.xmlPath
  path = path.replace(/^public\//, '')
  res.sendFile(path, sendFileOptions, function (err) {
    if (err) {
      console.log(err)
      next(err)
    } else {
      console.log('Sent:'+path)
    }
  })
})

// Get author and work names from list of filenames.
app.post('/getMetadata', (req, res) => {
  var files = req.body
  console.log(req.body)
  var metadata = []
  files.forEach(fullPath => {
    var filename = path.parse(fullPath).base;
    var data
    if (index[filename]) {
      data = index[filename].slice() // clone array
      console.log('D: '+data)
    }
    else {
      data = ["???", "???"]
    }
    data.unshift(fullPath)
    metadata.push(data)
  })
  console.log(JSON.stringify(metadata))
  res.json(JSON.stringify(metadata))
})

var os = require( 'os' );
var networkInterfaces = os.networkInterfaces();
var ipAddr = networkInterfaces['en0'][1]['address']

app.listen(port, ipAddr, () => console.log(`DiogenesWeb listening on ${ipAddr}:${port}!`))
