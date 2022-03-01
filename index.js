#!/usr/bin/env node

import fs from 'fs'
const fsPromises = fs.promises
import path from 'path'
import url from 'url'
import fetchLyrics from './lib/fetchLyrics.js'
import formatData from './lib/formatData.js'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = process.argv.slice(2)

// Print help
const printHelp = () => {
  const help = fs.readFileSync(path.join(__dirname, 'help.txt'), 'utf8')
  console.log(help)
  process.exit(1)
}

// Handle no input
if (args.length <= 0) {
  console.error(
    'Please provide [MUSIC LIBRARY DIR], [LYRICS DIR] and --access-token-file!'
  )
  console.log(`
  For more information run:
 \x1b[32m ncmpcpp-lyrics --help \x1b[0m
  `)
  process.exit(1)
}

// Handle --help flag
if (args.includes('--help') || args.includes('-h')) printHelp()

// Obtain input
let mp3Dir, lyricsDir, accTokenFile
args.forEach((arg, i) => {
  if (fs.existsSync(arg)) {
    const isAccTokenFile =
      args[i - 1] === '--access-token-file' || args[i - 1] === '-a'
    if (isAccTokenFile) {
      //console.log('accTokenFile set')
      accTokenFile = arg
    } else if (!mp3Dir) {
      //console.log('mp3Dir set')
      mp3Dir = arg
    } else if (mp3Dir && !lyricsDir) {
      //console.log('lyricsDir set')
      lyricsDir = arg
    }
  }
})

// Fetch lyrics if needed and put them on the right place
let totalSongs = 0
const lyricsNotFound = []
const lyricsifyAll = async (mp3s, lyricss, ACCESS_TOKEN) => {
  const lyricsify = song => {
    totalSongs++
    // Check if song doesn't have lyrics and if so, fetch the lyrics and write them to the filesystem.
    if (
      !lyricss.some(lyric => {
        return lyric.title === song.title && lyric.author === song.author
      })
    ) {
      const songName = `${song.author} - ${song.title}`
      console.log(
        `Song \x1b[33m${songName}\x1b[0m needs lyrics. Fetching and writing lyrics...`
      )

      // Fetch and write lyrics
      const fetchAndWriteLyrics = async songName => {
        try {
          const lyrics = await fetchLyrics(
            ACCESS_TOKEN,
            song.author,
            song.title
          )

          // Uncomment to test what happens if lyrics were not found.
          //lyricsNotFound.push('Metallica - sth')
          const lyricsFilePath = path.join(lyricsDir, `${songName}.txt`)
          return (async () => {
            try {
              const writing = await fsPromises.writeFile(
                lyricsFilePath,
                lyrics,
                'utf8'
              )
              console.log(`Lyrics written to \x1b[33m${lyricsFilePath}\x1b[0m`)
              return writing
            } catch (err) {
              // Problem with writing lyrics to file
              console.error(`Couldn't write lyrics to ${lyricsFilePath}!`)
              throw err
            }
          })()
        } catch (err) {
          // Problem with fetching lyrics (couldn't find them or sth)
          if (err?.message?.includes('No internet connection')) {
            throw err
          }
          lyricsNotFound.push(songName)
          //console.error(`Couldn't fetch lyrics for ${songName}!`)
          //the above is now thrown as err from fetchLyrics
          console.error(err)
          return false
        }
      }
      return fetchAndWriteLyrics(songName)
    } else {
      // Lyrics already exist
      return false
    }
  }
  mp3s = mp3s.map(lyricsify)
  return Promise.all(mp3s)
}

// Validate and format input
if (fs.existsSync(accTokenFile) && fs.statSync(accTokenFile).isFile()) {
  fs.readFile(accTokenFile, 'utf8', (err, ACCESS_TOKEN) => {
    if (err) throw err
    if (ACCESS_TOKEN.length <= 3)
      throw new Error('The content of your --access-token-file is too short!')

    // Format input
    const mp3s = formatData(mp3Dir, 'mp3', lyricsDir)
    const lyricss = formatData(lyricsDir, 'txt', mp3Dir)

    // Validate input
    if (mp3s.length < 1) {
      console.log('Your music library is empty!', 'Exiting...')
      process.exit(1)
    } else if (!mp3s) {
      throw new Error(`Invalid or missing option [MUSIC LIBRARY DIR]`)
    } else if (!lyricss) {
      throw new Error(`Invalid or missing option [LYRICS DIR]`)
    }

    // Use input
    lyricsifyAll(mp3s, lyricss, ACCESS_TOKEN).then(() => {
      // Print summary before exit.
      const haveLyrics = totalSongs - lyricsNotFound.length
      const colorifyXfromY = haveLyrics === totalSongs && totalSongs !== 0
      console.log('\n')
      console.log(
        ' SUMMARY:\n',
        `${colorifyXfromY ? '\x1b[32m' : ''}${haveLyrics}/${totalSongs}${
          colorifyXfromY ? '\x1b[0m' : ''
        } songs have lyrics.`
      )
      const color =
        (lyricsNotFound.length > 0 ? '\x1b[31m' : '\x1b[32m') +
        lyricsNotFound.length +
        '\x1b[0m'
      console.log(` Failed attempts: (${color})`)
      if (lyricsNotFound.length === 0) {
        console.log('\x1b[32m%s\x1b[0m', ' Success!')
      } else {
        lyricsNotFound.forEach(failed =>
          console.log(`  \x1b[31m${failed}\x1b[0m`)
        )
      }
      console.log('\n')
      process.exit(1)
    })
  })
} else {
  // Good error handling for expectably the most frequent error
  if (args.includes('-a') || args.includes('--access-token-file')) {
    if (fs.existsSync(accTokenFile)) {
      throw new Error(`Access token incorrect!`)
    } else {
      throw new Error(`Access token file does not exist!`)
    }
  }
  throw new Error(`Missing --access-token-file flag!`)
}
