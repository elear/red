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
      ([_rfcNumber, uploadResults]) => !taskItemWasSkipped(uploadResults) || !taskItemWasSuccessful(uploadResults)
    )
    .sort((a, b) => a[0] - b[0])

  const hasExceptions = exceptions.length > 0
  const hasUploadResultErrors = uploadResultsWithErrors.length > 0

  if (hasExceptions || hasUploadResultErrors) {
    console.error(`[${filename}] finished with ${[
      hasExceptions ? 'exceptions thrown' : undefined,
      hasUploadResultErrors ? 'upload errors' : undefined,
    ].filter(Boolean).join(', ')}.`)

    if (hasExceptions) {
      console.error(...stringifyExceptions(exceptions))
    }

    if (hasUploadResultErrors) {
      console.error(
        uploadResultsWithErrors
          .map(
            result => `RFC ${result[0]}: ${result[1]
              .map((taskItem, index) => taskItem === false ? index : undefined)
              .filter(maybeTaskItemIndex => maybeTaskItemIndex !== undefined)
              .join(', ')}`)
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