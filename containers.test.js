const containers = require('./containers.js')

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
