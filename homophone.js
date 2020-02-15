
const utilities = require('./utilities.js')
const datamuse = require('./datamuse.js')
const soundex = require('double-metaphone')

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
    return {
      definition: words.slice(indicatorSplit.length + remainingWordsLength / 2).join(' '),
      subsidiary: words.slice(indicatorSplit.length, indicatorSplit.length + remainingWordsLength / 2).join(' ')
    }
  } else {
    return { definition: words.slice(0, pos).join(' '), subsidiary: words.slice(pos + indicatorSplit.length).join(' ') }
  }
}

const analyzeHomophone = async function (clue) {
  // first split the clue
  // returns an object with a clue, a totalLength and a wordLengths array
  var splitClue = utilities.split(clue)
  if (splitClue == null) {
    return []
  }
  console.log('split clue = ', splitClue)

  // now look for longest indicator
  var indicator = utilities.identifyIndicators(splitClue.clue, './homophoneIndicators.js')
  console.log('indicator', indicator)
  if (indicator === '') {
    return []
  }

  // paseClue returns  an array of objects [{letters, words, definition}]
  var solutions = []
  var parsedClue = parseClue(splitClue.clue, indicator, splitClue.totalLength)
  console.log('indicator is ', indicator, ' and parsed Clue is ', parsedClue)

  var pc = parsedClue
  var obj = {
    type: 'homophone',
    clue: splitClue.clue,
    totalLength: splitClue.totalLength,
    definition: pc.definition, //  a guess based on position in the clue
    indicator: indicator,
    subsidiary: pc.subsidiary // this could turn out to be the definition
  }

  // find synonyms of definition & subsidiary
  var definitionSynonyms = await datamuse.synonym(obj.definition)
  var subsidiarySynonyms = await datamuse.synonym(obj.subsidiary)
  // console.log('definition synonyms', definitionSynonyms)
  // console.log('subsidiary synonyms', subsidiarySynonyms)
  if (definitionSynonyms.length === 0 || subsidiarySynonyms.length === 0) {
    return []
  }

  // calculate soundex of synonyms
  var j
  var definitionSoundex = []
  var subsidiarySoundex = []
  for (j = 0; j < definitionSynonyms.length; j++) {
    definitionSoundex[j] = soundex(definitionSynonyms[j])[0]
  }
  for (j = 0; j < subsidiarySynonyms.length; j++) {
    subsidiarySoundex[j] = soundex(subsidiarySynonyms[j])[0]
  }
  // console.log('definition soundexes', definitionSoundex)
  // console.log('subsidiary soundexes', subsidiarySoundex)

  // look for equality between soundex of synonyms
  var k
  for (j = 0; j < definitionSoundex.length; j++) {
    var a = definitionSoundex[j]
    for (k = 0; k < subsidiarySoundex.length; k++) {
      if (a === subsidiarySoundex[k]) {
        // we found a definition synonym that sounds like subsidiary synonym
        // now check lengths
        var c
        if (definitionSynonyms[j].length === obj.totalLength) {
          // clone the object
          c = JSON.parse(JSON.stringify(obj))
          c.solution = definitionSynonyms[j]
          c.info = c.definition + ' has a synonym ' + definitionSynonyms[j] + ' which sounds like ' +
                    subsidiarySynonyms[k] + ' which is a synonym of ' + c.subsidiary
          solutions.push(c)
        } else if (subsidiarySynonyms[k].length === obj.totalLength) {
          c = JSON.parse(JSON.stringify(obj))
          // swap definition and subsidiary (we guessed wrongly)
          var s = c.definition
          c.definition = c.subsidiary
          c.subsidiary = s
          c.solution = subsidiarySynonyms[k]
          c.info = c.definition + ' has a synonym ' + subsidiarySynonyms[k] + ' which sounds like ' +
                    definitionSynonyms[j] + ' which is a synonym of ' + c.subsidiary
          solutions.push(c)
        }
      }
    }
  }

  return solutions
}

module.exports = {
  parseClue: parseClue,
  analyzeHomophone: analyzeHomophone
}
