const containers = require('./containers.js')

test('identifyIndicators returns empty array when there are none', function () {
  const res = containers.identifyIndicators('The quick brown fox')
  expect(res).toEqual([])
})

test('identifyIndicators returns one indicator in middle of string', function () {
  const res = containers.identifyIndicators('The quick brown inside fox')
  expect(res).toEqual(['inside'])
})

test('identifyIndicators long one', function () {
  const res = containers.identifyIndicators('The quick brown put into fox')
  expect(res).toEqual(['put into'])
})

test('parseClue - indicator in middle', function () {
  const res = containers.parseClue('object put into torn clothing', 'put into', 7)
  expect(res).toEqual({ definition: 'clothing', subsidiary1: 'object', subsidiary2: 'torn' })
})

test('analyzeContainers - solves a clue', async function () {
  const res = await containers.analyzeContainers('object put into torn clothing (7)')
  expect(res).toEqual([{
    type: 'Containers',
    clue: 'object put into torn clothing',
    totalLength: 7,
    definition: 'clothing',
    subsidiary: 'object / torn',
    indicator: 'put into',
    words: null,
    isSynonym: false,
    solution: 'raiment',
    info:
     'The word "put into" suggests this is a Container-type clue. The word "aim" is inside "raiment" which may be a synonym of "clothing".'
  }
  ])
})
