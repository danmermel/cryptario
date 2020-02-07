
const utilities = require('./utilities.js')
const stem = require('node-snowball')

const charadeIndicators = require('./charadeIndicators.js')

const datamuse = require('./datamuse.js')
const dictionary = require('./dictionary.js')

const identifyIndicators = function (clue, indicators) {
  var retval = []
  const words = utilities.getWords(clue.toLowerCase())
  const stemmedIndicators = stem.stemword(indicators)
  const stemmedWords = stem.stemword(words)

  // single word
  for (var i = 0; i < stemmedWords.length; i++) {
    var word = stemmedWords[i]
    var x = stemmedIndicators.indexOf(word)
    if (x !== -1) {
      retval.push(words[i])
    }
  }

  // second pass for two-word indicators
  for (i = 0; i < words.length - 1; i++) {
    word = words[i] + ' ' + words[i + 1]
    x = indicators.indexOf(word)
    if (x !== -1) {
      retval.push(word)
    }
  }

  // need three word indicators here
  // MISSING
  console.log('indicators are ', retval)
  return retval
}

const parseClue = function (clue, indicator) {
  const words = utilities.getWords(clue.toLowerCase())
  const indicatorSplit = indicator.toLowerCase().split(' ')
  // find the position  of the indicator
  const pos = words.indexOf(indicatorSplit[0])
  if (pos === -1) {
    throw new Error('indicator not found')
  }

  // if the indicator is at the end of the clue, then the subsidiary is the word immediately preceding the indicator
  // and the definitions is the rest
  if (pos + indicatorSplit.length === words.length) {
    return { definition: words.slice(0, pos - 1).join(' '), subsidiary: words[pos - 1] }
  }

  // if the indicator is that the start of the clue, then the subsidiary is the word immediately after
  // and the definition is the rest
  if (pos === 0) {
    return { definition: words.slice(indicatorSplit.length + 1).join(' '), subsidiary: words[indicatorSplit.length] }
  }

  // if the indicator is somewhere in the middle , subsidiary is whatever is before the indicator
  // and the definition is whatever is after
  return { definition: words.slice(pos + indicatorSplit.length).join(' '), subsidiary: words.slice(0, pos).join(' ') }
}

const analyzeCharades = async function (clue) {
  var retval = []

  // first split the clue
  // returns an object with a clue, a totalLength and a wordLengths array
  var splitClue = utilities.split(clue)
  if (splitClue == null) {
    return []
  }
  console.log('split clue = ', splitClue)

  // loop through all of the indicators for all the subtraction types
  // noting which subtraction type was found
  var indicators = null
  indicators = identifyIndicators(splitClue.clue, charadeIndicators)
  // if we have found no indicators, we're done
  if (indicators.length === 0) {
    return []
  }

  // just use the longest indicator
  console.log('indicators = ', indicators)
  var indicator = utilities.getLongestIndicator(indicators)
  console.log('indicator = ', indicator)

  var parsedClue = parseClue(splitClue.clue, indicator)
  console.log('parsedClue', parsedClue)

  // split the subsidiary into two
  var words = utilities.getWords(parsedClue.subsidiary) // get an array
  var arrayLength = words.length
  var halfWay = Math.floor(arrayLength / 2)
  var sub1 = words.slice(0, halfWay).join(' ')
  var sub2 = words.slice(halfWay).join(' ')
  console.log('sub1 is ', sub1)
  console.log('sub2 is ', sub2)

  // get synonyms of each half
  var sub1Synonyms = await datamuse.synonym(sub1)
  var sub2Synonyms = await datamuse.synonym(sub2)
  console.log('sub1synonyms are ', sub1Synonyms)
  console.log('sub2synonyms are ', sub2Synonyms)

  // make "words" out of the cartesian product
  var realWords = []
  var realWordsOriginal1 = []
  var realWordsOriginal2 = []

  for (var i = 0; i < sub1Synonyms.length; i++) {
    for (var j = 0; j < sub2Synonyms.length; j++) {
      const candidateWord = sub1Synonyms[i] + sub2Synonyms[j]
      if (candidateWord.length === splitClue.totalLength && dictionary.wordExists(candidateWord)) {
        // only add words to the list that are the right length for the solution
        realWords.push(candidateWord)
        realWordsOriginal1.push(sub1Synonyms[i])
        realWordsOriginal2.push(sub2Synonyms[j])
      }
    }
  }
  console.log('Real words are ', realWords)
  console.log('Originals 1 are ', realWordsOriginal1)
  console.log('Originals 2 are ', realWordsOriginal2)

  // now check if any of the  found words is a synonym of the definition

  for (var q = 0; q < realWords.length; q++) {
    if (await utilities.isSynonym(realWords[q], parsedClue.definition)) {
      // we found a word
      retval.push({
        type: 'Charades',
        clue: splitClue.clue,
        totalLength: splitClue.totalLength,
        definition: parsedClue.definition,
        subsidiary: sub1 + ' and ' + sub2,
        indicator: indicator,
        words: null,
        solution: realWords[q],
        info: 'The word "' + indicator + '" suggests this is a Charades-type clue. "' +
                    sub1 + '" has a synonym of "' + realWordsOriginal1[q] + '", and "' +
                    sub2 + '" has a synonym of "' + realWordsOriginal2[q] + '", ' +
                    'which when combined become "' + realWords[q] + '", ' +
                    'which is a synonym of "' + parsedClue.definition + '".'
      })
    }
  }

  return retval
}

module.exports = {
  identifyIndicators,
  parseClue,
  analyzeCharades
}
