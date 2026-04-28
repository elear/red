import { PromisePoolError } from "@supercharge/promise-pool"


/**
 * Use taskItemWasSuccessful() and taskItemWasSkipped() to analyse results
 */
export type TaskItem = (string | false)[]

/**
 * Use taskItemWasSuccessful() and taskItemWasSkipped() to analyse results
 */
export type AsyncTaskItem = Promise<TaskItem>

export const taskItemWasSuccessful = (taskItem: TaskItem): boolean =>
  taskItem.length > 0 && taskItem.every(result => result !== false)

export const taskItemWasSkipped = (taskItem: TaskItem): boolean =>
  taskItem.length === 0

export type UploadResult = [
  number, // rfc number
  TaskItem
]

type ProcessExitFromUploadResultsProps = {
  filename: string
  uploadResults: UploadResult[]
  exceptions: any[]
}

export const processExitFromUploadResults = ({ filename, uploadResults, exceptions }: ProcessExitFromUploadResultsProps): void => {
  const uploadResultsWithErrors = uploadResults
    .filter(
      ([_rfcNumber, taskItem]) => {
        if (taskItemWasSkipped(taskItem)) {
          return false
        }
        return !taskItemWasSuccessful(taskItem)
      }
    )
    .sort((a, b) => a[0] - b[0])

  const hasExceptions = exceptions.length > 0
  const hasErrors = uploadResultsWithErrors.length > 0

  if (hasExceptions || hasErrors) {
    console.error(`[${filename}] finished with ${[
      hasExceptions ? 'exceptions thrown' : undefined,
      hasErrors ? 'errors' : undefined,
    ].filter(Boolean).join(', ')}.`)

    if (hasExceptions) {
      console.error(...stringifyExceptions(exceptions))
    }

    if (hasErrors) {
      console.error(
        uploadResultsWithErrors
          .map(
            ([rfcNumber, taskItem]) => {
              return `RFC ${rfcNumber}: ${stringifyTaskItemErrors(taskItem)}`
            })
          .join('. '))
    }

    process.exit(1)
  } else {
    console.log(`[${filename}] finished successfully`)
    process.exit(0)
  }
}

const stringifyExceptions = (exceptions: unknown[]): string[] => {
  return exceptions.flatMap((exception): string[] => {
    if (exception instanceof PromisePoolError) {
      const { item, name, raw } = exception
      if (raw instanceof AggregateError) {
        return [
          item,
          name,
          ...raw.errors.map((error) => String(error))
        ]
      }
    } else if (exception instanceof Error) {
      return [String(exception)]
    }
    return [String(exception)]
  })
}

/**
 * stringifies and returns indexes of errors
 */
const stringifyTaskItemErrors = (taskItem: TaskItem): string => {
  if (taskItemWasSuccessful(taskItem)) {
    const errorTitle = 'stringifyTaskItemErrors should only receive a task with errors.'
    console.error(errorTitle, JSON.stringify(taskItem))
    throw Error(errorTitle)
  }

  return taskItem
    .map((job, index) => job === false ? index : undefined)
    .filter((index) => index !== undefined)
    .join(', ')
}
