const datamuse = require('./datamuse.js')
const db = require('./db.js')

const split = function (fullClue) {
  var lastBracket = fullClue.lastIndexOf('(')
  var bracketContent = fullClue.substr(lastBracket)
  bracketContent = bracketContent.replace(/[()]/g, '').trim()
  const wordLengths = bracketContent.split(/[^0-9]/).map(function (v) { return parseInt(v) })
  const totalLength = wordLengths.reduce(function (a, b) { return a + b })
  const clue = fullClue.substr(0, lastBracket - 1).trim()
  return { clue: clue,
    totalLength: totalLength,
    wordLengths: wordLengths
  }
}

const isSynonym = async function (word1, word2) {
  if (typeof word1 !== 'string' || typeof word2 !== 'string') {
    return false
  }
  const synonyms = await datamuse.synonym(word1)
  const find = synonyms.indexOf(word2.toLowerCase())
  return (find > -1)
}

const getWords = function (clue) {
  // this splits the clue into component words and then
  // filters out the blank array members
  // it is NOT lowercasing because we think sometimes you want upper case to be preserved
  return clue.split(/\W/g).filter(function (str) { return str.length > 0 })
}

const countLetters = function (words, numLetters) {
  var total = 0
  var match = []
  for (var i in words) {
    total = total + words[i].length
    match.push(words[i])
    if (total === numLetters) {
      return match
    }
  }
  return null
}

const transformWord = function (word) {
  // lowercase
  word = word.toLowerCase()

  // remove all but letters
  word = word.replace(/[^a-z]/g, '')

  // reorder alphabetically

  word = word.split('')
  word = word.sort()
  word = word.join('')

  return word
}

const checkWordPattern = function (str, pattern) {
  const words = getWords(str)
  const lengths = words.map(function (str) { return str.length })
  // to compare arrays for equality turn them into strings
  return (JSON.stringify(lengths) === JSON.stringify(pattern))
}

const findActualWords = async function (candidateWords) {
  var retval = []
  for (var i = 0; i < candidateWords.length; i++) {
    var result = await db.queryHidden(candidateWords[i])
    if (result.Count > 0) {
      retval.push(candidateWords[i]) // the word is real, so add it to the array
    }
  }
  return retval
}

const getLongestIndicator = function (indicators) {
  var indicator = ''
  for (var i in indicators) {
    if (indicators[i].length > indicator.length) {
      indicator = indicators[i]
    }
  }
  return indicator
}

module.exports = {
  split: split,
  isSynonym: isSynonym,
  getWords: getWords,
  countLetters: countLetters,
  transformWord: transformWord,
  checkWordPattern: checkWordPattern,
  findActualWords: findActualWords,
  getLongestIndicator: getLongestIndicator
}
