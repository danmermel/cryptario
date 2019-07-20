
const utilities = require('./utilities.js')
const stem = require('node-snowball')

const indicators = require('./homophoneIndicators.js')

const stemmedIndicators = stem.stemword(indicators)
// const db = require('./db.js')

const identifyIndicators = function (clue) {
  var homophoneIndicators = []
  const words = utilities.getWords(clue.toLowerCase())
  const stemmedWords = stem.stemword(words)

  // looping through the array stemmedWords

  for (var i = 0; i < stemmedWords.length; i++) {
    var word = stemmedWords[i]
    var x = stemmedIndicators.indexOf(word)
    if (x !== -1) {
      homophoneIndicators.push(words[i])
    }
  }

  // second pass for 2-word indicators
  // we are using the unstemmed indicators for comparison
  for (i = 0; i < words.length - 1; i++) {
    word = words[i] + ' ' + words[i + 1]
    x = indicators.indexOf(word)
    if (x !== -1) {
      homophoneIndicators.push(word)
    }
  }

  // second pass for 3-word indicators
  // we are using the unstemmed indicators for comparison
  for (i = 0; i < words.length - 2; i++) {
    word = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]
    x = indicators.indexOf(word)
    if (x !== -1) {
      homophoneIndicators.push(word)
    }
  }

  // second pass for 4-word indicators
  // we are using the unstemmed indicators for comparison
  for (i = 0; i < words.length - 3; i++) {
    word = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2] + ' ' + words[i + 3]
    x = indicators.indexOf(word)
    if (x !== -1) {
      homophoneIndicators.push(word)
    }
  }

  // second pass for 5-word indicators
  // we are using the unstemmed indicators for comparison
  for (i = 0; i < words.length - 4; i++) {
    word = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2] + ' ' + words[i + 3] + ' ' + words[i + 4]
    x = indicators.indexOf(word)
    if (x !== -1) {
      homophoneIndicators.push(word)
    }
  }

  return homophoneIndicators
}

const parseClue = function (clue, indicator, numLetters) {
  const words = utilities.getWords(clue.toLowerCase())
  const indicatorSplit = indicator.toLowerCase().split(' ')
  // find the position  of the indicator
  const pos = words.indexOf(indicatorSplit[0])
  if (pos === -1) {
    throw new Error('indicator not found')
  }

  // calculate if  remaining words are even or odd
  var remainingWordsLength = words.length - indicatorSplit.length
  var even = (remainingWordsLength % 2 === 0)

  // Scenario 1 - indicator is at the end. Only interested in the words at the start of the string
  if (pos === words.length - indicatorSplit.length) {
    if (even) {
      return { definition: words.slice(0, remainingWordsLength / 2).join(' '), subsidiary: words.slice(remainingWordsLength / 2, remainingWordsLength).join(' ') }
    } else {
      var hl = Math.floor(remainingWordsLength / 2)
      return { definition: words.slice(0, hl).join(' '), subsidiary: words.slice(hl, remainingWordsLength).join(' ') }
    }

    // Scenario 1 - indicator is at the start. Only interested in the words at the end of the string
  } else if (pos === 0) {
    return { definition: words.slice(indicatorSplit.length + remainingWordsLength / 2).join(' '),
      subsidiary: words.slice(indicatorSplit.length, indicatorSplit.length + remainingWordsLength / 2).join(' ') }
  } else {
    return { definition: words.slice(0, pos).join(' '), subsidiary: words.slice(pos + indicatorSplit.length).join(' ') }
  }
}

/*
const solveAnagram = async function (letters) {
  var processedLetters = utilities.transformWord(letters)
  var data = await db.queryAnagram(processedLetters)
  var retval = []
  for (var i in data.Items) {
    retval.push(data.Items[i].solution)
  }
  return retval
}
*/
/*
const analyzeHomophone = async function (clue) {
  var retval = []

  // first split the clue
  // returns an object with a clue, a totalLength and a wordLengths array
  var splitClue = utilities.split(clue)
  if (splitClue == null) {
    return []
  }
  console.log('split clue = ', splitClue)

  // now try to get homophone indicators
  // returns an array of indicators or an empty array if there are none
  var indicators = identifyIndicators(splitClue.clue)
  if (indicators.length === 0) {
    return []
  }
  console.log('indicators = ', indicators)

  // now parse clue for every possible indicator
  // paseClue returns  an array of objects [{letters, words, definition}]
  for (var i in indicators) {
    var indicator = indicators[i]
    var parsedClue = parseClue(splitClue.clue, indicator, splitClue.totalLength)
    console.log('indicator is ', indicator, ' and parsed Clue is ', parsedClue)

    for (var j in parsedClue) {
      var pc = parsedClue[j]
      var obj = { 'type': 'anagram',
        'clue': splitClue.clue,
        'totalLength': splitClue.totalLength,
        'definition': pc.definition,
        'indicator': indicator,
        'words': pc.words
      }
      // now make anagram words for all the words
      // returns an array of strings
      var solvedAnagrams = await solveAnagram(pc.letters)
      console.log('solvedAnagrams is ', solvedAnagrams)

      for (var k in solvedAnagrams) {
        var solved = solvedAnagrams[k]
        if (solved !== pc.letters) {
          console.log('solved is ', solved)
          // now we need to check if the solutions that came back fit with the
          // length of the solutions we are expecting
          if (utilities.checkWordPattern(solved, splitClue.wordLengths)) {
            // clone the obj so that it becomes different and not just a reference to itself.
            var x = JSON.parse(JSON.stringify(obj))
            x.solution = solved
            x.isSynonym = await utilities.isSynonym(x.definition, x.solution)
            retval.push(x)
          } // if
        } // if
      } // for k
    }; // for j
  } // for i

  // sort so that isSynonym:true goes top
  var sorter = function (a, b) {
    if (a.isSynonym && !b.isSynonym) {
      return -1
    } else if (!a.isSynonym && b.isSynonym) {
      return 1
    } else {
      return 0
    }
  }
  retval.sort(sorter)

  return retval
}
*/
module.exports = {
  identifyIndicators: identifyIndicators,
  parseClue: parseClue // ,
  // analyzeHomophone: analyzeHomophone
}
