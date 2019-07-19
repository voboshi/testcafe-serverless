import Lambda from 'aws-sdk/clients/lambda'
import { temporaryErrors } from './constants'

const deleteFunctionConcurrency = async ({ region, functionName }) => {
  const lambda = new Lambda({ region })
  console.log(`delete function "${functionName}" started`)
  while (true) {
    try {
      await lambda
        .deleteFunctionConcurrency({
          FunctionName: functionName
        })
        .promise()

      break
    } catch (error) {
      if (temporaryErrors.includes(error.code)) {
        continue
      }
      console.log(`delete function "${functionName}" failed`)
      throw error
    }
  }
  console.log(`delete function "${functionName}" succeeded`)
}

export default deleteFunctionConcurrency
