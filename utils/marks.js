module.exports = function marks (string, ...regexs) {
  let regex = new RegExp(regexs.reduce((acc, cur, i) => {
    if (i === 0) {
      if (cur instanceof RegExp) {
        acc += `\(` + cur.source + `\)`
      } else if (typeof cur === `string`) {
        let newCur = genRegexFromString(cur)
        acc += `\(` + newCur + `\)`
      }
    } else {
      if (cur instanceof RegExp) {
        acc += `\|` + `\(` + cur.source + `\)`
      } else if (typeof cur === `string`) {
        let newCur = genRegexFromString(cur)
        acc += `\|` + `\(` + newCur + `\)`
      }
    }
    return acc
  }, ``), `g`)
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

function genRegexFromString (string) {
  const specialWords = `/`
  let words = string.split()
  let newWords = words.map(word => {
    if (specialWords.includes(word)) {
      return `\\` + word
    } else {
      return word
    }
  })
  return newWords.join(``)
}