const anagram = require('./anagram.js')
const doubledef = require('./doubledef.js')
const hiddenwords = require('./hiddenwords.js')

const handler = async function (event, context) {
  console.log(JSON.stringify(event))
  const body = JSON.parse(event.body)
  console.log('the body is', body)
  const clue = body.clue
  console.log('the clue is', clue)
  if (!clue) {
    throw (new Error('missing clue'))
  }

  var doubleDefSolutions = []
  var hiddenWordSolutions = []
  const anagramSolutions = await anagram.analyzeAnagram(clue)
  if (anagramSolutions.length === 0) {
    hiddenWordSolutions = await hiddenwords.analyzeHidden(clue)
    if (hiddenWordSolutions.length === 0) {
      doubleDefSolutions = await doubledef.analyzeDoubleDef(clue)
    }
  }

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(anagramSolutions.concat(doubleDefSolutions).concat(hiddenWordSolutions))
  }
}

module.exports = {
  handler: handler
}
