/* global jest */
jest.setTimeout(10000)

const hiddenwords = require('./hiddenwords.js')

test('parseClue should split a clue with a central indicator', function () {
  const res = hiddenwords.parseClue('metal concealed by environmentalists', 'concealed')
  expect(res).toEqual({ indicator: 'concealed', definition: 'metal', subsidiary: 'by environmentalists' })
})

test('parseClue should split a clue with a central multi-word indicator', function () {
  const res = hiddenwords.parseClue('metal held by environmentalists', 'held by')
  expect(res).toEqual({ indicator: 'held by', definition: 'metal', subsidiary: 'environmentalists' })
})

test('parseClue should split a clue with a starting indicator', function () {
  const res = hiddenwords.parseClue('some teachers get hurt', 'some')
  expect(res).toEqual({ indicator: 'some', definition: 'hurt', subsidiary: 'teachers get' })
})

test('findHiddenWords should  return correct substrings', function () {
  const res = hiddenwords.findHiddenWords('quick brown', 4)
  expect(res).toEqual(['quic', 'uick', 'ickb', 'ckbr', 'kbro', 'brow', 'rown'])
})

test('AnalyzeHidden ahould  return the isSynony at the top', async function () {
  const res = await hiddenwords.analyzeHidden('Some teachers get hurt (4)')
  const answer = [{
    type: 'Hidden Word',
    clue: 'Some teachers get hurt',
    totalLength: 4,
    definition: 'hurt',
    subsidiary: 'teachers get',
    indicator: 'some',
    words: null,
    solution: 'ache',
    isSynonym: true,
    info:
     'The word "some" suggests this is a hidden word clue. The word "ache" is hidden inside "teachers get" and is  a synonym of "hurt".'
  },
  {
    type: 'Hidden Word',
    clue: 'Some teachers get hurt',
    totalLength: 4,
    definition: 'hurt',
    subsidiary: 'teachers get',
    indicator: 'some',
    words: null,
    solution: 'each',
    isSynonym: false,
    info:
     'The word "some" suggests this is a hidden word clue. The word "each" is hidden inside "teachers get" and may be  a synonym of "hurt".'
  },
  {
    type: 'Hidden Word',
    clue: 'Some teachers get hurt',
    totalLength: 4,
    definition: 'hurt',
    subsidiary: 'teachers get',
    indicator: 'some',
    words: null,
    solution: 'hers',
    isSynonym: false,
    info:
     'The word "some" suggests this is a hidden word clue. The word "hers" is hidden inside "teachers get" and may be  a synonym of "hurt".'
  }]
  expect(res).toEqual(answer)
})
