
const utilities = require('./utilities.js')
const db = require('./db.js')

const parseClue = function (clue, indicator, numLetters) {
  const words = utilities.getWords(clue.toLowerCase())
  const indicatorSplit = indicator.toLowerCase().split(' ')
  const pos = words.indexOf(indicatorSplit[0])
  if (pos === -1) {
    throw new Error('indicator not found')
  }
  // pleasant tumble in gale
  const left = words.slice(0, pos).reverse() // pleasant
  const right = words.slice(pos + indicatorSplit.length) // in gale
  const retval = []
  console.log('left', left, 'right', right)
  var subsidiaryWords = []
  var definition = ''

  if (right.length === 0) { // indicator is at the end
    // the indicator is reversed on this side.
    // so you work from the beginning
    // looking for word lengths which add up to the clue length
    for (var x = 1; x < left.length; x++) {
      // take slice if words from the right of the array
      const subset = left.slice(0, x)

      // if their total string length matches the clue length
      if (utilities.countLetters(subset, numLetters)) {
        // we know the subsidiary
        subsidiaryWords = subset

        // and the definition is the remaining words
        definition = left.slice(x)
        break
      }
    }

    // if we found a match
    if (subsidiaryWords.length > 0) {
      // add it to the return array
      retval.push({ letters: subsidiaryWords.join(''), words: subsidiaryWords.reverse(), definition: definition.reverse().join(' ') })
    }
  } else if (left.length === 0) { // indicator is at the beginning
    // so you work from the beginning
    // looking for word lengths which add up to the clue length
    console.log('right is ', right)
    console.log('right length is ', right.length)

    for (x = 1; x < right.length; x++) {
      // take slice of words from the left of the array
      const subset = right.slice(0, x)
      console.log('subset contains .', subset)

      // if their total string length matches the clue length
      if (utilities.countLetters(subset, numLetters)) {
        // we know the subsidiary
        subsidiaryWords = subset

        // and the definition is the remaining words
        definition = right.slice(x)
        break
      }
    }

    // if we found a match
    if (subsidiaryWords.length > 0) {
      // add it to the return array
      retval.push({ letters: subsidiaryWords.join(''), words: subsidiaryWords, definition: definition.join(' ') })
    }
  } else { // indicator is somewhere else in the middle
  // look for words that add up to the numLetters count
    const leftSolution = utilities.countLetters(left, numLetters)
    const rightSolution = utilities.countLetters(right, numLetters)

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
  } // end if
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

  // now look for longest indicator
  var indicator = utilities.identifyIndicators(splitClue.clue, './anagramIndicators.js')
  console.log('indicator', indicator)
  if (indicator === '') {
    return []
  }

  // paseClue returns  an array of objects [{letters, words, definition}]
  var parsedClue = parseClue(splitClue.clue, indicator, splitClue.totalLength)
  console.log('indicator is ', indicator, ' and parsed Clue is ', parsedClue)

  for (var j in parsedClue) {
    var pc = parsedClue[j]
    var obj = {
      type: 'anagram',
      clue: splitClue.clue,
      totalLength: splitClue.totalLength,
      definition: pc.definition,
      indicator: indicator,
      words: pc.words,
      subsidiary: pc.words.join(' ')
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
          x.info = 'The word "' + x.indicator + '" looks like an anagram indicator and "' + x.solution + '" is an anagram of "' + x.words.join(' ') + '" '
          if (x.isSynonym) {
            x.info += ' which is a synonym of "' + x.definition + '"'
          } else {
            x.info += ' and may be a synonym of "' + x.definition + '"'
          }
          retval.push(x)
        } // if
      } // if
    } // for k
  }; // for j

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
  parseClue: parseClue,
  solveAnagram: solveAnagram,
  analyzeAnagram: analyzeAnagram
}
