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

test('findActualWords should  return one real word', async function () {
  const res = await hiddenwords.findActualWords(['ickb', 'ckbr', 'kbro', 'brow'])
  expect(res).toEqual(['brow'])
})

test('findActualWords should  return two real words', async function () {
  const res = await hiddenwords.findActualWords(['blood', 'ickb', 'ckbr', 'kbro', 'brow'])
  expect(res).toEqual(['blood', 'brow'])
})

test('findActualWords should  return zero words', async function () {
  const res = await hiddenwords.findActualWords(['ickb', 'ckbr', 'kbro', 'brqw'])
  expect(res).toEqual([])
})

test('AnalyzeHidden ahould  return the isSynony at the top', async function () {
  const res = await hiddenwords.analyzeHidden('some teachers get hurt (4)')
  const answer = [{ type: 'Hidden Word', clue: 'some teachers get hurt', totalLength: 4, definition: 'hurt', indicator: 'some', words: null, solution: 'ache', isSynonym: true }, { type: 'Hidden Word', clue: 'some teachers get hurt', totalLength: 4, definition: 'hurt', indicator: 'some', words: null, solution: 'each', isSynonym: false }, { type: 'Hidden Word', clue: 'some teachers get hurt', totalLength: 4, definition: 'hurt', indicator: 'some', words: null, solution: 'hers', isSynonym: false }]
  expect(res).toEqual(answer)
})

test('AnalyzeHidden ahould  return is synonim at the top', async function () {
  const res = await hiddenwords.analyzeHidden('stop getting letters from friends (3)')
  const answer = [{ type: 'Hidden Word', clue: 'stop getting letters from friends', totalLength: 3, definition: 'stop', indicator: 'getting letters from', words: null, solution: 'end', isSynonym: true }, { type: 'Hidden Word', clue: 'stop getting letters from friends', totalLength: 3, definition: 'stop getting', indicator: 'letters', words: null, solution: 'fro', isSynonym: false }, { type: 'Hidden Word', clue: 'stop getting letters from friends', totalLength: 3, definition: 'stop getting', indicator: 'letters', words: null, solution: 'rom', isSynonym: false }, { type: 'Hidden Word', clue: 'stop getting letters from friends', totalLength: 3, definition: 'stop', indicator: 'getting letters from', words: null, solution: 'rie', isSynonym: false }]
  expect(res).toEqual(answer)
})

test('AnalyzeHidden ahould  handle special characters ', async function () {
  const res = await hiddenwords.analyzeHidden('Hide in Arthur\'s kingdom (4)')
  const answer = [{ type: 'Hidden Word', clue: 'Hide in Arthur\'s kingdom', totalLength: 4, definition: 'hide', indicator: 'in', words: null, solution: 'skin', isSynonym: true }, { type: 'Hidden Word', clue: 'Hide in Arthur\'s kingdom', totalLength: 4, definition: 'hide', indicator: 'in', words: null, solution: 'king', isSynonym: false }]
  expect(res).toEqual(answer)
})
