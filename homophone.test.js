const homophone = require('./homophone.js')

test('identifyIndicators returns empty array when there are none', function () {
  const res = homophone.identifyIndicators('The quick brown fox')
  expect(res).toEqual([])
})

test('identifyIndicators returns one indicator at end of string', function () {
  const res = homophone.identifyIndicators('The quick brown fox in speech')
  expect(res).toEqual(['in speech'])
})

test('identifyIndicators returns one indicator at start of string', function () {
  const res = homophone.identifyIndicators('In speech The quick brown fox')
  expect(res).toEqual(['in speech'])
})

test('identifyIndicators returns one indicator in middle of string', function () {
  const res = homophone.identifyIndicators('The quick brown in speech fox')
  expect(res).toEqual(['in speech'])
})

test('identifyIndicators long one', function () {
  const res = homophone.identifyIndicators('The quick brown fox by the sound of it')
  expect(res).toEqual(['sound', 'by the sound of it'])
})

test('parseClue - indicator at the end - even number', function () {
  const res = homophone.parseClue('remained sober, so we hear', 'so we hear', 6)
  expect(res).toEqual({ definition: 'remained', subsidiary: 'sober' })
})

test('parseClue - indicator at the end - even number', function () {
  const res = homophone.parseClue('remained totally completely sober, so we hear', 'so we hear', 6)
  expect(res).toEqual({ definition: 'remained totally', subsidiary: 'completely sober' })
})

test('parseClue - indicator at the end - odd number', function () {
  const res = homophone.parseClue('remained completely sober, so we hear', 'so we hear', 6)
  expect(res).toEqual({ definition: 'remained', subsidiary: 'completely sober' })
})

test('parseClue - indicator at the end - odd number', function () {
  const res = homophone.parseClue('remained totally completely very sober, so we hear', 'so we hear', 6)
  expect(res).toEqual({ definition: 'remained totally', subsidiary: 'completely very sober' })
})

test('parseClue - indicator at the start - even number', function () {
  const res = homophone.parseClue('so we hear sober remained', 'so we hear', 6)
  expect(res).toEqual({ definition: 'remained', subsidiary: 'sober' })
})

test('parseClue - indicator at the start - even number', function () {
  const res = homophone.parseClue('so we hear very sober he remained', 'so we hear', 6)
  expect(res).toEqual({ definition: 'he remained', subsidiary: 'very sober' })
})

test('parseClue - indicator at the start - odd number', function () {
  const res = homophone.parseClue('so we hear very sober remained', 'so we hear', 6)
  expect(res).toEqual({ definition: 'sober remained', subsidiary: 'very' })
})

test('parseClue - indicator at the start - odd number', function () {
  const res = homophone.parseClue('so we hear he is very sober remained', 'so we hear', 6)
  expect(res).toEqual({ definition: 'very sober remained', subsidiary: 'he is' })
})

test('parseClue - indicator in the middle', function () {
  const res = homophone.parseClue('the quick so we hear brown fox', 'so we hear', 6)
  expect(res).toEqual({ definition: 'the quick', subsidiary: 'brown fox' })
})

test('analyzeHomophone - solves a clue', async function () {
  const res = await homophone.analyzeHomophone('remained sober, so we hear (6)')
  expect(res).toEqual(
    [ { type: 'homophone',
      clue: 'remained sober, so we hear',
      totalLength: 6,
      definition: 'remained',
      indicator: 'so we hear',
      subsidiary: 'sober',
      solution: 'stayed',
      info: 'remained has a synonym stayed which sounds like sedate which is a synonym of sober' },
    { type: 'homophone',
      clue: 'remained sober, so we hear',
      totalLength: 6,
      definition: 'remained',
      indicator: 'so we hear',
      subsidiary: 'sober',
      solution: 'stayed',
      info: 'remained has a synonym stayed which sounds like staid which is a synonym of sober' },
    { type: 'homophone',
      clue: 'remained sober, so we hear',
      totalLength: 6,
      definition: 'sober',
      indicator: 'so we hear',
      subsidiary: 'remained',
      solution: 'sedate',
      info: 'sober has a synonym sedate which sounds like stood which is a synonym of remained' } ]
  )
})
