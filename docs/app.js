var app = new Vue({
  el: '#app',
  data: {
    clue: '',
    solutions: []
  },

  methods: {

    analyze: async function () {
      var obj = { 'clue': this.clue }
      var response = await fetch('https://t1c6x6ajze.execute-api.eu-west-1.amazonaws.com/stage/analyze', {
        method: 'post',
        body: JSON.stringify(obj)
      })
      this.solutions = await response.json()
    }
  }
})
