const bcrypt = require('bcrypt');

class User {

    constructor(userId, userLogin, userHash) {
        this.userId = userId;
        this.userLogin = userLogin;
        this.userHash = userHash;
    }

    getId() { return this.userId; }
    getHash() { return this.userHash; }
    getLogin() { return this.userLogin; }
    getData() {
        return {
            userId : this.getId(),
            userHash: this.getHash(),
            userLogin: this.getLogin()
        };
    }

    static calculateHash(password) {
        return bcrypt.hashSync(password, 10);
    }

    static getNewItemIndex() { return -1; }

    static hasValidProperties(obj){
        return obj.hasOwnProperty('userId')
            && obj.hasOwnProperty('userHash')
            && obj.hasOwnProperty('userLogin');
    }

    static fromObject(obj) {
        if (!User.hasValidProperties(obj)) {
            return null;
        } else {
            return new User(obj.userId, obj.userLogin, obj.userHash);
        }
    }

}

module.exports = User;
