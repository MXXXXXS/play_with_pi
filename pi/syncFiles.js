const net = require(`net`)
const fs = require(`fs`)
const path = require(`path`)

const FileParser = require(`../utils/fileParser`)

const saveDir = path.resolve(__dirname, `../test/test_assets/dest`)
const port = 2333

const server = net.createServer()

server.on(`error`, err => {
  console.error(err)
})

server.on(`connection`, connection => {
  connection.on(`end`, () => {
    console.log(`end`)
  })
  
  connection.on(`close`, (had_error) => {
    if (had_error) {
      console.error(`Link closed, error: ${had_error}`)
    } else {
      console.log(`Link closed`)
    }
  })
  
  const fileParser = new FileParser(saveDir)
  connection.pipe(fileParser)
})

server.listen(port, () => {
  console.log(`syncFiles listening on:` + port)
})