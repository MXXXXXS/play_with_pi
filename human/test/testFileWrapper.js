const fs = require('fs')
const path = require('path')

const {wrapFile} = require('../utils/fileWrapper')
const collectFiles = require('./utils/collectFiles')

const files = collectFiles(path.resolve(__dirname, './test_assets/source'))
const dest = fs.createWriteStream('D:/coding/play_with_pi/human/test/test_assets/dest/testFileWrapper.txt', {
  flags: 'a'
})

console.log(files)

let fileWrapped = wrapFile(...files)

fileWrapped.to(dest)