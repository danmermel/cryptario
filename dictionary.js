const dictionary = require('./dictionary.json')

const wordExists = (word) => {
  return !!dictionary[word]
}

module.exports = {
  wordExists
}
