const TOTALS_FILE = './totals.json'
var totals = require(TOTALS_FILE)

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

for(var i in totals) {
  console.log(pad(totals[i],8) + '\t' + i)
}
