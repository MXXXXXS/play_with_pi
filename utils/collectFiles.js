const fs = require('fs')
const path = require('path')

let collectFiles = (dir, deep = true) => {
  let filesCollection = []
  recursion(dir, deep)

  function recursion(dir, deep) {
    let files = fs.readdirSync(dir)
    files.forEach(item => {
      let isDir = fs.statSync(path.resolve(dir, item)).isDirectory()
      if (isDir && deep) {
        recursion(path.resolve(dir, item))
      } else if (!isDir) {
        filesCollection.push(path.resolve(dir, item))
      }
    })
  }
  return filesCollection
}

module.exports = collectFiles