// if there are no indicators carry on  and
//    try each word for a cryptic synonym (need a fn for that)
//    if you find a CS assume this is a charade and
//       assume first word is def and rest

const utilities = require('./utilities.js')
const datamuse = require('./datamuse.js')
const cartesian = require('fast-cartesian')

const parseClue = function (clue, indicator) {
  const words = utilities.getWords(clue.toLowerCase())
  if (indicator === '') {
    // this means no indicator was found, so we just assume that the definition is at the end and the
    // rest is subsidiary
    return { definition: words[words.length - 1], subsidiary: words.slice(0, words.length - 1).join(' ') }
  }
  const indicatorSplit = indicator.toLowerCase().split(' ')
  // find the position  of the indicator
  const pos = words.indexOf(indicatorSplit[0])
  if (pos === -1) {
    throw new Error('indicator not found')
  }

  // if the indicator is at the end of the clue, then the subsidiary is the word immediately preceding the indicator
  // and the definitions is the rest
  if (pos + indicatorSplit.length === words.length) {
    return { definition: words.slice(0, pos - 1).join(' '), subsidiary: words[pos - 1] }
  }

  // if the indicator is that the start of the clue, then the subsidiary is the word immediately after
  // and the definition is the rest
  if (pos === 0) {
    return { definition: words.slice(indicatorSplit.length + 1).join(' '), subsidiary: words[indicatorSplit.length] }
  }

  // if the indicator is somewhere in the middle , subsidiary is whatever is before the indicator
  // and the definition is whatever is after
  return { definition: words.slice(pos + indicatorSplit.length).join(' '), subsidiary: words.slice(0, pos).join(' ') }
}

const analyzeCharadesWorker = async function (clue) {
  var retval = []

  // first split the clue
  // returns an object with a clue, a totalLength and a wordLengths array
  var splitClue = utilities.split(clue)
  if (splitClue == null) {
    return []
  }
  console.log('split clue = ', splitClue)

  // now look for longest indicator
  var indicator = utilities.identifyIndicators(splitClue.clue, './charadeIndicators.js')
  console.log('indicator', indicator)
  var parsedClue = parseClue(splitClue.clue, indicator)
  console.log('parsedClue', parsedClue)

  // find the synonyms of all the words in the subsidiary
  // add a blank string to every array
  // filter out any words longer than the solution length -1 
  var words = utilities.getWords(parsedClue.subsidiary) // get an array
  var synonyms = []
  for (var x = 0; x < words.length; x++) {
    synonyms[x] = await datamuse.synonym(words[x])
    synonyms[x] = synonyms[x].filter(function (word) { return (word.length < splitClue.totalLength -1) })
    synonyms[x].push('')
    console.log('synonyoms of', words[x], synonyms[x].slice(0,10),'...',synonyms[x].length)
  }
  // get the cartesian product of all the remaining strings
  // remove any whose join is not equal to the clue length (first filter)
  // make sure the remaining are real words (second filter)
  var candidateWords = cartesian(synonyms)
      .filter(function (arr) { var y = arr.join(''); return (y.length === splitClue.totalLength) })
      .filter(function (arr) { var y = arr.join(''); return (utilities.isWord(y)) })
      .map(function (arr) { return arr.join('') })

  var realWords =  candidateWords.filter(function (item,pos) {return (candidateWords.indexOf(item) === pos)  })

  console.log('Real words are ', realWords)

  // now check if any of the  found words is a synonym of the definition

  for (var q = 0; q < realWords.length; q++) {
    if (await utilities.isSynonym(realWords[q], parsedClue.definition)) {
      // we found a word
      var info =''
      if (indicator) {
        info = 'The word "' + indicator + '" suggests this is a Charades-type clue. "'
      } else {
        info = 'This appears to be a Charades-type clue. '
      }
      info += ' We think the definition is ' + parsedClue.definition + '. We found synonyms of one or more of these words: "' + parsedClue.subsidiary + '", which when combined together form the word "' + realWords[q] + '", which is a synonym of "' + parsedClue.definition + '".' 
      retval.push({
        type: 'Charades',
        clue: splitClue.clue,
        totalLength: splitClue.totalLength,
        definition: parsedClue.definition,
        subsidiary: parsedClue.subsidiary,
        indicator: indicator,
        words: null,
        solution: realWords[q],
        info: info
      })
    }
  }

  return retval
}


// this is a horrible hack  so that we don't have to rewrite everything.
// we just want to allow the definition to be at the start or the end
const analyzeCharades = async function (clue) {

  // solve the clue as is
  const s1 = await analyzeCharadesWorker(clue)

  // solve the clue with the firt and last words switched
  const splitClue = utilities.split(clue)
  const words = utilities.getWords(splitClue.clue.toLowerCase())
  const firstWord = words[0]
  words[0] = ''
  words.push(firstWord)
  const clue2 = (words.join(' ')  + ' (' + splitClue.totalLength + ')').trim()
  console.log('clue2', clue2)
  const s2 =  await analyzeCharadesWorker(clue2)

  return s1.concat(s2)
}


module.exports = {
  parseClue,
  analyzeCharades
}
