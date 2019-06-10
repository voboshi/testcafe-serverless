import fs from 'fs'
import archiver from 'archiver'
import { sync as rimraf } from 'rimraf'
import path from 'path'

const clean = directory => {
  rimraf(path.join(directory, 'node_modules'))
  rimraf(path.join(directory, 'package-lock.json'))
}

const archiveDir = ({ inputDirectory, outputArchive }) =>
  new Promise((resolve, reject) => {
    clean(inputDirectory)

    const output = fs.createWriteStream(outputArchive)

    const archive = archiver('zip', {
      zlib: {
        level: 9
      }
    })

    output.on('close', resolve)
    archive.on('error', reject)

    archive.pipe(output)
    archive.directory(inputDirectory, false)
    archive.finalize()
  })

export default archiveDir
