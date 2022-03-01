import {getLyrics, getSong} from 'genius-lyrics-api'
import dns from 'dns'

const checkInternet = async () => {
  return dns.promises
    .lookup('google.com')
    .then(() => true)
    .catch(() => false)
}

const fetchLyrics = async (access_token, author, title) => {
  const internet = await checkInternet()
  if (!internet) {
    // If not connect to the internet
    throw new Error('No internet connection! (required to fetch lyrics)')
  } else {
    if (
      [access_token, author, title].some(
        arg => typeof arg !== 'string' || !arg instanceof String
      )
    ) {
      throw new Error(
        'Arguments passed to fetchLyrics must be of type "string"!'
      )
    }
    const options = {
      apiKey: access_token,
      title: title,
      artist: author,
    }
    const lyrics = await getLyrics(options)
    if (!lyrics || lyrics.length < 10)
      throw new Error(`Couldn't find lyrics for "${author} - ${title}" song!`)
    return lyrics
  }
}

export default fetchLyrics
