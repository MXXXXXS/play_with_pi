const parsePart = require(`../utils/parsePart`)

let testString0 = `<asdfsdf> klsagkljkkl;safkl</asdfsdf>;alajg;aweijgklasdjfklasjfklasd;fjwpeoifjlska`
let testString1 = `ttttutieieriei<asdfsdf> htgktrouykgf</asdfsdf>yghuuteirettjgklasdjfkl</asdfsdf>`
let testString2 = `<asdfsdf> klsagkljkkl;safkl</asdfsdf>`
let testString3 = `<asdfsdf>`

let testStrs = [testString0, testString1, testString2, testString3]

testStrs.map(string => {
  let mks = marks(string, `<asdfsdf>`, `</asdfsdf>`)
  console.log(parsePart(string, mks))
  console.log(`---`)
})