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
  vuetify: new Vuetify(),
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

     const clueTypes = ["anagram", "hiddenwords", "containers", "reversals", "doubledef", "charades", "homophones", "subtractions"]

     for (var i in clueTypes) {
       var clueType = clueTypes[i]
       solve(this.clue, clueType).then(function(solutions) {
         self.solutions = self.solutions.concat(solutions)
         self.progress += increment
       }).catch(function(err) {
         self.progress += increment
         console.log (clueType, " err ", err)
       })
     }  //end for
   } // analyze
  } //methods
})
