const subtractions = require('./subtractions.js')

const handler = async function (event, context) {
  console.log(JSON.stringify(event))
  const body = JSON.parse(event.body)
  console.log('the body is', body)
  const clue = body.clue
  console.log('the clue is', clue)
  if (!clue) {
    throw (new Error('missing clue'))
  }

  const subtractionSolutions = await subtractions.analyzeSubtractions(clue)

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(subtractionSolutions)
  }
}

module.exports = {
  handler: handler
}
