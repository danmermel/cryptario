const anagram = require('./anagram.js')

test('identifyIndicators returns empty array when there are none', function () {
  const res = anagram.identifyIndicators('The quick brown fox')
  expect(res).toEqual([])
})

test('identifyIndicators returns one anagram indicator', function () {
  const res = anagram.identifyIndicators('The quick brown fox went absurd running')
  expect(res).toEqual(['absurd'])
})

test('identifyIndicators returns one multi-word indicator', function () {
  const res = anagram.identifyIndicators('The quick brown fox went mixed up running')
  expect(res).toEqual(['mixed', 'mixed up'])
})

test('identifyIndicators returns multiple anagram indicator', function () {
  const res = anagram.identifyIndicators('The altered quick brown fox went absurd running')
  expect(res).toEqual(['altered', 'absurd'])
})

test('solveAnagram: single word', async function () {
  var solution = await anagram.solveAnagram('god')
  expect(solution).toEqual(expect.arrayContaining(['god', 'dog']))
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

test('parseClue: "in gale at odds ple ant" - multi-word anagram indicator', function () {
  var solution = anagram.parseClue('in gale at odds ple ant', 'at odds', 6)
  expect(solution).toEqual([
    { letters: 'galein', words: ['gale', 'in'], definition: 'ple ant' },
    { letters: 'pleant', words: ['ple', 'ant'], definition: 'in gale' }
  ])
})

test('parseClue: "in gales at odds ple ant" - multi-word anagram indicator', function () {
  var solution = anagram.parseClue('in gales at odds ple ant', 'at odds', 6)
  expect(solution).toEqual([
    { letters: 'pleant', words: ['ple', 'ant'], definition: 'in gales' }
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

test('analyzeAnagram: The largest rates get adjusted (8) - indicator at end of clue', async function () {
  var solution = await anagram.analyzeAnagram('The largest rates get adjusted (8)')
  expect(solution.length).toEqual(1)
  expect(solution[0].solution).toEqual('greatest')
})

test('analyzeAnagram: Adjusted rates get The largest (8) - indicator at beginning of clue', async function () {
  var solution = await anagram.analyzeAnagram('Adjusted rates get The largest (8)')
  expect(solution.length).toEqual(1)
  expect(solution[0].solution).toEqual('greatest')
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

test('analyzeAnagram: cat pu mixed malfunction (3,2)', async function () {
  var solution = await anagram.analyzeAnagram('cat pu mixed malfunction (3,2)')
  var caput = false
  for (var i = 0; i < solution.length; i++) {
    if (solution[i].solution === 'caput') {
      caput = true
    }
  }
  expect(caput).toEqual(false)
})

test('analyzeAnagram should return a plural', async function () {
  var solution = await anagram.analyzeAnagram('gods mixed furry friends (4)')
  expect(solution).toEqual(expect.arrayContaining([{
    type: 'anagram',
    clue: 'gods mixed furry friends',
    totalLength: 4,
    definition: 'furry friends',
    indicator: 'mixed',
    words: ['gods'],
    solution: 'dogs',
    isSynonym: false
  }]))
})

test('analyzeAnagram - synonym check has to be case insensitive', async function () {
  var solution = await anagram.analyzeAnagram('Greek mountain could be so lumpy (7)')
  expect(solution).toEqual(expect.arrayContaining([{
    type: 'anagram',
    clue: 'Greek mountain could be so lumpy',
    totalLength: 7,
    definition: 'greek mountain',
    indicator: 'could be',
    words: ['so', 'lumpy'],
    solution: 'Olympus',
    isSynonym: true
  }]))
})

test('analyzeAnagram: synonym matches go top', async function () {
  var solution = await anagram.analyzeAnagram('amiable tumble in gale (6)')
  // the first solution should be the synonym
  expect(solution[0].isSynonym).toEqual(true)
})
