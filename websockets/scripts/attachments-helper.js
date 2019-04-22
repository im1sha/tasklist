const fs = require ('fs');
const path = require ('path');
//
// Interaction with filesystem
//

class AttachmentsHelper {

    static rewriteFolderWithAttachment(parentDir, newDir, file) {
        let result = null;

        if (file) {

            const attachmentDir = path.join(String(parentDir), String(newDir));

            if (!fs.existsSync(attachmentDir)) {
                fs.mkdirSync(attachmentDir);
            }

            AttachmentsHelper.deleteFilesInFolder(attachmentDir);

            result = AttachmentsHelper.moveFileInFolder(file, attachmentDir);
        }

        return {
            attachmentName: result === null ? null : result.attachmentName,
            attachmentPath: result === null ? null : result.attachmentPath,
        };
    }

    static moveFileInFolder(file, attachmentDir) {
        const attachmentName = file.name;
        const attachmentPath = path.join(attachmentDir, attachmentName);

        // mv() - A function to move the file elsewhere on the server
        file.mv(attachmentPath);

        return {
            attachmentName: attachmentName,
            attachmentPath: attachmentPath,
        };
    }

    static deleteFilesInFolder(directory) {

        if (!fs.existsSync(directory)) {
            return false;
        }

        let files = fs.readdirSync(directory);

        for (const file of files) {
            fs.unlinkSync(path.join(directory, file));
        }

        return true;
    }

    static deleteFolderWithAttachment(directory) {
        if (fs.existsSync(directory)) {
            AttachmentsHelper.deleteFilesInFolder(directory);
            fs.rmdirSync(directory);
        }
    }
}

module.exports = AttachmentsHelper;