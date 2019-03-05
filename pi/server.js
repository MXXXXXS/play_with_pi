const http = require('http');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const WS = require('ws')
const wss = new WS.Server({
  port: 2333
})

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(msg) {
    console.log('received: ' + msg)
  })
  ws.on('error', function (e) {
    console.error(e)
  })
  ws.send('hi, from ws')
})

