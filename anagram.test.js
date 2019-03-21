const anagram = require ("./anagram.js")


test("identifyIndicators returns empty array when there are none", function() {
  const res = anagram.identifyIndicators("The quick brown fox")
  expect(res).toEqual([]);
});

test("identifyIndicators returns one anagram indicator", function() {
  const res = anagram.identifyIndicators("The quick brown fox went absurd")
  expect(res).toEqual(["absurd"]);
});

test("identifyIndicators returns multiple anagram indicator", function() {
  const res = anagram.identifyIndicators("The altered quick brown fox went absurd ")
  expect(res).toEqual(["altered", "absurd"]);
});

test("solveAnagram: single word", async function() {
  var solution = await anagram.solveAnagram("god")
  expect(solution).toEqual(expect.arrayContaining(["dog","God"]))
});

test("solveAnagram: single word no solution", async function() {
  var solution = await anagram.solveAnagram("xxxx")
  expect(solution).toEqual([])
});

test("solveAnagram: multi word", async function() {
  var solution = await anagram.solveAnagram("Beaterworld!")
  expect(solution).toEqual(expect.arrayContaining(["world beater"]))
});

test("parseClue: pleasant tumble in gale", function() {
  var solution = anagram.parseClue("pleasant tumble in gale", "tumble", 6)
  expect(solution).toEqual([{letters:"ingale", words:["in","gale"], definition:"pleasant"}])

})

test("parseClue: in gale tumble pleasant", function() {
  var solution = anagram.parseClue("in gale tumble pleasant", "tumble", 6)
  expect(solution).toEqual([{letters:"galein", words:["gale", "in"], definition:"pleasant"}])
})

test("parseClue: in gale tumble ple ant", function() {
  var solution = anagram.parseClue("in gale tumble ple ant", "tumble", 6)
  expect(solution).toEqual([
   {letters:"galein", words:["gale", "in"], definition:"ple ant"},
   {letters:"pleant", words:["ple", "ant"], definition:"in gale"}
  ])
})


test("parseClue: pleasant tumble in gal", function() {
  var solution = anagram.parseClue("pleasant tumble in gal", "tumble", 6)
  expect(solution).toEqual([])
})

