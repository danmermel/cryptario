const analyzeDoubleDef = async function (clue) {
  return []
}

const createSearchablePairs = function (words) {
  const retval = []
  for (var i = 0; i < words.length - 1; i++) {
    const first = words.slice(0, i + 1)
    const second = words.slice(i + 1)
    const obj = {
      one: first,
      two: second
    }
    retval.push(obj)
  }
  return retval
}

module.exports = {
  analyzeDoubleDef: analyzeDoubleDef,
  createSearchablePairs: createSearchablePairs
}
