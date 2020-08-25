"use strict"

const fs = require('fs');
const path = require('path')
const process = require('process')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const inFile = process.argv[2]
const xml = fs.readFileSync(inFile, 'utf8')

// Create xml dom
const xmlDom = new JSDOM(xml, {
  contentType: "text/xml",
});
const xmlDoc = xmlDom.window.document

// Setup html dom as global document object
var htmlDom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>
  <div id="host">none</div>
  <div id="path">none</div>
  <div id="loading"></div>
  <div id="main"></div>
  `, {
  contentType: "text/html",
});
global.document = htmlDom.window.document

// Polyfill for missing (but unused by us) browser feature
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  global.localStorage = new LocalStorage('./scratch');
}
// Setup running of onload hooks
global.window = {}
global.window.addEventListener = function (e, func) { func() }
// Load tooltips library
// const popper = require('./lib/popper.min.js')
// const tippy = require('./lib/tippy-bundle.umd.js')
global.tippy = function () {}
global.tippy.setDefaultProps = function () {}

// Now we are ready to pretend to be a browser
const fileDisplay = require('../source/js/file-display.js');
fileDisplay.xml2html(xmlDoc)

const html = htmlDom.serialize()
console.log(html)
