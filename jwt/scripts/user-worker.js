const path = require('path');
const User = require('./user');
const StorageHelper = require ('./storage-helper');

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

    updateJsonStorage() {
        StorageHelper.updateJsonStorage(this.getStoragePath(), this.users);
    }

    initializeJsonStorage() {
        this.users = StorageHelper.initializeJsonStorage(
            this.getUsersDirectory(),
            this.getStoragePath(),
            User.fromObject // callback
        );
    }

    getUserHashByLogin(login) {
        for (let user of this.users) {
            if (user.getLogin() === login) { return user.getHash(); }
        }
        return null;
    }

    getUsersData() {
        const tasks = [];
        for (let value of this.users) {
            if (value) {
                tasks.push(value.getData());
            }
        }
        return tasks;
    }
}


module.exports = UserWorker;
