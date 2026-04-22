/**
 * Use taskItemWasSuccessful() to analyse results
 */
type TaskItem = (string | false)[]

/**
 * Use taskItemWasSuccessful() to analyse results
 */
export type AsyncTaskItem = Promise<TaskItem>

export const taskItemWasSuccessful = (taskItem: TaskItem): boolean =>
    taskItem.every(result => result !== false)
