const utilities = require('./utilities.js')

const handler = async function (event, context) {
  console.log(JSON.stringify(event))
  const body = JSON.parse(event.body)
  console.log('the body is', body)
  const string = body.clue
  console.log('the string is', string)
  if (!string) {
    throw (new Error('missing string'))
  }

  const anagramSolutions = await utilities.solveAnagram(string)
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
