const http = require('http');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const WS = require('ws')
const wss = new WS.Server({
  host: 'pi',
  port: 2333,

})

