const net = require('net')
const fs = require('fs')
const path = require('path')

const FileParser = require('./utils/fileParser')

const saveDir = path.resolve(__dirname, './test/test_assets/dest')
const fileParser = new FileParser(saveDir)
const port = 2333

const server = net.createServer(socket => {
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

  socket.pipe(fileParser)
})


server.on('error', err => {
  console.error(err)
})

server.listen(port, () => {
  console.log('syncFiles listening on:' + port)
})