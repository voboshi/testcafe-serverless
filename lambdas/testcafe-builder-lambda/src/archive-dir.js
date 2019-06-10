import fs from 'fs'
import archiver from 'archiver'

const archiveDir = ({ inputDirectory, outputArchive }) =>
  new Promise((resolve, reject) => {
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
