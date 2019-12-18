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

// For misc assets (still used?)
app.use(express.static('public'))
// For sidebar (not used anymore)
app.use('/images', express.static(path.join(__dirname, 'public/images')))
// For metdata
app.use(express.json());

// Doesn't work for increasing post limit
// var bodyParser = require('body-parser');
// app.use(bodyParser.json({limit: "50mb"}));
// app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

// Send user identification page unless param set
app.get('*', (req, res, next) => {
  // console.log('Getting: ' + req.path)
  if (req.query && req.query.user) {
    console.log('User type: ' + req.query.user)
    next()
  }
  else if (req.path == '/web/authDropbox') {
    // Any pages that should be loaded without the user param.
    next()
  }
  else {
    console.log("No user type given")
    res.sendFile('identify.html', sendFileOptions)
  }
})

// We are sent here after choosing cloud host, to which we now redirect
app.get('/web/authorizeDropbox', (req, res, next) => {
  var protocol = 'https'
  if (req.get('Host').match(/localhost/)) {
    protocol = 'http'
  }
  // var origUrl = protocol + '://' + req.get('Host');
  // console.log('origURL: '+origUrl)
  // var authRedirect = origUrl+'/authDropbox'
  var authRedirect = 'https://d.iogen.es/web/authDropbox'
  var dropboxClientId = process.env.DROPBOX_APP_KEY;
  var dropboxAuthURL = "https://www.dropbox.com/oauth2/authorize?client_id=" + dropboxClientId + "&response_type=token&redirect_uri=" + authRedirect
  console.log(dropboxAuthURL)
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
    res.sendFile('dropbox_success.html', sendFileOptions)
  }
})

app.get('/web/listDropbox', (req, res) => {
  res.sendFile('file-list-dropbox.html', sendFileOptions)
})

app.get('/web/fileDisplay', (req, res) => {
  var host = req.query.host
  var path = req.query.filePath
  // console.log('path! '+path)
  res.render('file_display', {host: host, path: path})
})

// Send home page otherwise
app.get('/web/', (req, res) => {
  res.sendFile('file-list-public.html', sendFileOptions)
})

// For Ajax requests of XML files
app.get('/web/serveXml', (req, res) => {
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
app.post('/web/getMetadata', (req, res) => {
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

// var os = require( 'os' );
// var networkInterfaces = os.networkInterfaces();
// var ipAddr = networkInterfaces['en0'][1]['address']
// app.listen(port, ipAddr, () => console.log(`DiogenesWeb listening on ${ipAddr}:${port}!`))

app.listen(port, '0.0.0.0', () => console.log(`DiogenesWeb listening on ${port}!`))
