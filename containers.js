
const utilities = require('./utilities.js')
const stem = require('node-snowball')

const indicators = require('./containerIndicators.js')

const stemmedIndicators = stem.stemword(indicators)
const db = require('./db.js')
const datamuse = require('./datamuse.js')

const identifyIndicators = function (clue) {
  var containerIndicators = []
  const words = utilities.getWords(clue.toLowerCase())
  const stemmedWords = stem.stemword(words)

  // looping through the array stemmedWords, but ignoring the first and last words because
  // by definition they cannot be indicators - you cannot have anything to anagram before/after them
  for (var i = 1; i < stemmedWords.length - 1; i++) {
    var word = stemmedWords[i]
    var x = stemmedIndicators.indexOf(word)
    if (x !== -1) {
      containerIndicators.push(words[i])
    }
  }

  // second pass for multi-word indicators
  // we are using the unstemmed indicators for comparison
  for (i = 1; i < words.length - 2; i++) {
    word = words[i] + ' ' + words[i + 1]
    x = indicators.indexOf(word)
    if (x !== -1) {
      containerIndicators.push(word)
    }
  }

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

const analyzeContainers = async function (clue) {
  var retval = []

  // first split the clue
  // returns an object with a clue, a totalLength and a wordLengths array
  var splitClue = utilities.split(clue)
  if (splitClue == null) {
    return []
  }
  console.log('split clue = ', splitClue)

  // now try to get container indicators
  // returns an array of indicators or an empty array if there are none
  var indicators = identifyIndicators(splitClue.clue)
  if (indicators.length === 0) {
    return []
  }
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
        console.log('Anagrams of ', str, 'are', solvedAnagrams)
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
            var content = s1ok ? s1[i] : s2[j]
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
              info: 'The word "' + indicator + '" suggests this is a Container-type clue. The word "' + content + '" is inside "' + solvedAnagram + '" which ' + maybeOrIs + ' a synonym of "' + parsedClue.definition + '".'
            })
          }
        }
      }
    }
  }
  return retval
}

module.exports = {
  identifyIndicators: identifyIndicators,
  parseClue: parseClue,
  analyzeContainers: analyzeContainers
}