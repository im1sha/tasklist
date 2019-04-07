
const fs = require ('fs');

class StorageHelper {

    static serialize(array) {
        return JSON.stringify(array);
    }

    static deserialize(jsonString, parserFunction) {

        const parsedData = JSON.parse(jsonString);
        const array = [];

        if (Array.isArray(parsedData)) {
            parsedData.forEach(item => array.push(parserFunction(item)));
        }

        return array;
    }

    static updateJsonStorage(filePath, content) {
        fs.writeFileSync(filePath, this.serialize(content));
    }

    // Reads and updates storage file
    // param:       directory is String('<dir>')
    // param:       filePath is String('<dir>\<file>')
    // returns:     filePath's content
    static initializeJsonStorage(directory, filePath, parserFunction) {

        let content = [];

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
        if (fs.existsSync(filePath)) {
            content = this.deserialize(fs.readFileSync(filePath), parserFunction);
        }
        StorageHelper.updateJsonStorage(filePath, content);

        return content;
    }

}

module.exports = StorageHelper;