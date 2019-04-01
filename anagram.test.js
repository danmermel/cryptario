const anagram = require('./anagram.js')

test('identifyIndicators returns empty array when there are none', function () {
  const res = anagram.identifyIndicators('The quick brown fox')
  expect(res).toEqual([])
})

test('identifyIndicators returns one anagram indicator', function () {
  const res = anagram.identifyIndicators('The quick brown fox went absurd')
  expect(res).toEqual(['absurd'])
})

test('identifyIndicators returns multiple anagram indicator', function () {
  const res = anagram.identifyIndicators('The altered quick brown fox went absurd ')
  expect(res).toEqual(['altered', 'absurd'])
})

test('solveAnagram: single word', async function () {
  var solution = await anagram.solveAnagram('god')
  expect(solution).toEqual(expect.arrayContaining(['dog', 'God']))
})

test('solveAnagram: single word no solution', async function () {
  var solution = await anagram.solveAnagram('xxxx')
  expect(solution).toEqual([])
})

test('solveAnagram: multi word', async function () {
  var solution = await anagram.solveAnagram('Beaterworld!')
  expect(solution).toEqual(expect.arrayContaining(['world beater']))
})

test('parseClue: pleasant tumble in gale', function () {
  var solution = anagram.parseClue('pleasant tumble in gale', 'tumble', 6)
  expect(solution).toEqual([{ letters: 'ingale', words: ['in', 'gale'], definition: 'pleasant' }])
})

test('parseClue: in gale tumble pleasant', function () {
  var solution = anagram.parseClue('in gale tumble pleasant', 'tumble', 6)
  expect(solution).toEqual([{ letters: 'galein', words: ['gale', 'in'], definition: 'pleasant' }])
})

test('parseClue: in gale tumble ple ant', function () {
  var solution = anagram.parseClue('in gale tumble ple ant', 'tumble', 6)
  expect(solution).toEqual([
    { letters: 'galein', words: ['gale', 'in'], definition: 'ple ant' },
    { letters: 'pleant', words: ['ple', 'ant'], definition: 'in gale' }
  ])
})

test('parseClue: pleasant tumble in gal', function () {
  var solution = anagram.parseClue('pleasant tumble in gal', 'tumble', 6)
  expect(solution).toEqual([])
})

test('analyzeAnagram: pleasant tumble in gale (6)', async function () {
  var solution = await anagram.analyzeAnagram('pleasant tumble in gale (6)')
  expect(solution).toEqual(expect.arrayContaining([{
    type: 'anagram',
    clue: 'pleasant tumble in gale',
    totalLength: 6,
    definition: 'pleasant',
    indicator: 'tumble',
    words: ['in', 'gale'],
    solution: 'linage',
    isSynonym: false
  }, {
    type: 'anagram',
    clue: 'pleasant tumble in gale',
    totalLength: 6,
    definition: 'pleasant',
    indicator: 'tumble',
    words: ['in', 'gale'],
    solution: 'algine',
    isSynonym: false
  }, {
    type: 'anagram',
    clue: 'pleasant tumble in gale',
    totalLength: 6,
    definition: 'pleasant',
    indicator: 'tumble',
    words: ['in', 'gale'],
    solution: 'genial',
    isSynonym: false
  }]))
})

test('analyzeAnagram: a drab cord mixed inferior (9)', async function () {
  var solution = await anagram.analyzeAnagram('a drab cord mixed inferior (9)')
  expect(solution).toEqual(expect.arrayContaining([{
    type: 'anagram',
    clue: 'a drab cord mixed inferior',
    totalLength: 9,
    definition: 'inferior',
    indicator: 'mixed',
    words: ['cord', 'drab', 'a'],
    solution: 'cardboard',
    isSynonym: true
  }]))
})

test('analyzeAnagram: inferior mixed a drab cord (9)', async function () {
  var solution = await anagram.analyzeAnagram('inferior mixed a drab cord (9)')
  expect(solution).toEqual(expect.arrayContaining([{
    type: 'anagram',
    clue: 'inferior mixed a drab cord',
    totalLength: 9,
    definition: 'inferior',
    indicator: 'mixed',
    words: ['a', 'drab', 'cord'],
    solution: 'cardboard',
    isSynonym: true
  }]))
})

test('analyzeAnagram: inferior sausages  a drab cord (9)', async function () {
  var solution = await anagram.analyzeAnagram('inferior sausages a drab cord (9)')
  expect(solution).toEqual([])
})

test('analyzeAnagram: inferior mixed a drab cord (10)', async function () {
  var solution = await anagram.analyzeAnagram('inferior mixed a drab cord (10)')
  expect(solution).toEqual([])
})

// this test should pass but 8,1 is not the same as 9
/*
test("analyzeAnagram: inferior mixed a drab cord (8,1)", async function() {
  var solution = await anagram.analyzeAnagram("inferior mixed a drab cord (8,1)")
  expect(solution).toEqual([])
})
*/
