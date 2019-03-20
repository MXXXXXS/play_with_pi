const net = require('net')
const path = require('path')
const fs = require('fs')
const readline = require('readline')
const BufStream = require('./utils/BufStream')
const ConcatStream = require('./utils/ConcatStream')

const port = 2333
const host = '127.0.0.1'
const watchedDir = ''
let fsNeedToSync = new Set();
let testFiles = ['D:/UW/图片/sicp/1466138026831.jpg', 'D:/UW/图片/sicp/1371370052708.jpg', 'D:/UW/图片/sicp/is6.jpg']



function watch(watchedDir) {
  fs.watch(watchedDir, (etype, filename) => {
    if (etype = 'change') {
      console.log(filename);
      fsNeedToSync.add(filename);
    }
  })
}

const socket = net.connect(port, host, () => {
  console.log('connected')
})

socket.on('data', buf => {
  console.log(buf.toString('utf8'))
})

socket.on('error', err => {
  console.error(err)
})

socket.on('end', () => {
  console.log('end')
})

socket.on('close', (had_error) => {
  if (had_error) {
    console.error(`Link closed, error: ${had_error}`)
  } else {
    console.log(`Link closed`)
  }
})

function sync() {
  const cs = new ConcatStream()
  testFiles.forEach(file => {
    cs.push(fs.createReadStream(file))
  })
  cs.to(socket)
}

function reboot(socket) {
  socket.write('reboot', () => {
    console.log('sent: reboot')
  })
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '>'
})

rl.prompt()

rl.on('line', line => {
  switch (line.trim()) {
    case 'sync':
      sync()
      break
    case 'reboot':
      reboot()
      break
    case 'end':
      socket.end()
      break
  }
})

// function wrapFile(info, file) {
//   info = new BufSteam(Buffer.from(JSON.parse(info)))
//   file = fs.createReadStream(file, {
//     encoding: 'ascii'
//   })
//   return new ConcatStream().push(info).push(file)
// }