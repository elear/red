/**
 * Use taskItemWasSuccessful() to analyse results
 */
export type TaskItem = (string | false)[]

/**
 * Use taskItemWasSuccessful() to analyse results
 */
export type AsyncTaskItem = Promise<TaskItem>

export const taskItemWasSuccessful = (taskItem: TaskItem): boolean =>
  taskItem.every(result => result !== false)


export type UploadResult = [
  number, // rfc number
  TaskItem
]

type ProcessExitFromUploadResultsProps = {
  filename: string
  uploadResults: UploadResult[]
  errors: any[]
}

export const processExitFromUploadResults = ({ filename, uploadResults, errors }: ProcessExitFromUploadResultsProps): void => {
  if (errors.length > 0) {
    console.log(`[${filename}] finished with exceptions thrown`)
    console.error(errors)
    process.exit(1)
  } else {
    const uploadResultsWithErrors = uploadResults
      .filter(
        ([_rfcNumber, uploadResults]) => !taskItemWasSuccessful(uploadResults)
      )

    if (uploadResultsWithErrors.length > 0) {
      console.error(
        `[${filename}] finished with error(s)`,
        uploadResultsWithErrors
          .map(
            result => `RFC ${result[0]}: ${result[1]
              .map((taskItem, index) => taskItem === false ? index : undefined)
              .filter(maybeTaskItemIndex => maybeTaskItemIndex !== undefined)
              .join(', ')}`)
          .join('. '))

      process.exit(1)
    } else {
      console.log(`[${filename}] finished successfully`)
      process.exit(0)
    }
  }
}