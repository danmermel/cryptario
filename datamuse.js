// this is the Promise version of the request library
const request = require('request-promise')

const url = 'https://api.datamuse.com/'

// this is an async function. It can treat things that return
// Promises as synchronous code
async function synonym (word) {
  // await = hide the Promise/callback stuff
  try {
    const response = await request({ url: url + 'words?ml=' + word, json: true })
    const words = []
    for (var i in response) {
      words.push(response[i].word)
    }
    return words
  } catch (e) {
    return []
  }
}

module.exports = {
  synonym: synonym
}
