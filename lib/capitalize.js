module.exports = word => {
  const chars = [word[0].toUpperCase()]
  for (let i = 1; i < word.length; i++) chars.push(word[i].toLowerCase())
  return chars.join('')
}
