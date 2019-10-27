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

// OAuth authorization pages
var authURL = {}
// Where to tell cloud host to redirect after authentication
// Do we need to urlencode this?
var authRedirect = "http://localhost:8989/auth"

// Dropbox config
var dropboxClientId = process.env.DROPBOX_APP_KEY;
authURL['dropbox'] = "https://www.dropbox.com/oauth2/authorize?client_id=" + dropboxClientId + "&response_type=token&redirect_uri=" + authRedirect

var sendFileOptions = {
  root: path.join(__dirname, 'public'),
  dotfiles: 'deny',
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true
  }
}

// For misc assets
app.use(express.static('public'))

// Send user identification page unless param set
app.get('*', (req, res, next) => {
  console.log('Getting: ' + req.path)
  if (req.query && req.query.user) {
    console.log('User type: ' + req.query.user)
    next()
  } else if (req.path == '/auth') {
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
    var u = authURL[host]
    // console.log(u)
    res.redirect(u)
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
  console.log('path! '+req.query.filePath)
  res.render('file_display', {path: req.query.filePath})
})

// Send home page otherwise
app.get('/', (req, res) => {
  res.sendFile('list-files.html', sendFileOptions)
  console.log("home!")
})



// Parsing
app.get('/parse/:form', (req, res) => {
  // function to do actual parsing here
  res.render('parser', req.params)
})

// Settings (set on client side)
app.get('/settings', (req, res) => {
  res.sendFile('settings.html', sendFileOptions)
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
