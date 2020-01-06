const subtractions = require('./subtractions.js')

test('removeFirstLetter removes a letter', function () {
  const res = subtractions.removeFirstLetter('parson')
  expect(res).toEqual('arson')
})

test('removeFirstLetter empty strings', function () {
  const res = subtractions.removeFirstLetter('')
  expect(res).toEqual('')
})

test('removeLastLetter removes a letter', function () {
  const res = subtractions.removeLastLetter('cat')
  expect(res).toEqual('ca')
})

test('removeLastLetter empty strings', function () {
  const res = subtractions.removeLastLetter('')
  expect(res).toEqual('')
})

test('removeFirstandLast removes a letter', function () {
  const res = subtractions.removeFirstandLast('cat')
  expect(res).toEqual('a')
})

test('removeFirstandLast two-letter strings', function () {
  const res = subtractions.removeFirstandLast('it')
  expect(res).toEqual('')
})

test('removeFirstandLast empty strings', function () {
  const res = subtractions.removeLastLetter('')
  expect(res).toEqual('')
})

test('removeCentralLetters removes  letters - odd', function () {
  const res = subtractions.removeCentralLetters('cat')
  expect(res).toEqual('ct')
})

test('removeCentralLetters removes  letters - even', function () {
  const res = subtractions.removeCentralLetters('farm')
  expect(res).toEqual('fm')
})

test('removeCentralLetters two-letter strings', function () {
  const res = subtractions.removeCentralLetters('it')
  expect(res).toEqual('it')
})

test('removeOddLetters removes  letters', function () {
  const res = subtractions.removeOddLetters('computer')
  expect(res).toEqual('optr')
})

test('removeOddLetters small word', function () {
  const res = subtractions.removeOddLetters('a')
  expect(res).toEqual('')
})

test('removeOddLetters empty string', function () {
  const res = subtractions.removeOddLetters('')
  expect(res).toEqual('')
})

test('removeEvenLetters removes  letters', function () {
  const res = subtractions.removeEvenLetters('computer')
  expect(res).toEqual('cmue')
})

test('removeEvenLetters small word', function () {
  const res = subtractions.removeEvenLetters('a')
  expect(res).toEqual('a')
})

test('removeEvenLetters empty string', function () {
  const res = subtractions.removeEvenLetters('')
  expect(res).toEqual('')
})

test('parseClue indicator at the start', function () {
  const clue = 'loses his head clergyman is a crime'
  const test = subtractions.parseClue(clue, 'loses his head')
  expect(test).toEqual({ definition: 'is a crime', subsidiary: 'clergyman' })
})

test('parseClue indicator at the end', function () {
  const clue = 'is a crime clergyman loses his head'
  const test = subtractions.parseClue(clue, 'loses his head')
  expect(test).toEqual({ definition: 'is a crime', subsidiary: 'clergyman' })
})

test('parseClue indicator in the middle', function () {
  const clue = 'clergyman loses his head is a crime'
  const test = subtractions.parseClue(clue, 'loses his head')
  expect(test).toEqual({ definition: 'is a crime', subsidiary: 'clergyman' })
})

test('parseClue indicator at the start - single word', function () {
  const clue = 'decapitated clergyman is a crime'
  const test = subtractions.parseClue(clue, 'decapitated')
  expect(test).toEqual({ definition: 'is a crime', subsidiary: 'clergyman' })
})

test('parseClue indicator at the end - single word', function () {
  const clue = 'is a crime clergyman decapitated'
  const test = subtractions.parseClue(clue, 'decapitated')
  expect(test).toEqual({ definition: 'is a crime', subsidiary: 'clergyman' })
})

test('parseClue indicator in the middle - single word', function () {
  const clue = 'clergyman decapitated is a crime'
  const test = subtractions.parseClue(clue, 'decapitated')
  expect(test).toEqual({ definition: 'is a crime', subsidiary: 'clergyman' })
})

test('analyseSubtractions - full test', async function () {
  const answer = await subtractions.analyzeSubtractions('Crime is the result when clergyman first off (5)')
  expect(answer).toEqual(
    [{
      type: 'Subtractions',
      clue: 'Crime is the result when clergyman first off',
      totalLength: 5,
      definition: 'crime is the result when',
      subsidiary: 'clergyman',
      indicator: 'first off',
      words: null,
      isSynonym: true,
      solution: 'arson',
      info:
     'The word "first off" suggests this is a Subtraction-type clue for "first letter removed". "clergyman" has a synonym of "parson", which when the subtraction is applied becomes "arson", which is a synonym of "crime is the result when".'
    }]
  )
})
