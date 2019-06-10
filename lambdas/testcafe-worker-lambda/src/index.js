import chromium from 'chrome-aws-lambda'
import createTestCafe from 'testcafe'
import stream from 'stream'
import path from 'path'
import { sync as rimraf } from 'rimraf'
import fs from 'fs'

import downloadFromS3 from './download-from-s3'
import unarchiveDir from './unarchive-dir'

const bucketName = 'testcafe-serverless-bucket'

const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const {
    fileKey,
    region,
    testPattern,
    skipJsErrors,
    skipUncaughtErrors,
    selectorTimeout,
    assertionTimeout,
    pageLoadTimeout,
    speed,
    stopOnFirstFail
  } = event

  console.log('Worker launched', JSON.stringify(event))

  let testcafe = null,
    browser = null,
    result = null
  try {
    rimraf(path.join('/tmp/*'))
    const testcafeAppArchivePath = await downloadFromS3({
      region,
      bucketName,
      fileKey
    })

    const testcafeAppDir = path.join('/tmp', `testcafe-app-${Date.now()}`)
    fs.mkdirSync(testcafeAppDir)

    await unarchiveDir({
      fileName: testcafeAppArchivePath,
      outputDir: testcafeAppDir
    })

    testcafe = await createTestCafe('localhost', 1337, 1338)
    const remoteConnection = await testcafe.createBrowserConnection()
    console.log('Testcafe server launched at', remoteConnection.url)

    const connectionDonePromise = new Promise(resolve =>
      remoteConnection.once('ready', resolve)
    )

    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    })

    console.log('Headless browser launched as', await browser.userAgent())

    await (await browser.newPage()).goto(remoteConnection.url)
    await connectionDonePromise
    console.log('Testcafe server accepted connection from headless browser')

    let resultBuffer = Buffer.from('')

    const failedCount = await testcafe
      .createRunner()
      .reporter([
        'spec',
        {
          name: 'json',
          output: new stream.Writable({
            write(chunk, _, next) {
              resultBuffer = Buffer.concat([resultBuffer, chunk])
              next()
            }
          })
        }
      ])
      .src(`${testcafeAppDir}/${testPattern}`)
      .browsers(remoteConnection)
      .run({
        skipJsErrors,
        skipUncaughtErrors,
        selectorTimeout,
        assertionTimeout,
        pageLoadTimeout,
        speed,
        stopOnFirstFail
      })

    result = JSON.parse(resultBuffer.toString('utf8'))

    console.log('Failed functional tests for', failedCount)
  } catch (error) {
    console.error('Unhandled exception ', error)

    return new Error(error)
  } finally {
    if (testcafe != null) {
      await testcafe.close()
    }

    if (browser != null) {
      await browser.close()
    }

    rimraf(path.join('/tmp/*'))
  }

  console.log(JSON.stringify(result, null, 2))

  return result
}

export { handler }
