import minimist from 'minimist'

import { awsLogin, init, run } from './index'
import coerce, {
  PositiveInteger,
  PositiveDouble,
  FileGlobPattern
} from './coerce'

const main = async () => {
  try {
    const {
      accessKeyId,
      secretAccessKey,
      region = 'eu-west-1',
      testcafeDir,
      concurrency,
      testPattern = '**/*.test.js',
      skipJsErrors = 'false',
      skipUncaughtErrors = 'false',
      selectorTimeout = '10000',
      assertionTimeout = '3000',
      pageLoadTimeout = '3000',
      speed = '1',
      stopOnFirstFail = 'false',
      _: [command]
    } = minimist(process.argv.slice(2))

    switch (command) {
      case 'init': {
        const accountId = await awsLogin({ accessKeyId, secretAccessKey })
        await init({ region, accountId })
        break
      }
      case 'run': {
        const accountId = await awsLogin({ accessKeyId, secretAccessKey })
        await run({
          region,
          accountId,
          testcafeDir,
          concurrency,
          testPattern: coerce(testPattern, FileGlobPattern, {
            baseDir: testcafeDir
          }),
          skipJsErrors: coerce(skipJsErrors, Boolean),
          skipUncaughtErrors: coerce(skipUncaughtErrors, Boolean),
          selectorTimeout: coerce(selectorTimeout, PositiveInteger),
          assertionTimeout: coerce(assertionTimeout, PositiveInteger),
          pageLoadTimeout: coerce(pageLoadTimeout, PositiveInteger),
          speed: coerce(speed, PositiveDouble, { from: 0.01, to: 1.0 }),
          stopOnFirstFail: coerce(stopOnFirstFail, Boolean)
        })

        break
      }
      default: {
        throw `Unknown command "${command}"`
      }
    }
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

export default main
