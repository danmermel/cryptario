
const utilities = require('./utilities.js')
const stopwords = require('./stopwords.js')
const datamuse = require('./datamuse.js')

const parseClue = function (clue, indicator, numLetters) {
  var words = utilities.getWords(clue.toLowerCase())
  const indicatorSplit = indicator.toLowerCase().split(' ')
  // find the position  of the indicator
  var pos = words.indexOf(indicatorSplit[0])
  if (pos === -1) {
    throw new Error('indicator not found')
  }

  // get all the words to the left of the indicator
  var left = words.slice(0, pos).join(' ')
  console.log('left is ', left)
  // get all the words to the right of the indicator
  var right = words.slice(pos + indicatorSplit.length).join(' ')
  console.log('right is ', right)

  // remove stopwords from left and right
  left = utilities.removeStopwords(left, stopwords)
  right = utilities.removeStopwords(right, stopwords)

  // reconstruct words array with what remains (left + indicator + right)
  var wordString = left + ' ' + indicator + ' ' + right
  words = utilities.getWords(wordString)
  console.log('wordString', words)

  // recalculate the position ofthe indicator
  pos = words.indexOf(indicatorSplit[0])

  // This is a naive analysis,
  // we assume a one word definition and one word subsidiary
  // and the second subsidiary is the rest of the words
  // What if there is a two-word definition?
  if (pos - 1 === 0) {
    return { definition: words[words.length - 1], subsidiary1: words[pos - 1], subsidiary2: words.slice(pos + indicatorSplit.length, words.length - 1).join(' ') }
  } else {
    return { definition: words[0], subsidiary1: words[pos - 1], subsidiary2: words[pos + indicatorSplit.length] }
  }
}

// returns true if
//  - c1 is inside full (not at the beginning or end)
//  - AND when removing c1 , c2 remains
const contains = function (full, c1, c2) {
  var pos = full.indexOf(c1)
  // berate
  // if the c1 isn't in full or is at the start or at the end
  if (pos === -1 || pos === 0 || pos + c1.length === full.length) {
    return false
  }
  // remove c1 from full
  full = full.replace(c1, '')
  if (full === c2) {
    return true
  } else {
    return false
  }
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

  // now look for longest indicator
  var indicator = utilities.identifyIndicators(splitClue.clue, './containerIndicators.js')
  console.log('indicator', indicator)
  if (indicator === '') {
    return []
  }

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
        var solvedAnagrams = await utilities.solveAnagram(str)
        // console.log('Anagrams of ', str, 'are', solvedAnagrams)
        for (var l in solvedAnagrams) {
          var solvedAnagram = solvedAnagrams[l]
          console.log('solvedAnagram', solvedAnagram)
          // only solved anagrams that contain one of the original words
          // are allowed to be solutions
          if (contains(solvedAnagram, s1[i], s2[j]) || contains(solvedAnagram, s2[j], s1[i])) {
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
  parseClue: parseClue,
  analyzeContainers: analyzeContainers
}
