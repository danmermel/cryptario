const utilities = require('../utilities.js')

var main = function () {
  var LineByLineReader = require('line-by-line')

  var lr = new LineByLineReader('combined.txt')
  var dictionary = {}

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

    // does the jumble already exist as a key
    if (dictionary[jumble]) {
      // does the word not exist inside the array for the key
      if (!dictionary[jumble].includes(originalWord)) {
        dictionary[jumble].push(originalWord)
      }
    } else { // add it to the dictionary
      dictionary[jumble] = [originalWord] // because it is an array, starting with one thing in it
    }
  })

  lr.on('end', function () {
    console.log(JSON.stringify(dictionary))
  })
}

main()
