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
