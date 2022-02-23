import {getLyrics, getSong} from 'genius-lyrics-api'

const fetchLyrics = (access_token, author, title) => {
  if (
    [access_token, author, title].some(
      arg => typeof arg !== 'string' || !arg instanceof String
    )
  ) {
    throw new Error('Arguments passed to fetchLyrics must be of type "string"!')
  }
  const options = {
    apiKey: access_token,
    title: title,
    artist: author,
  }
  return getLyrics(options)
}

export default fetchLyrics
