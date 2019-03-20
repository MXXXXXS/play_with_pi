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

const BufSteam = require('./BufStream')

const fileSaveDir = path.resolve(__dirname, '../file_store/')
const infoMark = /<[a-z]{5}>/g
const infoMarkString = '<abcde>'
const fileMark = /<\/[a-z]{5}>/g
const fileMarkString = '</abcde>'
const trimLength = 8

class FileParser extends Writable {
  constructor(opts) {
    super(opts)
    this.start = true
    this.queue = ''
    this.queueType = infoMarkString
    this.dest = ''
  }

  _write(chunk, encoding, callback) {
    const received = chunk.toString('utf8')
    let mks = marks(received, infoMark, fileMark)
    let concated = this.queue.concat(received)
    let cmks = marks(concated, infoMark, fileMark)
    //接收到的数据含标签
    if (mks) {
      if (this.start) {
        //开始接受, 必须以标签开头
        let parts = parsePart(concated, mks)
        if (parts[0]['data'] === '' && parts[1]['mark'] === infoMarkString) {
          console.log('开始接受')
          parts.forEach((part, index) => {
            if (index > 0) {
              this.save(part)
            }
          })
          this.start = false
        } else {
          throw '格式不符'
        }
      } else {
        let parts = parsePart(concated, cmks)
        parts.forEach((part, index) => {
          if (index === 0) {
            this.save({
              data: part.data,
              mark: this.queueType
            })
          } else if (index === parts.length - 1) {
            this.queue = part.data
            this.queueType = part.mark
          } else if (0 < index < parts.length - 1) {
            this.save(part)
          }
        })
      }
    } else {
      //接收到的数据不含标签, 且拼合后边界无标签
      if (cmks.length === mks.length) {
        this.save({
          data: this.queue,
          mark: this.queueType
        })
        this.queue = received
      } else {
        //接收到的数据不含标签, 但拼合后边界产生标签
        let parts = parsePart(concated, cmks)
        parts.forEach((part, index) => {
          if (index === 0) {
            this.save({
              data: part.data,
              mark: this.queueType
            })
          } else if (index === 1) {
            this.queue = part.data
            this.queueType = part.mark
          }
        })
      }
    }
  }

  _final() {
    new BufSteam(this.queue).pipe(this.save)
    console.log('传输完成')
  }

  save(part) {
    if (part.mark === infoMarkString) {
      this.queueType = infoMarkString
      this.info = JSON.parse(part['data'])
      this.dest = fs.createWriteStream(path.resolve(fileSaveDir, this.info.name), {
        flags: 'a',
        encoding: 'ascii'
      })
    } else if (part.mark === fileMarkString) {
      this.queueType === fileMarkString
      new BufSteam(Buffer.from(part.data)).pipe(this.dest, {
        end: false
      })
    }
  }
}

function marks(string, ...regexs) {
  let regex = new RegExp(regexs.reduce((acc, cur, i) => {
    if (i === 0) {
      acc += '\(' + cur.source + '\)'
    } else {
      acc += '\|' + '\(' + cur.source + '\)'
    }
    return acc
  }, ''), 'g')
  let result
  let matched = []
  while ((result = regex.exec(string)) !== null) {
    matched.push({
      mark: result[0],
      index: result.index,
      lastIndex: regex.lastIndex
    })
  }
  return matched
}

function parsePart(string, marks, counter = 0, buf = []) {
  if (marks && counter < marks.length) {
    if (counter > 0) {
      buf.push({
        data: string.slice(marks[counter - 1]['lastIndex'], marks[counter]['index']),
        mark: marks[counter - 1]['mark']
      })
      counter++
      parsePart(string, marks, counter, buf)
    } else if (counter === 0) {
      buf.push({
        data: string.slice(0, marks[counter]['index']),
        mark: ''
      })
      counter++
      parsePart(string, marks, counter, buf)
    }
  } else if (marks && counter === marks.length) {
    buf.push({
      data: string.slice(marks[counter - 1]['lastIndex'], string.length),
      mark: marks[counter - 1]['mark']
    })
  }
  return buf
}

module.exports = FileParser

let testString =
  `<abcde>{"name": "test0", "size": "356"}</abcde>0lasjg;laeijgwoijgoqpklsj,.<>L::J>J;j
<abcde>{"name": "test1", "size": "3125"}</abcde>1lasjg;laeijgwoijgoqpklsj,.<>L::J>J;j
<abcde>{"name": "test2", "size": "33"}</abcde>2lasjg;laeijgwoijgoqpklsj,.<>L::J>J;j`

let splited0 = `{"name": "test0", "size": "356"}</abcde>lasjg;laeijgwoijgoqpklsj,.<>L::J>J;j
<abc`
let splited1 = `de>{"name": "test1", "size": "3125"}</abcde>`

let testStream = new BufSteam(Buffer.from(testString))

let fp = new FileParser()

testStream.pipe(fp)
// console.log(marks(testString, infoMark, fileMark))
// console.log(parsePart(testString, marks(testString, infoMark, fileMark)))