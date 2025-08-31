export function analyzeText(text) {
  const results = {
    charCount: text.length,
    wordCount: (text.trim().match(/\S+/g) || []).length,
    hasHashtags: /(^|\s)#\w+/.test(text),
    hasMentions: /(^|\s)@\w+/.test(text),
    hasUrl: /(https?:\/\/|www\.)\S+/i.test(text),
    emojiCount: (text.match(/\p{Extended_Pictographic}/gu) || []).length,
    hasCTA: /(click|learn more|sign up|subscribe|buy now|read more|download|try it)/i.test(text),
    readingEase: fleschReadingEase(text),
    sentiment: naiveSentiment(text),
  }

  const suggestions = []

  if (results.charCount > 280) {
    suggestions.push('Too long for X (Twitter). Consider trimming to under 280 characters.')
  } else if (results.charCount < 80) {
    suggestions.push('Very short. Consider adding context or a hook to boost engagement.')
  }

  if (!results.hasHashtags) suggestions.push('Add 1–3 relevant hashtags to increase discoverability.')
  if (!results.hasMentions) suggestions.push('Mention collaborators or sources (e.g., @username) to widen reach.')
  if (!results.hasCTA) suggestions.push('Add a clear call to action (e.g., “Read more”, “Join us”, “Get the guide”).')
  if (!results.hasUrl) suggestions.push('Include a relevant link or reference if applicable.')
  if (results.emojiCount === 0) suggestions.push('One or two tasteful emojis can draw the eye.')
  if (results.readingEase < 50) suggestions.push('Simplify wording for easier scanning (shorter sentences, simpler words).')

  if (results.sentiment.score < -1) {
    suggestions.push('Tone feels negative; consider balancing with positive framing or benefits.')
  } else if (results.sentiment.score > 2) {
    suggestions.push('Great positive tone—consider adding a concrete benefit or stat.')
  }

  return { results, suggestions }
}

function fleschReadingEase(text) {
  const sentences = (text.match(/[.!?]+/g) || []).length || 1
  const words = (text.match(/\S+/g) || []).length || 1
  const syllables = (text.match(/[aeiouy]+/gi) || []).length || Math.max(1, Math.round(words * 1.3))
  const ASL = words / sentences
  const ASW = syllables / words
  return Math.round(206.835 - (1.015 * ASL) - (84.6 * ASW))
}

function naiveSentiment(text) {
  const posWords = ['good','great','love','excellent','awesome','wow','amazing','win','happy','boost','success']
  const negWords = ['bad','hate','terrible','awful','angry','sad','fail','problem','bug','issue']
  let score = 0
  const lower = text.toLowerCase()
  posWords.forEach(w => { if (lower.includes(w)) score += 1 })
  negWords.forEach(w => { if (lower.includes(w)) score -= 1 })
  return { score }
}
