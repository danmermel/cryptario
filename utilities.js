const datamuse = require('./datamuse.js')

const split = function (fullClue) {
  var lastBracket = fullClue.lastIndexOf("(");
  var bracketContent = fullClue.substr(lastBracket);
  bracketContent = bracketContent.replace(/[()]/g,"").trim();
  const wordLengths = bracketContent.split(/[^0-9]/).map(function(v) {return parseInt(v)});
  const totalLength = wordLengths.reduce(function(a,b) {return a+b});
  const clue = fullClue.substr(0,lastBracket-1).trim();
  return {clue:clue,
	  totalLength:totalLength,
	  wordLengths: wordLengths}
  };

const isSynonym = async function (word1, word2) {
  const synonyms = await datamuse.synonym(word1)
  const find = synonyms.indexOf(word2)
  return (find > -1)
}


module.exports = {
  split : split,
  isSynonym: isSynonym
}
