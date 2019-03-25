//const MAX_DISPLAYED_LENGTH = 15; // todo :move to client
//idText: String.fromCharCode(9679) , // todo:move to client
//todo ?to client
// const editCheckboxStyles = {
//     checkboxUpdateValue: styles.checked,
//     checkboxCompleteValue: styles.empty,
// };
// const entryStyles = {
//     expiredEntryStyle: 'class=expired',
//     defaultStyle: styles.empty,
// };
// const taskStatuses = {
//     completed: 'Completed',
//     incomplete: 'Incomplete',
// };
// const checkboxesNames = {
//     completeCheckbox: "completeCheckbox",
//     updateCheckbox:'updateCheckbox',
// };
//todo move to client
// static getMainFormPlaceholders() {
//     // if (isMainFormEdited === true) {
//     //     checkboxValues = editCheckboxStyles;
//     //
//     //     placeholders = {
//     //         isMainFormEdited: "true",
//     //         mainFormTaskId: mainFormTaskNumber.toString(),
//     //         taskNameBackValue: task[tasksProperties.taskName],
//     //         taskNameValue: task[tasksProperties.taskName],
//     //         taskDateValue: Utils.createDateInStandardFormat(task.taskDateValue), // CORRECT
//     //     };
//     // }
// }

//todo move to client
// static createTaskEntry(task) {
//     return {
//         taskId: task[tasksProperties.taskId],
//         taskName: task[tasksProperties.taskName],
//         taskDate: Utils.formatDateForOutput(task[tasksProperties.taskDate]),
//         taskDateValue: task[tasksProperties.taskDate],
//         taskAttachmentFileName: task[tasksProperties.taskAttachmentFileName],
//         taskDisplayedName: task[tasksProperties.taskName].substr(0, MAX_DISPLAYED_LENGTH),
//         taskAttachmentFileDisplayedName: task[tasksProperties.taskAttachmentFileName].substr(0, MAX_DISPLAYED_LENGTH),
//         taskCompletedAsString: task[tasksProperties.taskCompleted]
//             ? taskStatuses.completed
//             : taskStatuses.incomplete,
//         entryStyle:task[tasksProperties.taskExpired] === true
//             ? entryStyles.expiredEntryStyle
//             : entryStyles.defaultStyle,
//         completeButtonStyle: task[tasksProperties.taskCompleted] === true
//             ? styles.disabled
//             : styles.empty,
//         downloadButtonStyle: task[tasksProperties.taskAttachmentExists] !== true
//             ? styles.disabled
//             : styles.empty,
//     };
// }
class ClientPageConstructor{
    static getTaskTemplateUrl() { return "./views/task.ejs";}

    static renderTable(){
        let row = ejs.render( taskTemplate , ????);
    }
}

