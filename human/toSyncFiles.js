const net = require(`net`)
const path = require(`path`)
const fs = require(`fs`)
const readline = require(`readline`)

const chokidar = require(`chokidar`)

const wrapFile = require(`../utils/fileWrapper`)

const port = 2333
const host = `127.0.0.1`
const watchedDir = `D:/coding/play_with_pi/test/test_assets/source`

function sync (watchedDir) {
  const watcher = chokidar.watch(watchedDir)
  watcher.on(`change`, path => {
    const socket = link()
    const fileStream = wrapFile([path])
    fileStream.to(socket)
    console.log(`File sent: ${path}`)
  })
}

function link () {
  const socket = net.connect(port, host, () => {
    console.log(`connected`)
  })

  socket.on(`data`, buf => {
    console.log(buf.toString(`utf8`).slice(0, 10))
  })

  socket.on(`error`, err => {
    console.error(err)
  })

  socket.on(`end`, () => {
    console.log(`end`)
  })

  socket.on(`close`, (had_error) => {
    if (had_error) {
      console.error(`Link closed, error: ${had_error}`)
    } else {
      console.log(`Link closed`)
    }
  })

  return socket
}

function reboot (socket) {
  socket.write(`reboot`, () => {
    console.log(`sent: reboot`)
  })
}

function interact () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `>`
  })

  rl.prompt()

  rl.on(`line`, line => {
    switch (line.trim()) {
    case `sync`:
      sync(watchedDir)
      break
    }
  })
}

interact()