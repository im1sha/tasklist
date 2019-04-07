

//  global.usersPath = '.' + path.sep + path.join('users', 'users.dat');

//     global.updateUsersStorage = function () {
//         fs.writeFileSync(usersPath, userSerializer.serializeUserArray(users));
//     };
//
//     if (!fs.existsSync(tasksDirectory)) {
//     fs.mkdirSync(tasksDirectory);
// }
//
// if (!fs.existsSync(attachmentsDirectory)) {
//     fs.mkdirSync(attachmentsDirectory);
// }
//
// if (fs.existsSync(tasksPath)) {
//     global.tasks = taskSerializer.deserializeTaskArray(fs.readFileSync(tasksPath));
// } else {
//     global.tasks = [];
// }
//
// if (!fs.existsSync(path.dirname(usersPath))) {
//     fs.mkdirSync(path.dirname(usersPath));
// }
//
// if (fs.existsSync(usersPath)) {
//     global.users = userSerializer.deserializeUserArray(fs.readFileSync(usersPath));
// } else {
//     global.users = [];
// }
//
// updateTasksStorage();
// updateUsersStorage();
//
// const keyPath = 'private.key';
// if (fs.existsSync(keyPath)) {
//     global.privateKey = fs.readFileSync(keyPath);
// } else {
//     global.privateKey = secureRandom(256, { type: 'Buffer' }).toString('hex');
//
//     fs.writeFileSync(keyPath, privateKey);
// }
//
// global.cookieName = 'token';
// global.tokenExpirationTime = 60 * 60 * 1000;

const path = require('path');
const User = require('.' + path.sep + 'user');
const fs = require ('fs');

class UserWorker {

    constructor() {
        this.users = [];
        this.initializeJsonStorage();
    }

    getUsersDirectory() {
        return './users';
    }

    getStoragePath(){
        return path.join(this.getUsersDirectory(), './users.dat');
    }

    serialize(taskArray) {
        return JSON.stringify(taskArray);
    }

    deserialize(jsonString) {
        const parsedData = JSON.parse(jsonString);
        const users = [];
        if (Array.isArray(parsedData)) {
            parsedData.forEach(item => users.push(User.fromObject(item)));
        }
        return users;
    }

    updateJsonStorage() {
        fs.writeFileSync(this.getStoragePath(), this.serialize(this.users));
    }

    initializeJsonStorage() {
        if (!fs.existsSync(this.getTasksDirectory())) {
            fs.mkdirSync(this.getTasksDirectory());
        }
        if (fs.existsSync(this.getTasksPath())) {
            this.tasks = this.deserialize(fs.readFileSync(this.getTasksPath()));
        }
        this.updateJsonStorage();
    }


    getTasksData() {
        const tasks = [];
        for (let value of this.tasks) {
            if (value) {
                tasks.push(value.getData());
            }
        }
        return tasks;
    }

}


module.exports = UserWorker;
