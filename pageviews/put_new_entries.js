var new_entries = []
const fs = require('fs')
var LineByLineReader = require('line-by-line')
var lr = new LineByLineReader('./new_entries.txt')

lr.on('line', function (line) {
  new_entries.push(line)
})

lr.on('end', function () { 
  fs.writeFileSync('../frontend/new_entries.js', "export default " + JSON.stringify(new_entries))
})