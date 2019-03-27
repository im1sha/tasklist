class ClientUtils {

    //
    // Task properties
    //

    // does NOT include taskShouldUpdateAttachment
    static getTaskPropertiesNamesAsList() {
        return {
            taskId: ClientUtils.getTaskIdPropertyName(),
            taskName: ClientUtils.getTaskNamePropertyName(),
            taskDate: ClientUtils.getTaskDatePropertyName(),
            taskAttachmentFileName: ClientUtils.getTaskAttachmentFileNamePropertyName(),
            taskAttachmentExists: "taskAttachmentExists",
            taskCompleted: ClientUtils.getTaskCompletedPropertyName(),
            taskExpired: 'taskExpired', //
        };
    }

    static getTaskCompletedPropertyName() { return "taskCompleted"; }
    static getTaskAttachmentFileNamePropertyName() { return "taskAttachmentFileName"; }
    static getTaskNamePropertyName() { return "taskName"; }
    static getTaskDatePropertyName() { return "taskDate"; }
    static getTaskIdPropertyName() { return "taskId"; }
    // used when task was sent externally.
    // It is NOT stored in local object, but in an external one.
    static getTaskShouldUpdateAttachmentPropertyName() {
        return "taskShouldUpdateAttachment";
    }

    //
    //
    //

    static getStatusCodes() {
        return {
            ok: 200,
            created: 201,
            successNoContent: 204,
            badRequest: 400,
            notFound: 404,
            unprocessableEntity: 422,
        };
    }

    //
    // date formatting
    //

    // expected Date instance as parameter
    static formatDateForOutput(date) {

        const dateObject = this.getDateAsObjectOfStrings(date);

        return dateObject.day + "-" +
            dateObject.month + "-" +
            dateObject.year + " " +
            dateObject.hours + ":" +
            dateObject.minutes;
    }

    static createDateInStandardFormat(date) {

        let editedTaskDate = Utils.getDateAsObjectOfStrings(date);
        return editedTaskDate.year + '-' +
            editedTaskDate.month + '-' + editedTaskDate.day +
            'T' + editedTaskDate.hours + ':' + editedTaskDate.minutes;
    }

    static getDateAsObjectOfStrings(date) {
        const pad = "00";
        const padYear = "0000";

        let day = date.getDate().toString();
        let month = (date.getMonth() + 1).toString();
        let year = date.getFullYear().toString();
        let hours = date.getHours().toString();
        let minutes = date.getMinutes().toString();

        day = pad.substring(0, pad.length - day.length) + day;
        month = pad.substring(0, pad.length - month.length) + month;
        minutes = pad.substring(0, pad.length - minutes.length) + minutes;
        hours = pad.substring(0, pad.length - hours.length) + hours;
        year = padYear.substring(0, padYear.length - year.length) + year;

        return {
            day : day,
            month: month,
            minutes : minutes,
            hours: hours,
            year: year,
        };
    }
}

try {
    module.exports = ClientUtils;
} catch(e) {

}
