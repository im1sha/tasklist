const fs = require('fs');
const path = require('path');

class Utils {

    //
    // interact with filesystem
    //

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
        if (fs.existsSync(directory)) {
            Utils.deleteFilesInFolder(directory);
            fs.rmdirSync(directory);
        }
    }

    //
    // parsing
    //

    static isDate(date){
        return date instanceof Date
            && !isNaN(date.valueOf())
    }

    static isPositiveInt(any) {
        if(any === undefined || any === null || any === '') {
            return false;
        }
        return isFinite(Number(any)) && Utils.isNumberPositiveInteger(any);
    }

    static isNumberInteger(number) {
        return number % 1 === 0;
    }

    static isNumberPositiveInteger(number) {
        return Utils.isNumberInteger(number) && (number > 0);
    }
}

module.exports = Utils;