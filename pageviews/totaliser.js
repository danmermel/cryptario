if (!process.argv[2]) {
  console.error('Usage:')
  console.error('  node totaliser.js <filename>')
  process.exit(1)
}

const TOTALS_FILE = './totals.json'
var totals = require(TOTALS_FILE)
const fs = require('fs')
var LineByLineReader = require('line-by-line')
var lr = new LineByLineReader(process.argv[2])

lr.on('line', function (line) {
  const bits = line.split(' ')
  const page = bits[0]
  const count = parseInt(bits[1])
  if (totals[page]) {
    totals[page] += count
  } else {
    totals[page] = count
  }
})

lr.on('end', function () {
  fs.writeFileSync(TOTALS_FILE, JSON.stringify(totals), { encoding: 'utf8' })
  process.exit(0)
})
