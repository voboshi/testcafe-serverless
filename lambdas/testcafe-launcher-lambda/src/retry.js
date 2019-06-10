const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const retry = (callback, options) => async (...args) => {
  const { count, delay: ms } = options

  let error

  for (let index = 0; index < count; index++) {
    try {
      return await callback(...args)
    } catch (err) {
      console.log(`Retry ${index + 1} / ${count}. ${err.message}`)
      error = err
    }

    await delay(ms)
  }

  console.error(error)
  throw error
}

export default retry
