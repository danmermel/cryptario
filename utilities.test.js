const utilities = require('./utilities.js')

test('Identify that basic clue gets split', function () {
  const res = utilities.split('Pleasant tumble in gale (6)')
  expect(res).toEqual({ totalLength: 6, clue: 'Pleasant tumble in gale', wordLengths: [6] })
})

test('Identify that basic clue gets split - no space before bracket', function () {
  const res = utilities.split('Pleasant tumble in gale(6)')
  expect(res).toEqual({ totalLength: 6, clue: 'Pleasant tumble in gale', wordLengths: [6] })
})

test("Additional brackets don't crap it", function () {
  const res = utilities.split('Pleasant tumble (not in winter) in gale (6)')
  expect(res).toEqual({ totalLength: 6, clue: 'Pleasant tumble (not in winter) in gale', wordLengths: [6] })
})

test("Additional spaces at the end of clue don't crap it", function () {
  const res = utilities.split('Pleasant tumble in gale (6)   ')
  expect(res).toEqual({ totalLength: 6, clue: 'Pleasant tumble in gale', wordLengths: [6] })
})

test('Complex solution length - hyphens', function () {
  const res = utilities.split('Pleasant tumble in gale (6-4)')
  expect(res).toEqual({ totalLength: 10, clue: 'Pleasant tumble in gale', wordLengths: [6, 4] })
})

test('Complex solution length - commas', function () {
  const res = utilities.split('Pleasant tumble in gale (6,4)')
  expect(res).toEqual({ totalLength: 10, clue: 'Pleasant tumble in gale', wordLengths: [6, 4] })
})

test('Complex solution length - hyphens, apostrophes, commas', function () {
  const res = utilities.split("Pleasant tumble in gale (1'5-2,2)")
  expect(res).toEqual({ totalLength: 10, clue: 'Pleasant tumble in gale', wordLengths: [1, 5, 2, 2] })
})

test('Complex solution length - double digits', function () {
  const res = utilities.split('Pleasant tumble in gale (16-4)')
  expect(res).toEqual({ totalLength: 20, clue: 'Pleasant tumble in gale', wordLengths: [16, 4] })
})

test('Synonym of cook', async function () {
  const res = await utilities.isSynonym('cook', 'falsify')
  expect(res).toEqual(true)
})

test('Not Synonym of dog', async function () {
  const res = await utilities.isSynonym('dog', 'cat')
  expect(res).toEqual(false)
})

test('Synonym with capital letters', async function () {
  const res = await utilities.isSynonym('Cook', 'falsify')
  expect(res).toEqual(true)
})

test('Synonym of empty string', async function () {
  const res = await utilities.isSynonym('', '')
  expect(res).toEqual(false)
})

test('Synonym of numbers', async function () {
  const res = await utilities.isSynonym(1, 2)
  expect(res).toEqual(false)
})

test('Synonym of partial empty string', async function () {
  const res = await utilities.isSynonym('cook', '')
  expect(res).toEqual(false)
})

test('getWords - Get rid of anything that is not word in clue', function () {
  const res = utilities.getWords('ABC123, (great) cook+kitchen - nest')
  expect(res).toEqual(['ABC123', 'great', 'cook', 'kitchen', 'nest'])
})

test('getWords - remove apostrophes', function () {
  const res = utilities.getWords('ABC123 cat\'s dog\'s, (great) cook+kitchen - nest')
  expect(res).toEqual(['ABC123', 'cats', 'dogs', 'great', 'cook', 'kitchen', 'nest'])
})

test('countLetters - Match first two words', function () {
  const res = utilities.countLetters(['in', 'gale', 'woof'], 6)
  expect(res).toEqual(['in', 'gale'])
})

test('countLetters - Match first word', function () {
  const res = utilities.countLetters(['in', 'gale', 'woof'], 2)
  expect(res).toEqual(['in'])
})

test('countLetters - Match all words', function () {
  const res = utilities.countLetters(['in', 'gale', 'woof'], 10)
  expect(res).toEqual(['in', 'gale', 'woof'])
})

test('countLetters - Match nothing', function () {
  const res = utilities.countLetters(['in', 'gale', 'woof'], 11)
  expect(res).toEqual(null)
})

test('countLetters - Match nothing again', function () {
  const res = utilities.countLetters(['in', 'gale', 'woof'], 3)
  expect(res).toEqual(null)
})

test('transformWord - single word', function () {
  const res = utilities.transformWord('dog')
  expect(res).toEqual('dgo')
})

test('transformWord - multi  word', function () {
  const res = utilities.transformWord('black dog')
  expect(res).toEqual('abcdgklo')
})

test('transformWord - punctuation and capital letters', function () {
  const res = utilities.transformWord(" Black Dog's ")
  expect(res).toEqual('abcdgklos')
})

test('checkWordPattern - matches word lengths correctly - multi-word', function () {
  const res = utilities.checkWordPattern('black dog', [5, 3])
  expect(res).toEqual(true)
})

test('checkWordPattern - matches word lengths correctly - single word', function () {
  const res = utilities.checkWordPattern('black', [5])
  expect(res).toEqual(true)
})

test('checkWordPattern - matches word lengths correctly - returns false', function () {
  const res = utilities.checkWordPattern('black dog', [5, 2])
  expect(res).toEqual(false)
})

test('findActualWords should  return one real word', async function () {
  const res = await utilities.findActualWords(['ickb', 'ckbr', 'kbro', 'brow'])
  expect(res).toEqual(['brow'])
})

test('findActualWords should  return two real words', async function () {
  const res = await utilities.findActualWords(['blood', 'ickb', 'ckbr', 'kbro', 'brow'])
  expect(res).toEqual(['blood', 'brow'])
})

test('findActualWords should  return zero words', async function () {
  const res = await utilities.findActualWords(['ickb', 'ckbr', 'kbro', 'brqw'])
  expect(res).toEqual([])
})

test('removeStopwords should remove single words', function () {
  const res = utilities.removeStopwords('the lazy green fox', ['green'])
  expect(res).toEqual('the lazy fox')
})

test('removeStopwords should remove multiple words', function () {
  const res = utilities.removeStopwords('the lazy green fox', ['green', 'the'])
  expect(res).toEqual('lazy fox')
})

test('removeStopwords should remove all words', function () {
  const res = utilities.removeStopwords('the lazy green fox', ['green', 'the', 'fox', 'lazy'])
  expect(res).toEqual('')
})

test('removeStopwords should remove all mixed case words', function () {
  const res = utilities.removeStopwords('the lazy Green fox', ['green'])
  expect(res).toEqual('the lazy fox')
})

test('identifyIndicators should return empty string if no indicators found', function () {
  const res = utilities.identifyIndicators('pleasant tuumble in gale', './anagramIndicators.js')
  expect(res).toEqual('')
})

test('identifyIndicators should return a single word indicator', function () {
  var res = utilities.identifyIndicators('pleasant tumble in gale', './anagramIndicators.js')
  expect(res).toEqual('tumble')
  res = utilities.identifyIndicators('tumble pleasant in gale', './anagramIndicators.js')
  expect(res).toEqual('tumble')
  res = utilities.identifyIndicators('pleasant in gale tumble', './anagramIndicators.js')
  expect(res).toEqual('tumble')
})

test('identifyIndicators should return two word indicator', function () {
  var res = utilities.identifyIndicators('pleasant thrashing about in gale', './anagramIndicators.js')
  expect(res).toEqual('thrashing about')
  res = utilities.identifyIndicators('thrashing about pleasant  in gale', './anagramIndicators.js')
  expect(res).toEqual('thrashing about')
  res = utilities.identifyIndicators('pleasant in gale thrashing about', './anagramIndicators.js')
  expect(res).toEqual('thrashing about')
})

test('identifyIndicators should return three word indicator', function () {
  var res = utilities.identifyIndicators('pleasant not in order in gale', './anagramIndicators.js')
  expect(res).toEqual('not in order')
  res = utilities.identifyIndicators('not in order pleasant in gale', './anagramIndicators.js')
  expect(res).toEqual('not in order')
  res = utilities.identifyIndicators('pleasant in gale not in order', './anagramIndicators.js')
  expect(res).toEqual('not in order')
})

test('identifyIndicators should return the longest indicator', function () {
  const res = utilities.identifyIndicators('pleasant tumble in gale thrashing about', './anagramIndicators.js')
  expect(res).toEqual('thrashing about')
})
