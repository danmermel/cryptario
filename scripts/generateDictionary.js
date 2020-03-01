const utilities = require('../utilities.js')
const fs = require('fs')

var main = function () {
  var LineByLineReader = require('line-by-line')

  var lr = new LineByLineReader('dictionary.txt')
  var dictionary = {
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
    7: {},
    8: {},
    9: {},
    10: {},
    11: {},
    12: {},
    13: {},
    14: {},
    15: {}
  }

  lr.on('error', function (err) {
    console.error(err)
    process.exit()
  })

  lr.on('line', function (line) {
    line = line.trim()
    if (line.length === 0) {
      return
    }
    // keep the original word before mangling it to retain potentially valuable info
    var originalWord = line
    line = line.toLowerCase()
    // remove punctuation and numbers and shit
    const word  = line.replace(/[^a-z]/g, '')

    // calculate how many letters are in the solution
    // all solutions over 15 letters are bundled together
    // so that the long tail on the bell curve are in one file
    var len = Math.min(15, word.length)
    var minidic = dictionary[len]

    // does the jumble already exist as a key
    if (!minidic[word]) {
      minidic[word] = true // add it to the dictionary
    }
  })

  lr.on('end', function () {
    for (var i in dictionary) {
      const filename = '../dictionary' + i + '.json'
      console.log(filename)
      fs.writeFileSync(filename, JSON.stringify(dictionary[i]))
    }
    // console.log(JSON.stringify(dictionary))
  })
}

main()
