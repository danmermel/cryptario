
const utilities = require('./utilities.js')
const stem = require('node-snowball')

const charadeIndicators = require('./charadeIndicators.js')

const datamuse = require('./datamuse.js')

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
  var array_length = words.length
  var half_way = Math.floor(array_length / 2)
  var sub1 = words.slice(0, half_way).join(' ')
  var sub2 = words.slice(half_way).join(' ')
  console.log('sub1 is ', sub1)
  console.log('sub2 is ', sub2)

  // get synonyms of each half
  var sub1Synonyms = await datamuse.synonym(sub1)
  var sub2Synonyms = await datamuse.synonym(sub2)
  console.log('sub1synonyms are ', sub1Synonyms)
  console.log('sub2synonyms are ', sub2Synonyms)

  // make "words" out of the cartesian product
  var candidateWords = []
  for (var i = 0; i < sub1Synonyms.length; i++) {
    for (var j = 0; j < sub2Synonyms.length; j++) {
      candidateWords.push(sub1Synonyms[i] + sub2Synonyms[j])
    }
  }

  // isolate real words
  var realWords = []
  for (var k = 0; k < candidateWords.length; k++) {
    var isReal = await utilities.isWord(candidateWords[k])
    if (isReal) {
      realWords.push(candidateWords[k])
    }
  }
  console.log('Real words are ', realWords)

  return []
/*
  //are any of the real words synonyms of the definition?

  // get synonyms of the subsidiary
  var subSynonyms = await datamuse.synonym(parsedClue.subsidiary)
  console.log('subSynonyms', subSynonyms)
  if (subSynonyms.length === 0) {
    return []
  }

  // apply the function to each synoym
  console.log('running', actionName)
  const choppedSynonyms = []
  for (i in subSynonyms) {
    choppedSynonyms[i] = actionFunction(subSynonyms[i])
  }
  console.log('choppedSynonyms', choppedSynonyms)

  // make sure the processed synonyms a) are words b) are the right length
  const candidateWords = []
  const candidateOriginals = []
  for (i in choppedSynonyms) {
    const word = choppedSynonyms[i]
    if (utilities.checkWordPattern(word, splitClue.wordLengths)) {
      const isAWord = await utilities.isWord(word)
      if (isAWord) {
        candidateWords.push(word)
        candidateOriginals.push(subSynonyms[i])
      }
    }
  }
  console.log('candidateWords', candidateWords, 'originalls', candidateOriginals)
  if (candidateWords.length === 0) {
    return []
  }

  // check the remaining words are synonyms of the definition  and build return array
  const retval = []
  for (i in candidateWords) {
    const isSynonym = await utilities.isSynonym(parsedClue.definition, candidateWords[i])
    const isOrMaybe = isSynonym ? 'is' : 'may be'
    retval.push({
      type: 'Subtractions',
      clue: splitClue.clue,
      totalLength: splitClue.totalLength,
      definition: parsedClue.definition,
      subsidiary: parsedClue.subsidiary,
      indicator: indicator,
      words: null,
      isSynonym: isSynonym,
      solution: candidateWords[i],
      info: 'The word "' + indicator + '" suggests this is a Subtraction-type clue for "' +
                    actionName + '". "' + parsedClue.subsidiary + '" has a synonym of "' + candidateOriginals[i] + '", ' +
                    'which when the subtraction is applied becomes "' + candidateWords[i] + '", ' +
                    'which ' + isOrMaybe + ' a synonym of "' + parsedClue.definition + '".'
    })
  }

  return retval

*/
}

module.exports = {
  identifyIndicators,
  parseClue,
  analyzeCharades
}
