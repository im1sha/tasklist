let Task = require('./task');

function serialize(taskArray) {
    return JSON.stringify(taskArray);
}

function deserialize(jsonString) {
    const deserialized = JSON.parse(jsonString);
    const taskArray = [];

    if (Array.isArray(deserialized)) {
        deserialized.forEach(function (element) {
            let task = Task.transformToTask(element);
            if (task != null) {
                taskArray.push(task);
            }
        });
    }

    return taskArray;
}

module.exports = {
    serializeTaskArray: serialize,
    deserializeTaskArray: deserialize
};