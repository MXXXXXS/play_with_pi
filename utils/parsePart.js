module.exports = function parsePart (string, marks) {
  let buf = []
  marks.forEach((mark, index) => {
    if (index === 0) {
      buf.push({
        data: string.slice(0, mark[`index`]),
        mark: ``
      })
    } else if (index === marks.length - 1) {
      buf.push({
        data: string.slice(marks[index - 1][`lastIndex`], mark[`index`]),
        mark: marks[index - 1][`mark`]
      })
      buf.push({
        data: string.slice(mark[`lastIndex`], string.length),
        mark: mark[`mark`]
      })
    } else {
      buf.push({
        data: string.slice(marks[index - 1][`lastIndex`], mark[`index`]),
        mark: marks[index - 1][`mark`]
      })
    }
  })
  return buf
}