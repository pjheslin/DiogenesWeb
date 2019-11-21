"use strict"
const path = require('path')
const express = require('express')
const app = express()
const port = 8989
const handlebars = require('handlebars')

app.set('views', './views')
app.set('view engine', 'hbs')
var fs = require('fs') // this engine requires the fs module
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

require('dotenv').config()

var sendFileOptions = {
  root: path.join(__dirname, 'public'),
  dotfiles: 'deny',
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true
  }
}

app.use(function (req, res, next) {
  console.log("Request: "+req.url);
  next();
});

// For misc assets
app.use(express.static('public'))
// For texts (previous rule would look in public/public)
// app.use('/public/texts', express.static(path.join(__dirname, 'public/texts')))
// For sidebar
app.use('/images', express.static(path.join(__dirname, 'public/images')))

// Send user identification page unless param set
app.get('*', (req, res, next) => {
  // console.log('Getting: ' + req.path)
  if (req.query && req.query.user) {
    console.log('User type: ' + req.query.user)
    next()
  } else if (req.path == '/auth' || req.path == '/test.xml') {
    // Here are exceptions: pages that should be loaded without the user param.
    next()
  } else {
    console.log("No user type given")
    res.sendFile('identify.html', sendFileOptions)
  }
})

// We are sent here from user id page
app.get('/authOptions', (req, res, next) => {
  //  res.render('connect', connections)
  res.sendFile('connect.html', sendFileOptions)
})

// We are sent here after choosing cloud host, to which we now redirect
app.get('/authRedirect', (req, res, next) => {
  if (req.query && req.query.host) {
    var host = req.query.host
    // console.log(host)
    // Where to tell cloud host to redirect after authentication
    // Do we need to urlencode this?
    // var authRedirect = "http://localhost:8989/auth"
    var protocol = 'https'
    if (req.get('Host').match(/localhost/)) {
      protocol = 'http'
    }
    var origUrl = protocol + '://' + req.get('Host');
    console.log('orig: '+origUrl)
    var authURL
    if (host == 'dropbox') {
      var authRedirect = origUrl+'/auth'
      var dropboxClientId = process.env.DROPBOX_APP_KEY;
      var dropboxAuthURL = "https://www.dropbox.com/oauth2/authorize?client_id=" + dropboxClientId + "&response_type=token&redirect_uri=" + authRedirect
      authURL = dropboxAuthURL
  }
  // console.log(authURL)
  res.redirect(authURL)
  }
})

// We are redirected here after authorizing
app.get('/auth', (req, res) => {
  // console.log("auth!")
  if (req.query.error) {
    res.render('auth_error', {error: req.query.error, desc: req.query.error_description})
  } else if (typeof req.query.access_token === undefined) {
    res.render('auth_error', {error: 0, desc: "Unknown Error"})
  } else {
    //    console.log(req.query.access_token)
    //    res.render('auth_success', {token: req.query.access_token})
    res.sendFile('auth_success.html', sendFileOptions)
  }
})

app.get('/fileDisplay', (req, res) => {
  var path = req.query.filePath
  // console.log('path! '+path)
  res.render('file_display', {path: path})
})

// Send home page otherwise
app.get('/', (req, res) => {
  res.sendFile('file-list-public.html', sendFileOptions)
  console.log("home!")
})

app.get('/home', (req, res) => {
  res.sendFile('home.html', sendFileOptions)
  console.log("home!")
})

// Settings (set on client side)
app.get('/settings', (req, res) => {
  res.sendFile('settings.html', sendFileOptions)
})

// For Ajax requests
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
// app.use(express.json())
// app.post('/getAuthsAndWorks', (req, res) => {
//   // function to get list here
//   // var authsAndWorks = getAuthsAndWorks(req.body)
//   var authsAndWorks
//   res.json(authsAndWorks)
// })

app.listen(port, () => console.log(`DiogenesWeb listening on port ${port}!`))
