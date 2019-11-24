
const utilities = require('./utilities.js')
const stem = require('node-snowball')

const subtractionIndicatorsCentralLetters = require('./subtractionIndicatorsCentralLetters.js')
const subtractionIndicatorsEvenLetters = require('./subtractionIndicatorsEvenLetters.js')
const subtractionIndicatorsFirstAndLast = require('./subtractionIndicatorsFirstAndLast.js')
const subtractionIndicatorsFirstLetter = require('./subtractionIndicatorsFirstLetter.js')
const subtractionIndicatorsLastLetter = require('./subtractionIndicatorsLastLetter.js')
const subtractionIndicatorsOddLetters = require('./subtractionIndicatorsOddLetters.js')

// const stemmedIndicators = stem.stemword(indicators)
const db = require('./db.js')
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

const identifyIndicators = function (clue, indicators) {
  var containerIndicators = []
  const words = utilities.getWords(clue.toLowerCase())
  const stemmedIndicators = stem.stemword(indicators)
  const stemmedWords = stem.stemword(words)

  // single word
  for (var i = 0; i < stemmedWords.length; i++) {
    var word = stemmedWords[i]
    var x = stemmedIndicators.indexOf(word)
    if (x !== -1) {
      containerIndicators.push(words[i])
    }
  }

  // second pass for two-word indicators
  for (i = 0; i < words.length - 1; i++) {
    word = words[i] + ' ' + words[i + 1]
    x = indicators.indexOf(word)
    if (x !== -1) {
      containerIndicators.push(word)
    }
  }

  // need three word indicators here
  // MISSING
  
  return containerIndicators
}

const parseClue = function (clue, indicator, numLetters) {
  const words = utilities.getWords(clue.toLowerCase())
  const indicatorSplit = indicator.toLowerCase().split(' ')
  // find the position  of the indicator
  const pos = words.indexOf(indicatorSplit[0])
  if (pos === -1) {
    throw new Error('indicator not found')
  }

  // if the first word around the indicator is the first word
  if (pos - 1 === 0) {
    return { definition: words[words.length - 1], subsidiary1: words[pos - 1], subsidiary2: words[pos + indicatorSplit.length] }
  } else {
    return { definition: words[0], subsidiary1: words[pos - 1], subsidiary2: words[pos + indicatorSplit.length] }
  }
}

const solveAnagram = async function (letters) {
  var processedLetters = utilities.transformWord(letters)
  var data = await db.queryAnagram(processedLetters)
  var retval = []
  for (var i in data.Items) {
    retval.push(data.Items[i].solution)
  }
  return retval
}

const analyzeSubtractions = async function (clue) {
  var retval = []

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
      name: 'firstLetter'
    },
    {
      indicators: subtractionIndicatorsLastLetter,
      action: removeLastLetter,
      name: 'lastLetter'
    },
    {
      indicators: subtractionIndicatorsFirstAndLast,
      action: removeFirstandLast,
      name: 'firstAndLast'
    },
    {
      indicators: subtractionIndicatorsCentralLetters,
      action: removeCentralLetters,
      name: 'central'
    },
    {
      indicators: subtractionIndicatorsOddLetters,
      action: removeOddLetters,
      name: 'odd'
    },
    {
      indicators: subtractionIndicatorsEvenLetters,
      action: removeEvenLetters,
      name: 'even'
    }
  ]

  // loop through all of the indicators for all the subtraction types
  // noting which subtraction type was found
  var actionFunction = null
  var actionName = null
  var indicators = null
  for (var i = 0; i < allIndicators.length; i++) {
    var subtractionType = allIndicators[i]
    console.log('looking for ', subtractionType.name)
    indicators = identifyIndicators(splitClue.clue, subtractionType.indicators)
    if (indicators.length > 0) {
      actionName = subtractionType.name
      actionFunction = subtractionType.action
      break
    }
  }

  // if we have found no indictors, we're done
  if (actionName === null) {
    return []
  }
  console.log(indicators, actionName, actionFunction)
  return []

  // now try to get container indicators
  // returns an array of indicators or an empty array if there are none
  // var indicators = identifyIndicators(splitClue.clue, subtractionsIndicatorsFirstLetters )
  // if (indicators.length > 0) {
  //   return []
  // }

  console.log('indicators = ', indicators)
  var indicator = utilities.getLongestIndicator(indicators)
  console.log('indicator = ', indicator)

  var parsedClue = parseClue(splitClue.clue, indicator, splitClue.totalLength)
  console.log('parsedClue', parsedClue)

  // calculate synonyms
  var s1 = await datamuse.synonym(parsedClue.subsidiary1)
  var s2 = await datamuse.synonym(parsedClue.subsidiary2)
  console.log('synonyms of', parsedClue.subsidiary1, 'are', s1)
  console.log('synonyms of', parsedClue.subsidiary2, 'are', s2)
  for (var i in s1) {
    for (var j in s2) {
      const str = s1[i] + s2[j]
      if (str.length === splitClue.totalLength) {
        var solvedAnagrams = await solveAnagram(str)
        // console.log('Anagrams of ', str, 'are', solvedAnagrams)
        for (var l in solvedAnagrams) {
          var solvedAnagram = solvedAnagrams[l]
          // only solved anagrams that contain one of the original words
          // are allowed to be solutions
          var s1ok = (solvedAnagram.indexOf(s1[i]) > -1)
          var s2ok = (solvedAnagram.indexOf(s2[j]) > -1)
          if (s1ok || s2ok) {
            var isSynonym = await utilities.isSynonym(parsedClue.definition, solvedAnagram)
            var maybeOrIs = isSynonym ? 'is' : 'may be'
            // calculate which synonym is contained in the  solvedAnagram
            retval.push({
              type: 'Containers',
              clue: splitClue.clue,
              totalLength: splitClue.totalLength,
              definition: parsedClue.definition,
              subsidiary: parsedClue.subsidiary1 + ' / ' + parsedClue.subsidiary2,
              indicator: indicator,
              words: null,
              isSynonym: isSynonym,
              solution: solvedAnagram,
              info: 'The word "' + indicator + '" suggests this is a Container-type clue. The word "' + s1[i] +
                    '" is a synonym of "' + parsedClue.subsidiary1 + '". The word "' + s2[j] + '" is a synonym of "' + parsedClue.subsidiary2 +
                    '". One is inside the other in the word "' + solvedAnagram + '", which ' + maybeOrIs + ' a synonym of "' + parsedClue.definition + '".'
            })
          }
        }
      }
    }
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
  identifyIndicators,
  parseClue,
  analyzeSubtractions
}
