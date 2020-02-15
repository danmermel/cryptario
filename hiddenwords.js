const utilities = require('./utilities.js')

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
  } else { // position of indicator is somehwere in clue
    return {
      indicator: indicator,
      definition: words.slice(0, pos).join(' '),
      subsidiary: words.slice(pos + indicatorSplit.length, words.length).join(' ')
    }
  }
}

const findHiddenWords = function (subsidiary, solutionLength) {
  var retval = []
  const letters = subsidiary.replace(/ /g, '') // remove all spaces
  for (var i = 0; i < letters.length - solutionLength + 1; i++) {
    retval.push(letters.slice(i, i + solutionLength))
  }
  return retval
}

const analyzeHidden = async function (clue) {
  var retval = []

  // first split the clue
  // returns an object with a clue, a totalLength and a wordLengths array
  var splitClue = utilities.split(clue)
  if (splitClue == null) {
    return []
  }
  console.log('split clue = ', splitClue)

  // now look for longest indicator
  var indicator = utilities.identifyIndicators(splitClue.clue, './hiddenWordIndicators.js')
  console.log('indicator', indicator)
  if (indicator === '') {
    return []
  }

  var parsedClue = parseClue(splitClue.clue, indicator)
  console.log('indicator is ', indicator, ' and parsed Clue is ', parsedClue)
  // now find hidden words in the subsidiary
  var hiddenWordCandidates = findHiddenWords(parsedClue.subsidiary, splitClue.totalLength)
  // now, are any of the candidates actual words?
  var actualWords = await utilities.findActualWords(hiddenWordCandidates)
  console.log('actualWords', actualWords)
  // now, are these words synonyms of the definition
  for (var j = 0; j < actualWords.length; j++) {
    var isSynonym = await utilities.isSynonym(actualWords[j], parsedClue.definition)
    retval.push({
      type: 'Hidden Word',
      clue: splitClue.clue,
      totalLength: splitClue.totalLength,
      definition: parsedClue.definition,
      subsidiary: parsedClue.subsidiary,
      indicator: indicator,
      words: null,
      solution: actualWords[j],
      isSynonym: isSynonym,
      info: 'The word "' + indicator + '" suggests this is a hidden word clue. The word "' + actualWords[j] + '" is hidden inside "' + parsedClue.subsidiary + '" and ' + (isSynonym ? 'is ' : 'may be ') + ' a synonym of "' + parsedClue.definition + '".'
    })
  } // for j

  console.log('retval', retval)

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
  var retval2 = []
  // return true if solution is already
  // found in the retval2 array of objects
  var alreadyIn = function (solutionObj) {
    for (var i in retval2) {
      var r = retval2[i]
      if (r.solution === solutionObj.solution) {
        // favour longer indicators over shorter indicators
        //  e.g. coming from overwrites from
        if (solutionObj.indicator.length > r.indicator.length) {
          retval2[i] = solutionObj
        }
        return true
      }
    }
    return false
  }
  // loop through all the candidate answers but
  // ensure that each solution only appears once
  // (you might get dupes because of multiple
  // hidden word indicators)
  for (var k in retval) {
    var r = retval[k]
    if (!alreadyIn(r)) {
      retval2.push(r)
    }
  }
  return retval2
}

module.exports = {
  parseClue: parseClue,
  findHiddenWords: findHiddenWords,
  analyzeHidden: analyzeHidden
}
