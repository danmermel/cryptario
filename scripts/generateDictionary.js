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
    // no multi-word phrases
    if (line.match(/ /)) {
      return
    }
    line = line.toLowerCase()
    // remove punctuation and numbers and shit
    line = line.replace(/[^a-z]/g, '')
    dictionary[line] = true
  })

  lr.on('end', function () {
    console.log(JSON.stringify(dictionary))
  })
}

main()
