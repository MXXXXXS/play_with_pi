// 文件传输格式:
// <{random hash}>{JSON}</{random hash}>{file}[<{random hash}>{JSON}</{random hash}>{file}]
//random hash: the boundary of files for parsing, has a length 0f 5 byte
//JSON: file infos, like:
// {
//   "name": String,
//   "size": Number,
//   "compressed": Boolean,
//   "compression_algorithm": String,
//   "hash": String,
//   "hash_algorithm": String
// }
//file: file data
const {
  Writable
} = require('stream')
const fs = require('fs')
const path = require('path')

const marks = require('./marks')
const parsePart = require('./parsePart')

class FileParser extends Writable {
  constructor(saveDir, infoMarkString, fileMarkString, opts) {
    super(opts)
    this.infoMarkString = infoMarkString
    this.fileMarkString = fileMarkString
    this.saveDir = saveDir
    this.start = true
    this.queue = ''
    this.queueType = ''
    this.dest = ''
  }

  _write(chunk, encoding, callback) {
    console.log('received chunk size: ' + chunk.length)
    const received = chunk.toString('utf8')

    // fs.writeFileSync('D:/coding/play_with_pi/pi/test/test_assets/dest/allChunk.txt', received, {
    //   encoding: 'binary',
    //   flag: 'a'
    // })

    let concated = this.queue.concat(received)
    let cmks = marks(concated, this.infoMarkString, this.fileMarkString)
    if (this.start) {
      //开始接受, 必须以标签开头
      let parts = parsePart(concated, cmks)
      if (parts[0]['data'] === '' && parts[1]['mark'] === this.infoMarkString) {
        console.log('开始接收')
        this.queueType = this.infoMarkString
        parts.forEach((part, index) => {
          if (0 < index && index < parts.length - 1) {
            this.save(part)
          } else if (index === parts.length - 1) {
            this.queue = part.data
            this.queueType = part.mark
          }
        })
        this.start = false
      } else {
        throw '格式不符'
      }
    } else if (cmks.length !== 0) {
      //接收到的数据拼合后含标签
      let parts = parsePart(concated, cmks)
      parts.forEach((part, index) => {
        if (index === 0) {
          this.save({
            data: this.queue = part.data,
            mark: this.queueType
          })
        } else if (0 < index && index < parts.length - 1) {
          this.save(part)
        } else if (index === parts.length - 1) {
          this.queue = part.data
          this.queueType = part.mark
        }
      })
    } else {
      //接收到的数据拼合后无标签
      this.save({
        data: this.queue,
        mark: this.queueType
      })
      this.queue = received
    }
    callback()
  }

  _final() {
    // fs.writeFileSync('D:/coding/play_with_pi/pi/test/test_assets/dest/all.txt', this.queue, {
    //   encoding: 'binary',
    //   flag: 'a'
    // })

    this.save({
      data: this.queue,
      mark: this.queueType
    })
    console.log('传输完成')
    // fs.writeFileSync(this.dest, this.queue, {
    //   encoding: 'binary',
    //   flag: 'a'
    // })
  }

  save(part) {
    if (part.mark === this.infoMarkString) {

      // fs.writeFileSync('D:/coding/play_with_pi/pi/test/test_assets/dest/all.txt', part.data, {
      //   encoding: 'binary',
      //   flag: 'a'
      // })

      this.queueType = this.infoMarkString
      console.log(part)
      this.info = JSON.parse(part['data'])
      this.dest = fs.openSync(path.resolve(this.saveDir, this.info.name), 'a')
    } else if (part.mark === this.fileMarkString) {
      // fs.writeFileSync('D:/coding/play_with_pi/pi/test/test_assets/dest/all.txt', part.data, {
      //   encoding: 'binary',
      //   flag: 'a'
      // })

      this.queueType === this.fileMarkString
      fs.writeFileSync(this.dest, part.data, {
        encoding: 'binary',
        flag: 'a'
      })
    }
  }
}

module.exports = FileParser