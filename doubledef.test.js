const doubledef = require('./doubledef.js')

test('createSearchablePairs: splits four word string correctly', function () {
  const res = doubledef.createSearchablePairs(['a', 'b', 'c', 'd'])
  expect(res).toEqual([
    { one: ['a'], two: ['b', 'c', 'd'] },
    { one: ['a', 'b'], two: ['c', 'd'] },
    { one: ['a', 'b', 'c'], two: ['d'] }
  ])
})

test('createSearchablePairs: splits three word string correctly', function () {
  const res = doubledef.createSearchablePairs(['a', 'b', 'c'])
  expect(res).toEqual([
    { one: ['a'], two: ['b', 'c'] },
    { one: ['a', 'b'], two: ['c'] }
  ])
})

test('createSearchablePairs: splits two word string correctly', function () {
  const res = doubledef.createSearchablePairs(['a', 'b'])
  expect(res).toEqual([
    { one: ['a'], two: ['b'] }
  ])
})

test('createSearchablePairs: splits one word string correctly', function () {
  const res = doubledef.createSearchablePairs(['a'])
  expect(res).toEqual([])
})

test('comparePair: get a match', async function () {
  const res = await doubledef.comparePair('yearn', 'quite a while', [4])
  expect(res).toEqual(['long'])
})

test('comparePair: get no match', async function () {
  const res = await doubledef.comparePair('sausage', 'quite a while', [4])
  expect(res).toEqual([])
})

test('comparePair: get no match because the pattern does not fit', async function () {
  const res = await doubledef.comparePair('yearn', 'quite a while', [5])
  expect(res).toEqual([])
})

test('comparePair: empty strings', async function () {
  const res = await doubledef.comparePair('', 'quite a while', [5])
  expect(res).toEqual([])
})

test('analyzeDoubleDef: Yearn for quite a while (4)', async function () {
  const res = await doubledef.analyzeDoubleDef('Yearn for quite a while (4)')
  expect(res).toEqual([{
    type: 'double definition',
    clue: 'Yearn for quite a while',
    totalLength: 4,
    definition: ['Yearn', 'for quite a while'],
    subsidiary: '',
    indicator: '',
    words: null,
    solution: 'long',
    isSynonym: true,
    info:
     '"Yearn" and "for quite a while" are both synonyms of "long".'
  }
  ])
})
test('analyzeDoubleDef: Empty array - no results', async function () {
  const res = await doubledef.analyzeDoubleDef('sausages donkey (12)')
  expect(res).toEqual([])
})
