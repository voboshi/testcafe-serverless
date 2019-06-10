import extract from 'extract-zip'

const unarchiveDir = ({ fileName, outputDir }) => {
  return new Promise((resolve, reject) => {
    extract(fileName, { dir: outputDir }, err =>
      !err ? resolve() : reject(err)
    )
  })
}

export default unarchiveDir
