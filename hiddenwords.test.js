/* global jest */
jest.setTimeout(10000)

const hiddenwords = require('./hiddenwords.js')

test('identifyIndicators returns empty array when there are none', function () {
  const res = hiddenwords.identifyIndicators('The quick brown fox')
  expect(res).toEqual([])
})

test('identifyIndicators returns one hidden word indicator', function () {
  const res = hiddenwords.identifyIndicators('The quick brown fox concealed running')
  expect(res).toEqual(['concealed'])
})

test('identifyIndicators returns one multi-word indicator', function () {
  const res = hiddenwords.identifyIndicators('The quick brown fox held by running')
  expect(res).toEqual(['held by'])
})

test('identifyIndicators returns multiple hidden word indicator', function () {
  const res = hiddenwords.identifyIndicators('The concealed quick brown fox partial running')
  expect(res).toEqual(['concealed', 'partial'])
})

test('identifyIndicators should ignore indicator at end of string', function () {
  const res = hiddenwords.identifyIndicators('cat pu mixed concealed')
  expect(res).toEqual([])
})

test('identifyIndicators should find indicator at start of string', function () {
  const res = hiddenwords.identifyIndicators('concealed cat pu mixed stuff')
  expect(res).toEqual(['concealed'])
})

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

test('AnalyzeHidden ahould  return is synonim at the top', async function () {
  const res = await hiddenwords.analyzeHidden('Stop getting letters from friends (3)')
  const answer = [{
    type: 'Hidden Word',
    clue: 'Stop getting letters from friends',
    totalLength: 3,
    definition: 'stop',
    subsidiary: 'friends',
    indicator: 'getting letters from',
    words: null,
    solution: 'end',
    isSynonym: true,
    info:
     'The word "getting letters from" suggests this is a hidden word clue. The word "end" is hidden inside "friends" and is  a synonym of "stop".'
  },
  {
    type: 'Hidden Word',
    clue: 'Stop getting letters from friends',
    totalLength: 3,
    definition: 'stop getting',
    subsidiary: 'from friends',
    indicator: 'letters',
    words: null,
    solution: 'fro',
    isSynonym: false,
    info:
     'The word "letters" suggests this is a hidden word clue. The word "fro" is hidden inside "from friends" and may be  a synonym of "stop getting".'
  },
  {
    type: 'Hidden Word',
    clue: 'Stop getting letters from friends',
    totalLength: 3,
    definition: 'stop getting',
    subsidiary: 'from friends',
    indicator: 'letters',
    words: null,
    solution: 'rom',
    isSynonym: false,
    info:
     'The word "letters" suggests this is a hidden word clue. The word "rom" is hidden inside "from friends" and may be  a synonym of "stop getting".'
  },
  {
    type: 'Hidden Word',
    clue: 'Stop getting letters from friends',
    totalLength: 3,
    definition: 'stop',
    subsidiary: 'friends',
    indicator: 'getting letters from',
    words: null,
    solution: 'rie',
    isSynonym: false,
    info:
     'The word "getting letters from" suggests this is a hidden word clue. The word "rie" is hidden inside "friends" and may be  a synonym of "stop".'
  }]
  expect(res).toEqual(answer)
})
