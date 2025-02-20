const transformWord = function (word) {
  // lowercase
  word = word.toLowerCase()

  // remove all but letters
  word = word.replace(/[^a-z]/g, '')

  // reorder alphabetically

  word = word.split('')
  word = word.sort()
  word = word.join('')

  return word
}

const fs = require('fs')

var main = function () {
  var LineByLineReader = require('line-by-line')

  var lr = new LineByLineReader('combined.txt')
  var dictionary = 'id,jumble,solution\n'
  var index = 1

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

    var jumble = transformWord(line)
    dictionary += [index++, jumble, '"' + originalWord + '"'].join(',') + '\n'
  })

  lr.on('end', function () {
    const filename = './anagrams.csv'
    fs.writeFileSync(filename, dictionary)
    console.log('done')
  })
}

main()
