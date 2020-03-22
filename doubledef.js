const datamuse = require('./datamuse.js')
const utilities = require('./utilities.js')

const analyzeDoubleDef = async function (clue) {
  var retval = []
  const splitClue = utilities.split(clue)
  const words = utilities.getWords(splitClue.clue)
  // console.log('words are ', words)
  const searchablePairs = createSearchablePairs(words)
  console.log('searchablePairs is ', searchablePairs)
  // now we will take the middle searchable pair, i.e. the one most evenly balanced.
  // This is a compromise because doing all the pairs will be expensive on datamuse calls
  const i = Math.floor(searchablePairs.length / 2)
  const pair = searchablePairs[i]
  const matches = await comparePair(pair.one, pair.two, splitClue.wordLengths)
  for (var j = 0; j < matches.length; j++) {
    const obj = {
      type: 'double definition',
      clue: splitClue.clue,
      totalLength: splitClue.totalLength,
      definition: [pair.one.join(' '), pair.two.join(' ')],
      subsidiary: '',
      indicator: '',
      words: null,
      solution: matches[j],
      isSynonym: true,
      info: '"' + pair.one.join(' ') + '" and "' + pair.two.join(' ') + '" are both synonyms of "' + matches[j] + '".'
    }
    retval.push(obj)
  }
  return retval
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
  console.log(filteredFirstSynonyms, filteredSecondSynonyms)
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
