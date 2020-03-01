const wordExists = (word) => {
  word = word.trim()
  word = word.toLowerCase()
  word = word.replace(/[^a-z]/g, '')
  const len = word.length
  if (len === 0) {
    return false
  }
  const dictionary = require('./dictionary' + len + '.json')
  // the dictionary contains 'true' for valid entries but
  // we need to ensure we return 'false' for missing entries
  // to !! double-NOTs the answer to guarantee a boolean.
  return !!dictionary[word]
}

module.exports = {
  wordExists
}
