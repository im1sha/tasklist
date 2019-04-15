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
        return path.join(this.getUsersDirectory(), 'users.dat');
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
    getUserIdByLogin(login) {
        for (let user of this.users) {
            if (user.getLogin() === login) { return user.getId(); }
        }
        return null;
    }
    getUserDataByLogin(login) {
        for (let user of this.users) {
            if (user.getLogin() === login) { return user.getData(); }
        }
        return null;
    }

    getNewItemIndex(){
        return (this.users === null)
            ? 0
            : this.users.length;
    }

    /// returns user's data
    checkPassword(login, password) {
        if (this.users[ this.getUserIdByLogin(login) ].checkPassword(password)) {
            return this.getUserDataByLogin(login);
        }
        return null;
    }

    addUser(login, password) {
        const id = this.getNewItemIndex();
        this.users[id] = new User(id, login, User.calculateHash(password));
        return this.getUserDataByLogin(login);
    }
}


module.exports = UserWorker;
