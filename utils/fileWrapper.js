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
const fs = require('fs')
const path = require('path')

const Randexp = require('randexp')

const BufSteam = require('./BufStream')
const ConcatStream = require('./ConcatStream')

const infoMark = /<\w{8}>/g
const infoMarkString = new Randexp(infoMark).gen()
const fileMarkString = '</' + infoMarkString.slice(1, infoMarkString.length)

console.log(`infoMarkString: ${infoMarkString}`, `fileMarkString: ${fileMarkString}`)

module.exports = function (files) {
  let fileWrapped = new ConcatStream()
  files.forEach(file => {
    let info = new BufSteam(Buffer.from(`${infoMarkString}${JSON.stringify({
        name: path.basename(file),
        size: fs.statSync(file).size
      })}${fileMarkString}`))
    let data = fs.createReadStream(file, {
      encoding: 'binary'
    })
    fileWrapped.push(info).push(data)
  })
  return fileWrapped
}