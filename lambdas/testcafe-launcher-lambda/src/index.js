import invokeLambda from './invoke-lambda'

const testcafeWorkerName = 'testcafe-worker-lambda'

const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const {
    fileKey: outputFileKey,
    concurrency,
    region,
    accountId,
    testPattern,
    skipJsErrors,
    skipUncaughtErrors,
    selectorTimeout,
    assertionTimeout,
    pageLoadTimeout,
    speed,
    stopOnFirstFail
  } = event

  const workerLambdaArn = `arn:aws:lambda:${region}:${accountId}:function:${testcafeWorkerName}`

  console.log('Delegating execute ', outputFileKey)

  const executionGroupId = `testcafe-execution-${Date.now()}-${Math.floor(
    Math.random() * 1000000000000
  )}`

  const invocationPromises = []
  for (let index = 0; index < concurrency; index++) {
    invocationPromises.push(
      invokeLambda({
        region,
        lambdaArn: workerLambdaArn,
        payload: {
          fileKey: outputFileKey,
          workerId: `${executionGroupId}-${index}`,
          region,
          testPattern,
          skipJsErrors,
          skipUncaughtErrors,
          selectorTimeout,
          assertionTimeout,
          pageLoadTimeout,
          speed,
          stopOnFirstFail
        }
      })
    )
  }

  return await Promise.all(invocationPromises)
}

export { handler }
