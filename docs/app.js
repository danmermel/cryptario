const solve = async (clue, clueType) => {
  var obj = { 'clue': clue }
  var response = await fetch('https://r5atfhsr91.execute-api.eu-west-1.amazonaws.com/stage/' + clueType, {
     method: 'post',
     body: JSON.stringify(obj)
  })
  var solution =  await response.json()
  return solution
}

var app = new Vue({
  el: '#app',
  data: {
    clue: '',
    solutions: []
  },

  methods: {

    analyze: async function () {
      const anagramSolutions = await solve(this.clue, 'anagram')
      const hiddenWordSolutions = await solve(this.clue, 'hiddenwords')
      const doubleDefSolutions = await solve(this.clue, 'doubledef')
      this.solutions = this.solutions.concat(anagramSolutions, hiddenWordSolutions, doubleDefSolutions)

    }
  }
})
