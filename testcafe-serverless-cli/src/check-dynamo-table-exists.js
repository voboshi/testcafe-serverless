import DynamoDB from 'aws-sdk/clients/dynamodb'

const checkDynamoTableExists = async ({ region, tableName }, level = 0) => {
  const database = new DynamoDB({ region })

  if (level === 0) {
    console.log(`check dynamo table exists "${tableName}" started`)
  } else if (level % 20 === 0) {
    console.log(`check dynamo table exists "${tableName}" still in progress`)
  }

  try {
    const tableInfo = await database
      .describeTable({ TableName: tableName })
      .promise()

    const tableStatus = tableInfo.Table.TableStatus

    if (tableStatus === 'ACTIVE') {
      console.log(`check dynamo table exists "${tableName}" done with true`)
      return true
    }

    return await checkDynamoTableExists({ region, tableName }, level + 1)
  } catch (error) {}

  console.log(`check dynamo table exists "${tableName}" done with false`)
  return false
}

export default checkDynamoTableExists
