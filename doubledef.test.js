const doubledef = require('./doubledef.js')

test('createSearchablePairs: splits four word string correctly', function () {
  const res = doubledef.createSearchablePairs(['a', 'b', 'c', 'd'])
  expect(res).toEqual([
    { one: [ 'a' ], two: [ 'b', 'c', 'd' ] },
    { one: [ 'a', 'b' ], two: [ 'c', 'd' ] },
    { one: [ 'a', 'b', 'c' ], two: [ 'd' ] }
  ])
})

test('createSearchablePairs: splits three word string correctly', function () {
  const res = doubledef.createSearchablePairs(['a', 'b', 'c'])
  expect(res).toEqual([
    { one: [ 'a' ], two: [ 'b', 'c' ] },
    { one: [ 'a', 'b' ], two: [ 'c' ] }
  ])
})

test('createSearchablePairs: splits two word string correctly', function () {
  const res = doubledef.createSearchablePairs(['a', 'b'])
  expect(res).toEqual([
    { one: [ 'a' ], two: [ 'b' ] }
  ])
})

test('createSearchablePairs: splits one word string correctly', function () {
  const res = doubledef.createSearchablePairs(['a'])
  expect(res).toEqual([])
})

test('analyzeDoubleDef: Yearn for quite a while (4)', async function () {
  const res = await doubledef.analyzeDoubleDef('Yearn for quite a while (4)')
  expect(res).toEqual([{
    type: 'double definition',
    clue: 'Yearn for quite a while',
    totalLength: 4,
    definition: ['Yearn', 'for quite a while'],
    indicator: null,
    words: null,
    solution: 'long',
    isSynonym: true
  }])
})
