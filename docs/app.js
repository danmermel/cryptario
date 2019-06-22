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
      const self = this
      self.solutions = []
      solve(this.clue, 'anagram').then(function(anagramSolutions) {
        self.solutions = self.solutions.concat(anagramSolutions)
      })
      solve(this.clue, 'hiddenwords').then(function(hiddenwordsSolutions) {
        self.solutions = self.solutions.concat(hiddenwordsSolutions)
      })
      solve(this.clue, 'doubledef').then(function(doubledefSolutions) {
        self.solutions = self.solutions.concat(doubledefSolutions)
      })
    }
  }
})
