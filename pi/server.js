const net = require('net')
const fs = require('fs')
const port = 2333
let fileStream = fs.createWriteStream('test.jpg', {
  flags: 'a',
  encoding: 'ascii'
})
const server = net.createServer(socket => {
  socket.on('end', () => {
    fileStream.end()
    console.log('end')
  })

  socket.on('close', (had_error) => {
    if (had_error) {
      console.error(`Link closed, error: ${had_error}`)
    } else {
      console.log(`Link closed`)
    }
  })

  socket.on('data', buf => {
    fileStream.write(buf, 'ascii')
    // console.log(buf.toString('utf8'))
  })

  socket.write('welcome, controler here')
  socket.pipe(socket)
})


server.on('error', err => {
  console.error(err)
})

server.listen(port, () => {
  console.log('listening on:' + port)
})