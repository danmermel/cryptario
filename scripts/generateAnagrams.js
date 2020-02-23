const utilities = require('../utilities.js')
const fs = require('fs')

var main = function () {
  var LineByLineReader = require('line-by-line')

  var lr = new LineByLineReader('combined.txt')
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
    line = line.replace(/[^a-z]/g, '')
    // transform what is left into alphabetically ordered letters

    var jumble = utilities.transformWord(line)

    // calculate how many letters are in the solution
    // all solutions over 15 letters are bundled together
    // so that the long tail on the bell curve are in one file
    var len = Math.min(15, jumble.length)
    var minidic = dictionary[len]

    // does the jumble already exist as a key
    if (minidic[jumble]) {
      // does the word not exist inside the array for the key
      if (!minidic[jumble].includes(originalWord)) {
        minidic[jumble].push(originalWord)
      }
    } else { // add it to the dictionary
      minidic[jumble] = [originalWord] // because it is an array, starting with one thing in it
    }
  })

  lr.on('end', function () {
    for (var i in dictionary) {
      const filename = 'anagramSolutions' + i + '.json'
      console.log(filename)
      fs.writeFileSync(filename, JSON.stringify(dictionary[i]))
    }
    // console.log(JSON.stringify(dictionary))
  })
}

main()
