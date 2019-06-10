import path from 'path'
import { sync as find } from 'glob'

export class PositiveInteger extends Number {}
export class PositiveDouble extends Number {}
export class FileGlobPattern extends String {}

const coerce = (value, type, options) => {
  switch (type) {
    case PositiveInteger: {
      const result = +value
      if (Number.isInteger(result) && result >= 0) {
        return result
      } else {
        throw new Error(`Wrong coerce: ${value} must be positive integer`)
      }
    }

    case PositiveDouble: {
      const { from, to } = options

      const result = +value
      if (!isNaN(result) && result >= from && result <= to) {
        return result
      } else {
        throw new Error(
          `Wrong coerce: ${value} must be double from ${from} to ${to}`
        )
      }
    }

    case Boolean: {
      if (value === 'true') {
        return true
      } else if (value === 'false') {
        return false
      } else {
        throw new Error(`Wrong coerce: ${value} must be true or false`)
      }
    }

    case FileGlobPattern: {
      const { baseDir } = options

      let foundFiles = []
      try {
        foundFiles = find(path.join(baseDir, value))
      } catch (err) {}

      if (foundFiles.length === 0) {
        throw new Error(
          `Wrong coerce: ${value} must be valid glob pattern and match more than zero files`
        )
      }

      return String(value)
    }

    default: {
      throw new Error('Wrong coerce type')
    }
  }
}

export default coerce
