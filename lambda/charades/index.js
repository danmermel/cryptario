const charades = require('./charades.js')

const handler = async function (event, context) {
  console.log(JSON.stringify(event))
  const body = JSON.parse(event.body)
  console.log('the body is', body)
  const clue = body.clue
  console.log('the clue is', clue)
  if (!clue) {
    throw (new Error('missing clue'))
  }

  const charadesSolutions = await charades.analyzeCharades(clue)

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(charadesSolutions)
  }
}

module.exports = {
  handler: handler
}