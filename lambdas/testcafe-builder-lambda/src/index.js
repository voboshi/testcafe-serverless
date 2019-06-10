import childProcess from 'child_process'
import path from 'path'
import fs from 'fs'
import { sync as rimraf } from 'rimraf'

import downloadFromS3 from './download-from-s3'
import archiveDir from './archive-dir'
import unarchiveDir from './unarchive-dir'
import uploadToS3 from './upload-to-s3'
import dropOnS3 from './drop-on-s3'

const bucketName = 'testcafe-serverless-bucket'

const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  const { fileKey: inputFileKey, region } = event

  rimraf(path.join('/tmp/*'))

  console.log('Get archive', inputFileKey)

  const testcafeAppSourceArchive = await downloadFromS3({
    region,
    bucketName,
    fileKey: inputFileKey
  })

  console.log('Archive downloaded at ', testcafeAppSourceArchive)

  const testcafeAppDir = path.join('/tmp', `testcafe-app-dir-${Date.now()}`)
  fs.mkdirSync(testcafeAppDir)

  await unarchiveDir({
    fileName: testcafeAppSourceArchive,
    outputDir: testcafeAppDir
  })

  console.log('Archive unzipped at ', testcafeAppDir)

  const originalHome = process.env.HOME
  if (fs.existsSync('/tmp')) {
    process.env.HOME = '/tmp'
  }

  await dropOnS3({
    region,
    bucketName,
    fileKey: inputFileKey
  })

  console.log('Input archive dropped from S3')

  const installBuffer = childProcess.execSync('npm install --only=production', {
    cwd: testcafeAppDir
  })

  console.log('Installed at ', testcafeAppDir)

  process.env.HOME = originalHome

  const testcafeAppInstalledArchive = path.join(
    '/tmp',
    `testcafe-app-arch-${Date.now()}`
  )

  await archiveDir({
    inputDirectory: testcafeAppDir,
    outputArchive: testcafeAppInstalledArchive
  })

  console.log('Installed archive zipped at ', testcafeAppInstalledArchive)

  const outputFileKey = `testcafe-app-${Date.now()}-${Math.floor(
    Math.random() * 1000000000000
  )}`

  await uploadToS3({
    file: testcafeAppInstalledArchive,
    region,
    bucketName,
    fileKey: outputFileKey
  })

  rimraf(path.join('/tmp/*'))

  console.log('Saved to ', outputFileKey)

  return {
    installLog: installBuffer.toString('utf8'),
    outputFileKey
  }
}

export { handler }
