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
} = require(`stream`)
const fs = require(`fs`)
const path = require(`path`)

const marks = require(`./marks`)
const parsePart = require(`./parsePart`)

class FileParser extends Writable {
  constructor (saveDir, opts) {
    super(opts)
    this.infoMarkString = ``
    this.fileMarkString = ``
    this.saveDir = saveDir
    this.start = true
    this.queue = ``
    this.queueType = ``
    this.dest = ``
  }

  _write (chunk, encoding, callback) {
    console.log(`received chunk size: ` + chunk.length)
    const received = chunk.toString(`utf8`)

    if (this.start) {
      //必须以标签开头
      const markRegex = /<\w{8}>/
      const markString = received.slice(0, 10)
      if (markRegex.test(markString)) {
        this.infoMarkString = markString
        this.fileMarkString = `</` + markString.slice(1, markString.length)
      } else {
        throw `格式不符`
      }
    }

    let concated = this.queue.concat(received)
    let cmks = marks(concated, this.infoMarkString, this.fileMarkString)
    if (this.start) {
      //开始接受
      console.log(`开始接收`)
      let parts = parsePart(concated, cmks)
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

  _final () {
    this.save({
      data: this.queue,
      mark: this.queueType
    })
    console.log(`传输完成`)
  }

  save (part) {
    if (part.mark === this.infoMarkString) {
      this.queueType = this.infoMarkString
      // console.log(part)
      this.info = JSON.parse(part[`data`])
      this.dest = path.resolve(this.saveDir, this.info.name)
      fs.writeFileSync(this.dest, ``)
    } else if (part.mark === this.fileMarkString) {
      this.queueType === this.fileMarkString
      fs.writeFileSync(this.dest, part.data, {
        encoding: `binary`,
        flag: `a`
      })
    }
  }
}

module.exports = FileParser