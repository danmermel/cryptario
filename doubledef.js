const datamuse = require('./datamuse.js')
const utilities = require('./utilities.js')

const analyzeDoubleDef = async function (clue) {
  return []
}

const createSearchablePairs = function (words) {
  const retval = []
  for (var i = 0; i < words.length - 1; i++) {
    const first = words.slice(0, i + 1)
    const second = words.slice(i + 1)
    const obj = {
      one: first,
      two: second
    }
    retval.push(obj)
  }
  return retval
}

const comparePair = async function (first, second, pattern) {
  const firstSynonyms = await datamuse.synonym(first)
  // Throw away any that are not as long as the solution pattern
  const filteredFirstSynonyms = firstSynonyms.filter(function (word) { return utilities.checkWordPattern(word, pattern) })

  const secondSynonyms = await datamuse.synonym(second)
  const filteredSecondSynonyms = secondSynonyms.filter(function (word) { return utilities.checkWordPattern(word, pattern) })

  // now see if there are common synonyms in both arrays

  var matches = []
  for (var i in filteredFirstSynonyms) {
    var word = filteredFirstSynonyms[i]
    if (filteredSecondSynonyms.includes(word)) {
      matches.push(word)
    }
  }

  return matches
}
module.exports = {
  analyzeDoubleDef: analyzeDoubleDef,
  comparePair: comparePair,
  createSearchablePairs: createSearchablePairs
}
