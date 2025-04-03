const sqlite3 = require('sqlite3')

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

const solveAnagram = async function (letters) {
  // this is async so we return a Promise
  return new Promise((resolve, reject) => {
    // process the letters to form a jumble e.g. dog => dgo
    const processedLetters = transformWord(letters)
    console.log('processed letters', processedLetters)

    // open the database
    var db = new sqlite3.Database('./anagrams.db')

    // form a query to search for matching jumbled strings
    const query = "SELECT solution FROM anagrams WHERE jumble ='" + processedLetters + "';"

    // perform the query
    db.all(query, function (err, data) {
      // if there was an error, reject the Promise
      if (err) {
        return reject(err)
      }

      // turn array of objects into flat array of solutions
      const solutions = data.map((v) => { return v.solution })

      // filter out duplicates
      resolve(solutions.filter(function (item) { return (item.toLowerCase() !== letters.toLowerCase()) }))
    })
  })
}

const handler = async function (event, context) {
  console.log(event.queryStringParameters)
  const string = event.queryStringParameters.clue
  console.log('the string is', string)
  if (!string) {
    throw (new Error('missing string'))
  }

  const anagramSolutions = await solveAnagram(string)
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
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(retval)
  }
}

module.exports = {
  handler: handler
}
