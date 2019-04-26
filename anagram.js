
const utilities = require('./utilities.js')
const stem = require('node-snowball')

const indicators = require('./anagramIndicators.js')

const stemmedIndicators = stem.stemword(indicators)
const db = require('./db.js')

const identifyIndicators = function (clue) {
  var anagramIndicators = []
  const words = utilities.getWords(clue.toLowerCase())
  const stemmedWords = stem.stemword(words)

  // looping through the array stemmedWords, but ignoring the first and last words because
  // by definition they cannot be indicators - you cannot have anything to anagram before/after them
  for (var i = 1; i < stemmedWords.length - 1; i++) {
    var word = stemmedWords[i]
    var x = stemmedIndicators.indexOf(word)
    if (x !== -1) {
      anagramIndicators.push(words[i])
    }
  }
  return anagramIndicators
}

const parseClue = function (clue, indicator, numLetters) {
  const words = utilities.getWords(clue.toLowerCase())
  const pos = words.indexOf(indicator)
  if (pos === -1) {
    throw new Error('indicator not found')
  }
  // pleasant tumble in gale
  const left = words.slice(0, pos).reverse() // pleasant
  const right = words.slice(pos + 1) // in gale

  // look for words that add up to the numLetters count
  const leftSolution = utilities.countLetters(left, numLetters)
  const rightSolution = utilities.countLetters(right, numLetters)

  const retval = []

  // left null, right solution
  if (leftSolution === null && rightSolution) {
    retval.push({ letters: rightSolution.join(''), words: rightSolution, definition: left.reverse().join(' ') })
  }
  if (leftSolution && rightSolution === null) {
    retval.push({ letters: leftSolution.join(''), words: leftSolution, definition: right.join(' ') })
  }
  if (leftSolution && rightSolution) {
    retval.push({ letters: leftSolution.join(''), words: leftSolution, definition: right.join(' ') })
    retval.push({ letters: rightSolution.join(''), words: rightSolution, definition: left.reverse().join(' ') })
  }
  return retval
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

const analyzeAnagram = async function (clue) {
  var retval = []

  // first split the clue
  // returns an object with a clue, a totalLength and a wordLengths array
  var splitClue = utilities.split(clue)
  if (splitClue == null) {
    return []
  }
  console.log('split clue = ', splitClue)

  // now try to get anagram indicators
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

module.exports = {
  identifyIndicators: identifyIndicators,
  parseClue: parseClue,
  solveAnagram: solveAnagram,
  analyzeAnagram: analyzeAnagram
}
