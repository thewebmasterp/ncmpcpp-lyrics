import fs from 'fs'
import path from 'path'
import walkSync from 'walk-sync'

const formatData = (dirpath, ext, excDir) => {
  if (ext.length !== 3) throw new Error('Invalid ext')
  if (fs.existsSync(dirpath) && fs.statSync(dirpath).isDirectory()) {
    return walkSync(dirpath, {includeBasePath: true})
      .map(filePath => {
        if (
          !filePath
            .split('')
            .reverse()
            .every((el, i) => {
              if (i === 0 && el !== ext[2]) return false
              if (i === 1 && el !== ext[1]) return false
              if (i === 2 && el !== ext[0]) return false
              return true
            })
        ) {
          //Prevents from "a thousand" warnings when the lyrics dir
          //is nested within the mp3dir or the opposite.
          if (filePath.indexOf(excDir) !== -1) return false
          //Prevent from warnings for dirs..
          //console.log(filePath)
          if (fs.lstatSync(filePath).isDirectory()) return false
          console.warn(`File: ${filePath} is not ${ext} file.`)
          return false
        }
        const obj = {type: ext}
        obj.path = filePath
        obj.fileName = path.basename(filePath)
        const splitted = obj.fileName.split(' - ')
        const withoutExt = new RegExp(`.+?(?=.${ext})`)
        obj.title = withoutExt.exec(splitted[splitted.length - 1])[0]
        obj.author = splitted[0]
        return obj
      })
      .filter(el => el)
  } else {
    return false
  }
}

export default formatData
