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

console.log(`infoMarkString: ${infoMarkString}`)
console.log(`fileMarkString: ${fileMarkString}`)

function wrapFile(...files) {
  let fileWrapped = new ConcatStream()
  files.forEach(file => {
    let info = new BufSteam(Buffer.from(`${infoMarkString}${JSON.stringify({
        name: path.basename(file),
        size: fs.statSync(file).size
      })}${fileMarkString}`))
    let data = fs.createReadStream(file, {
      encoding: 'ascii'
    })
    fileWrapped.push(info).push(data)
  })
  return fileWrapped
}

module.exports = {
  wrapFile,
  infoMarkString,
  fileMarkString
}