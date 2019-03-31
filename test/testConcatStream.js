const fs = require('fs')
const path = require('path')

const ConcatStream = require('../utils/ConcatStream')
const collectFiles = require('../utils/collectFiles')

const testFiles = path.resolve(__dirname, './test_assets/source')
const dest = fs.createWriteStream(path.resolve(__dirname, './test_assets/dest/test.txt'), {
  flags: 'a'
})

const files = collectFiles(testFiles, false)
let fileStream = new ConcatStream()

files.forEach(file => {
  fileStream.push(fs.createReadStream(file))
})

fileStream.to(dest)
