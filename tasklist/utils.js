
const fs = require('fs');
const path = require('path');


class Utils {

    static rewriteFolderWithAttachment(parentDir, newDir, file) {
        let result = null;

        if (file) {

            const attachmentDir = path.join(String(parentDir), String(newDir));

            if (!fs.existsSync(attachmentDir)){
                fs.mkdirSync(attachmentDir);
            }

            Utils.deleteFilesInFolder(attachmentDir);

            result = Utils.moveFileInFolder(file, attachmentDir);
        }

        return {
            attachmentName: result === null ? null : result.attachmentName,
            attachmentPath: result === null ? null : result.attachmentPath,
        };
    }

    static moveFileInFolder(file, attachmentDir){
        const attachmentName = file.name;
        const attachmentPath = path.join(attachmentDir, attachmentName);

        // mv() - A function to move the file elsewhere on your server
        file.mv(attachmentPath);

        return {
            attachmentName: attachmentName,
            attachmentPath: attachmentPath,
        };
    }

    static deleteFilesInFolder(directory) {

        if (!fs.existsSync(directory)){
            return false;
        }

        let files = fs.readdirSync(directory);

        for (const file of files) {
            fs.unlinkSync(path.join(directory, file));
        }

        return true;
    }

    static deleteFolderWithAttachment(directory){
        Utils.deleteFilesInFolder(directory);
        fs.rmdirSync(directory);
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

    static isDate(date){
        return date instanceof Date
            && !isNaN(date.valueOf())
    }
}

module.exports = Utils;