const reversals = require('./reversals.js')

test('identifyIndicators returns empty array when there are none', function () {
  const res = reversals.identifyIndicators('The quick brown fox')
  expect(res).toEqual([])
})

test('identifyIndicators returns one indicator at end of string', function () {
  const res = reversals.identifyIndicators('The quick brown fox in turns')
  expect(res).toEqual(['turns'])
})

test('identifyIndicators returns one indicator at start of string', function () {
  const res = reversals.identifyIndicators('Up speech The quick brown fox')
  expect(res).toEqual(['up'])
})

test('identifyIndicators returns one indicator in middle of string', function () {
  const res = reversals.identifyIndicators('The quick brown up in speech fox')
  expect(res).toEqual(['up'])
})

test('identifyIndicators long one', function () {
  const res = reversals.identifyIndicators('The quick brown fox from the east')
  expect(res).toEqual(['from the east'])
})

test('parseClue - indicator at start', function () {
  const res = reversals.parseClue('turns up physician fish', 'turns up', 3)
  expect(res).toEqual({ definition: 'fish', indicator: 'turns up', subsidiary: 'physician' })
})

test('parseClue - indicator in middle', function () {
  const res = reversals.parseClue('physician turns up fish', 'turns up', 3)
  expect(res).toEqual({ definition: 'physician', indicator: 'turns up', subsidiary: 'fish' })
})

test('parseClue - indicator at end', function () {
  const res = reversals.parseClue('physician fish turns up', 'turns up', 3)
  expect(res).toEqual({ definition: 'physician', indicator: 'turns up', subsidiary: 'fish' })
})

test('analyzeReversals - solves a clue', async function () {
  const res = await reversals.analyzeReversal('physician turns up fish (3)')
  expect(res).toEqual([ { type: 'Reversal',
    clue: 'physician turns up fish',
    totalLength: 3,
    definition: 'physician',
    indicator: 'turns up',
    subsidiary: 'fish',
    words: null,
    solution: 'doc',
    isSynonym: true,
    info:
     'cod is a synonym of fish, which when reversed gives you doc, which is a synonym of physician' } ])
})
