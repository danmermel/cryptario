
const charades = require('./charades.js')

test('analyseCharades - full test', async function () {
  const answer = await charades.analyzeCharades('everyone was in a debt that\'s permitted (7)')
  expect(answer[0].solution).toEqual('allowed')
})

test('analyseCharades - full test', async function () {
  const answer = await charades.analyzeCharades('book binds are innovations (9)')
  expect(answer[0].solution).toEqual('novelties')
})

test('analyseCharades - full test', async function () {
  const answer = await charades.analyzeCharades('obvious disagreement for defendant (9)')
  expect(answer[0].solution).toEqual('plaintiff')
})
