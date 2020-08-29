// this is the Promise version of the request library
const request = require('request-promise')
const crypticSynonyms = require('./crypticSynonyms.js')
const url = 'https://api.datamuse.com/'

const uniqueArray = function (a) {
  return a.filter(function (item, pos) {
    return a.indexOf(item) === pos
  })
}

// this is an async function. It can treat things that return
// Promises as synchronous code
async function synonym (word) {
  // await = hide the Promise/callback stuff
  console.log('finding synonym of', word)
  try {
    // ask datamuse to find the synonyms of the supplied word
    const response = await request({ url: url + 'words?max=50&ml=' + word, json: true })
    const words = []
    for (var i in response) {
      words.push(response[i].word)
    }
    // also lookup the cryptic synonyms of the word e.g. state --> AL
    const cs = crypticSynonyms[word.toLowerCase()] || []

    // return array of datamus + cryptic synonyms
    return uniqueArray(words.concat(cs))
  } catch (e) {
    console.error(e)
    return []
  }
}

module.exports = {
  synonym: synonym
}
