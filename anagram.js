
const utilities = require("./utilities.js");
const stem = require("node-snowball");

const indicators = require ("./anagramIndicators.js");
//const indicators = ["abandoned", "altered", "abnormal", "about", "absurd", "abused", "abysmal", "accident", "acrobatics", "action", "active"]

const stemmedIndicators = stem.stemword(indicators);
const db = require('./db.js')

const identifyIndicators = function (clue) {

  var anagramIndicators = [];
  const words = utilities.getWords(clue.toLowerCase());
  const stemmedWords = stem.stemword(words);

  for (var i in stemmedWords) {
    var word = stemmedWords[i]
    var x = stemmedIndicators.indexOf(word);
    if (x !== -1){
     anagramIndicators.push(words[i])
    }
  }
  return anagramIndicators
}

const parseClue = function(clue, indicator, numLetters) {
  const words = utilities.getWords(clue.toLowerCase());
  const pos = words.indexOf(indicator);
  if (pos === -1) {
    throw new Error('indicator not found')
  }
  // pleasant tumble in gale
  const left = words.slice(0, pos).reverse() // pleasant
  const right = words.slice(pos+1)  // in gale

  // look for words that add up to the numLetters count
  const leftSolution =  utilities.countLetters(left, numLetters)
  const rightSolution =  utilities.countLetters(right, numLetters)

  const retval = []
  
  // left null, right solution
  if (leftSolution === null && rightSolution) {
    retval.push({ letters: rightSolution.join(''), words: rightSolution, definition: left.reverse().join(' ')})
  }
  if (leftSolution && rightSolution === null) {
    retval.push({ letters: leftSolution.join(''), words: leftSolution, definition: right.join(' ')})
  }
  if (leftSolution && rightSolution) {
    retval.push({ letters: leftSolution.join(''), words: leftSolution, definition: right.join(' ')})
    retval.push({ letters: rightSolution.join(''), words: rightSolution, definition: left.reverse().join(' ')})
  }
  return retval
}

const solveAnagram = async function(letters) {
  var processedLetters = utilities.transformWord(letters)
  var data = await db.queryAnagram(processedLetters)
  var retval = []
  for(var i in data.Items) {
    retval.push(data.Items[i].solution)
  }
  return retval
}

module.exports = {
  identifyIndicators: identifyIndicators,
  parseClue: parseClue,
  solveAnagram: solveAnagram
}
