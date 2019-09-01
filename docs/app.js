const solve = async (clue, clueType) => {
  var obj = { 'clue': clue }
  var response = await fetch('https://prod.remebit.com/' + clueType, {
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
      solve(this.clue, 'anagram').then(function(solutions) {
        self.solutions = self.solutions.concat(solutions)
      })
      solve(this.clue, 'hiddenwords').then(function(solutions) {
        self.solutions = self.solutions.concat(solutions)
      })
      solve(this.clue, 'doubledef').then(function(solutions) {
        self.solutions = self.solutions.concat(solutions)
      })
      solve(this.clue, 'homophones').then(function(solutions) {
        self.solutions = self.solutions.concat(solutions)
      })
    }
  }
})
