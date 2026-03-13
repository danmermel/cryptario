const { DatabaseSync } = require('node:sqlite')
const db = new DatabaseSync('anagrams.db', { "readOnly": true })
const transformWord = function (word) {
  // lowercase
  word = word.toLowerCase()

  // remove all but letters
  word = word.replace(/[^a-z]/g, '')

  // reorder alphabetically

  word = word.split('')
  word = word.sort()
  word = word.join('')

  return word
}

const solveAnagram = function (letters) {

  // process the letters to form a jumble e.g. dog => dgo
  const processedLetters = transformWord(letters)
  console.log('processed letters', processedLetters)

  // form a query to search for matching jumbled strings
  const query = db.prepare(`SELECT solution FROM anagrams WHERE jumble =?;`)

  var solutions = query.all(processedLetters)



  // turn array of objects into flat array of solutions and filter out dupes
  solutions = solutions.map((v) => { return v.solution }).filter(function (item) { return (item.toLowerCase() !== letters.toLowerCase()) })
  return solutions
}

const handler = async function (event, context) {
  const string = event.queryStringParameters ? event.queryStringParameters.clue : null
  if (!string) {
    return {
      statusCode: 400,
      body: JSON.stringify({ "ok": false, "message": "missing clue" })
    }
  }

  const anagramSolutions =  solveAnagram(string)
  // now we have to dedupe
  var lc = [] // keeps the ones we've already seen
  anagramSolutions.sort() // sorts alphabetaically and upper cases first
  var retval = anagramSolutions.filter(function (s) {
    const s2 = s.toLowerCase()
    const inArray = lc.includes(s2)
    lc.push(s2)
    return !inArray
  })

  return {
    statusCode: 200,
    body: JSON.stringify(retval)
  }
}

module.exports = {
  handler: handler
}
