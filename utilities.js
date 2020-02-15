const datamuse = require('./datamuse.js')
const db = require('./db.js')
const stem = require('node-snowball')

const split = function (fullClue) {
  var lastBracket = fullClue.lastIndexOf('(')
  var bracketContent = fullClue.substr(lastBracket)
  bracketContent = bracketContent.replace(/[()]/g, '').trim()
  const wordLengths = bracketContent.split(/[^0-9]/).map(function (v) { return parseInt(v) })
  const totalLength = wordLengths.reduce(function (a, b) { return a + b })
  const clue = fullClue.substr(0, lastBracket).trim()
  return {
    clue: clue,
    totalLength: totalLength,
    wordLengths: wordLengths
  }
}

const isSynonym = async function (word1, word2) {
  if (typeof word1 !== 'string' || typeof word2 !== 'string') {
    return false
  }
  const synonyms = await datamuse.synonym(word1)
  // console.log('looking for ', word2, 'in', synonyms)
  const find = synonyms.indexOf(word2.toLowerCase())
  return (find > -1)
}

const getWords = function (clue) {
  // this splits the clue into component words and then
  // filters out the blank array members
  // it is NOT lowercasing because we think sometimes you want upper case to be preserved
  clue = clue.replace(/'/g, '')
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

const isWord = async function (word) {
  var result = await db.queryHidden(word)
  if (result.Count > 0) {
    return true
  } else {
    return false
  }
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

const removeStopwords = function (str, stopwords) {
  var retval = []
  const cleanWords = getWords(str)
  for (var w in cleanWords) {
    if (!stopwords.includes(cleanWords[w].toLowerCase())) {
      retval.push(cleanWords[w])
    }
  }
  return retval.join(' ')
}

// find longest indicator in the clue
const identifyIndicators = function (clue, indicatorFilename) {
  // load and stem the indicators from source file
  const indicators = require(indicatorFilename)
  const stemmedIndicators = stem.stemword(indicators)

  // split the clue into words and stem the words
  const retval = []
  const words = getWords(clue.toLowerCase())
  const stemmedWords = stem.stemword(words)

  // search for single word indicators
  for (var i = 0; i < stemmedWords.length; i++) {
    const word = stemmedWords[i]
    const x = stemmedIndicators.indexOf(word)
    // if indicator found
    if (x !== -1) {
      retval.push(words[i])
    }
  }

  // second pass for two-word indicators
  // Note: we are using the unstemmed indicators for comparison
  // because the stemmedIndicators is only stemming the last
  // word of a multi-word indicator.
  for (i = 0; i < words.length - 1; i++) {
    const word = words[i] + ' ' + words[i + 1]
    const x = indicators.indexOf(word)
    // if indicator found
    if (x !== -1) {
      retval.push(word)
    }
  }

  // third pass for three-word indicators
  // Note: we are using the unstemmed indicators for comparison
  // because the stemmedIndicators is only stemming the last
  // word of a multi-word indicator.
  for (i = 0; i < words.length - 2; i++) {
    const word = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]
    const x = indicators.indexOf(word)
    // if indicator found
    if (x !== -1) {
      retval.push(word)
    }
  }

  // fourth pass for four-word indicators
  // Note: we are using the unstemmed indicators for comparison
  // because the stemmedIndicators is only stemming the last
  // word of a multi-word indicator.
  for (i = 0; i < words.length - 3; i++) {
    const word = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2] + ' ' + words[i + 3]
    const x = indicators.indexOf(word)
    // if indicator found
    if (x !== -1) {
      retval.push(word)
    }
  }

  // fifth pass for five-word indicators
  // Note: we are using the unstemmed indicators for comparison
  // because the stemmedIndicators is only stemming the last
  // word of a multi-word indicator.
  for (i = 0; i < words.length - 4; i++) {
    const word = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2] + ' ' + words[i + 3] + +' ' + words[i + 4]
    const x = indicators.indexOf(word)
    // if indicator found
    if (x !== -1) {
      retval.push(word)
    }
  }

  return getLongestIndicator(retval)
}

module.exports = {
  split: split,
  removeStopwords: removeStopwords,
  isSynonym: isSynonym,
  getWords: getWords,
  countLetters: countLetters,
  transformWord: transformWord,
  isWord: isWord,
  checkWordPattern: checkWordPattern,
  findActualWords: findActualWords,
  getLongestIndicator: getLongestIndicator,
  identifyIndicators: identifyIndicators
}
