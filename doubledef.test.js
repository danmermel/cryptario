const doubledef = require('./doubledef.js')

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
