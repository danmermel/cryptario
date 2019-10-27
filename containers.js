
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
    return { definition: words[words.length - 1],  subsidiary1: words[pos-1], subsidiary2:  words[pos + indicatorSplit.length] }
  }  else {
    return { definition: words[0],  subsidiary1: words[pos-1], subsidiary2: words[pos + indicatorSplit.length] }
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

  // now try to get anagram indicators
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
  console.log('synonyms of', parsedClue.subsidiary1, 'are' , s1)
  console.log('synonyms of', parsedClue.subsidiary2, 'are' , s2)
  const candidates = []
  for(var i in s1) {
   for(var j in s2) {
     const str = s1[i] + s2[j]
     if (str.length === splitClue.totalLength) {
       var solvedAnagrams = await solveAnagram(str)
       console.log('Anagrams of ', str, 'are' , solvedAnagrams)
       for(var l in  solvedAnagrams) {
         var solvedAnagram = solvedAnagrams[l]
         // only solved anagrams that contain one of the original words
         // are allowed to be solutions
         if (solvedAnagram.indexOf(s1[i]) > -1 || solvedAnagram.indexOf(s2[j]) > -1) {
           candidates.push(solvedAnagram)
         }
       }
     }
   }
  }
  console.log('candidates', candidates)


  return []


  // now parse clue for every possible indicator
  // paseClue returns  an array of objects [{letters, words, definition}]
  for (var i in indicators) {
    var indicator = indicators[i]
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
  analyzeContainers: analyzeContainers
}
