
const utilities = require('./utilities.js')
const subtractionIndicatorsCentralLetters = './subtractionIndicatorsCentralLetters.js'
const subtractionIndicatorsEvenLetters = './subtractionIndicatorsEvenLetters.js'
const subtractionIndicatorsFirstAndLast = './subtractionIndicatorsFirstAndLast.js'
const subtractionIndicatorsFirstLetter = './subtractionIndicatorsFirstLetter.js'
const subtractionIndicatorsLastLetter = './subtractionIndicatorsLastLetter.js'
const subtractionIndicatorsOddLetters = './subtractionIndicatorsOddLetters.js'
const datamuse = require('./datamuse.js')

const removeFirstLetter = function (clue) {
  if (clue.length === 0) { return clue }
  return clue.slice(1)
}

const removeLastLetter = function (clue) {
  if (clue.length === 0) { return clue }
  return clue.slice(0, clue.length - 1)
}

const removeFirstandLast = function (clue) {
  if (clue.length < 2) { return clue }
  return removeFirstLetter(removeLastLetter(clue))
}

const removeCentralLetters = function (clue) {
  if (clue.length <= 2) { return clue }

  // turn string into an array
  var t = clue.split('')

  if (clue.length % 2 === 0) { // clue  has even number of letters
    // remove the middle two letters of the array. The array gets modified
    t.splice((clue.length / 2) - 1, 2)
  } else { // the clue has an odd number of letters
    t.splice(clue.length / 2, 1)
  }
  // turn array into a string and return
  return t.join('')
}

const removeOddLetters = function (clue) {
  if (clue.length === 0) { return clue }
  var retval = []
  // turn string into array
  var t = clue.split('')
  // cycle through values and return only odd ones
  for (var i = 1; i < clue.length; i = i + 2) {
    retval.push(t[i])
  }
  return retval.join('')
}

const removeEvenLetters = function (clue) {
  if (clue.length === 0) { return clue }
  var retval = []
  // turn string into array
  var t = clue.split('')
  // cycle through values and return only even ones
  for (var i = 0; i < clue.length; i = i + 2) {
    retval.push(t[i])
  }
  return retval.join('')
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

const analyzeSubtractions = async function (clue) {
  // first split the clue
  // returns an object with a clue, a totalLength and a wordLengths array
  var splitClue = utilities.split(clue)
  if (splitClue == null) {
    return []
  }
  console.log('split clue = ', splitClue)

  const allIndicators = [
    {
      indicators: subtractionIndicatorsFirstLetter,
      action: removeFirstLetter,
      name: 'first letter removed'
    },
    {
      indicators: subtractionIndicatorsLastLetter,
      action: removeLastLetter,
      name: 'last letter removed'
    },
    {
      indicators: subtractionIndicatorsFirstAndLast,
      action: removeFirstandLast,
      name: 'first and last letters removed'
    },
    {
      indicators: subtractionIndicatorsCentralLetters,
      action: removeCentralLetters,
      name: 'central letters removed'
    },
    {
      indicators: subtractionIndicatorsOddLetters,
      action: removeOddLetters,
      name: 'odd letters removed'
    },
    {
      indicators: subtractionIndicatorsEvenLetters,
      action: removeEvenLetters,
      name: 'even letters removed'
    }
  ]

  // loop through all of the indicators for all the subtraction types
  // noting which subtraction type was found
  var actionFunction = null
  var actionName = null
  var indicator = null
  for (var i = 0; i < allIndicators.length; i++) {
    var subtractionType = allIndicators[i]
    console.log('looking for ', subtractionType.name)
    indicator = utilities.identifyIndicators(splitClue.clue, subtractionType.indicators)
    if (indicator !== '') {
      actionName = subtractionType.name
      actionFunction = subtractionType.action
      break
    }
  }

  // if we have found no indictors, we're done
  if (actionName === null) {
    return []
  }
  console.log(indicator, actionName, actionFunction)

  var parsedClue = parseClue(splitClue.clue, indicator, splitClue.totalLength)
  console.log('parsedClue', parsedClue)

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
      const isAWord = utilities.isWord(word)
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
}

module.exports = {
  removeFirstLetter,
  removeLastLetter,
  removeFirstandLast,
  removeCentralLetters,
  removeOddLetters,
  removeEvenLetters,
  parseClue,
  analyzeSubtractions
}
