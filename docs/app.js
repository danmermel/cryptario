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
    progress: 0,
    solving: false,
    solutions: []
  },

  methods: {

    analyze: async function () {
      const self = this
      self.solutions = []
      self.solving = true
      self.progress = 0
      const increment = 100/8

      solve(this.clue, 'anagram').then(function(solutions) {
        self.solutions = self.solutions.concat(solutions)
        self.progress += increment
      })
      solve(this.clue, 'hiddenwords').then(function(solutions) {
        self.solutions = self.solutions.concat(solutions)
        self.progress += increment
      })
      solve(this.clue, 'doubledef').then(function(solutions) {
        self.solutions = self.solutions.concat(solutions)
        self.progress += increment
      })
      solve(this.clue, 'homophones').then(function(solutions) {
        self.solutions = self.solutions.concat(solutions)
        self.progress += increment
      })
      solve(this.clue, 'reversals').then(function(solutions) {
        self.solutions = self.solutions.concat(solutions)
        self.progress += increment
      })
      solve(this.clue, 'containers').then(function(solutions) {
        self.solutions = self.solutions.concat(solutions)
        self.progress += increment
      })
      solve(this.clue, 'subtractions').then(function(solutions) {
        self.solutions = self.solutions.concat(solutions)
        self.progress += increment
      })
      solve(this.clue, 'charades').then(function(solutions) {
        self.solutions = self.solutions.concat(solutions)
        self.progress += increment
      })
    }
  }
})
