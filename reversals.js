const utilities = require('./utilities.js')
const datamuse = require('./datamuse.js')
const stopwords = require('./stopwords.js')

const parseClue = function (clue, indicator) {
  const words = utilities.getWords(clue.toLowerCase())
  const indicatorSplit = indicator.toLowerCase().split(' ')
  const pos = words.indexOf(indicatorSplit[0])
  if (pos === -1) {
    throw new Error('indicator not found')
  }

  if (pos === 0) { // the indicator is a the start of the clue
    // for now we are going to assume that the definition is only the last word of the clue
    return {
      indicator: indicator,
      definition: words[words.length - 1],
      subsidiary: words.slice(indicatorSplit.length, words.length - 1).join(' ')
    }
  } else if (pos === words.length - indicatorSplit.length) {
    // for now we are going to assume that the definition is only the first word of the clue
    return {
      indicator: indicator,
      definition: words[0],
      subsidiary: words.slice(1, pos).join(' ')
    }
  } else { // position of indicator is somehwere in clue
    return {
      indicator: indicator,
      definition: words.slice(0, pos).join(' '),
      subsidiary: words.slice(pos + indicatorSplit.length, words.length).join(' ')
    }
  }
}

const analyzeReversal = async function (clue) {
  var retval = []

  // first split the clue
  // returns an object with a clue, a totalLength and a wordLengths array
  var splitClue = utilities.split(clue)
  if (splitClue == null) {
    return []
  }
  console.log('split clue = ', splitClue)

  // now look for longest indicator
  var indicator = utilities.identifyIndicators(splitClue.clue, './reversalIndicators.js')
  console.log('indicator', indicator)
  if (indicator === '') {
    return []
  }

  // now parse clue for every possible indicator
  // paseClue returns  an array of objects [{letters, words, definition}]
  var parsedClue = parseClue(splitClue.clue, indicator)

  // remove stopwords
  parsedClue.subsidiary = utilities.removeStopwords(parsedClue.subsidiary, stopwords)
  parsedClue.definition = utilities.removeStopwords(parsedClue.definition, stopwords)
  console.log('indicator is ', indicator, ' and parsed Clue is ', parsedClue)

  // Find synonyms one side, e.g. fish = cod, halibut, swordfish, rib, pez)
  var synonyms = await datamuse.synonym(parsedClue.subsidiary)
  console.log('synonyms', synonyms)
  // Throw away any that don't match the solution pattern e.g. [4,5]
  synonyms = synonyms.filter(function (f) { return utilities.checkWordPattern(f, splitClue.wordLengths) })
  if (synonyms.length === 0) {
    console.log('no matches')
    return []
  }
  console.log('synonyms matching', synonyms)

  // reverse any that are left (cod = doc, rib=bir, pez = zep)
  // there's no string reverse, so we split/reverse/join using arrays
  var reversedSynonyms = synonyms.map(function (s) { return s.split('').reverse().join('') })
  console.log('rev synonyms', reversedSynonyms)

  // remove words that are nonsense (not in our dictionary)
  var actualWords = await utilities.findActualWords(reversedSynonyms)
  console.log('actualWords', actualWords)

  // See if any are synonyms of the other side (doc = physician)
  for (var j in actualWords) {
    // check for synonym
    var isSynonym = await utilities.isSynonym(actualWords[j], parsedClue.definition)
    retval.push({
      type: 'Reversal',
      clue: splitClue.clue,
      totalLength: splitClue.totalLength,
      definition: parsedClue.definition,
      indicator: indicator,
      subsidiary: parsedClue.subsidiary,
      words: null,
      solution: actualWords[j],
      isSynonym: isSynonym,
      info: actualWords[j].split('').reverse().join('') + ' is a synonym of ' + parsedClue.subsidiary + ', which when reversed gives you ' + actualWords[j] + ', which is a synonym of ' + parsedClue.definition
    })
  }
  // Return all of them anyway, but the synonym=true ones at the top

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

  // dedupe by solution
  return retval
}

module.exports = {
  parseClue: parseClue,
  analyzeReversal: analyzeReversal
}
