const fs = require ('fs');
const random = require ('secure-random');
const jwt = require ('jsonwebtoken');
// const User = require ('./user');

let key = '';

class SafetyWorker {

    constructor(userWorker){
        this.userWorker = userWorker;
        this.initializeKey();
    }

    getKey() { return key; }

    getKeyPath() {  return 'private.dat'; }

    initializeKey() {
        if (fs.existsSync(this.getKeyPath())) {
            key = fs.readFileSync(this.getKeyPath());
        } else {
            key = random(512, { type: 'Buffer' }).toString('hex');
            fs.writeFileSync(this.getKeyPath(), this.getKey());
        }
    }

    getJwtTokenName() { return 'token'; }

    getJwtTokenExpirationTimeInSeconds() { return 1000000; }

    // userData is
    //  {
    //      userId ,
    //      userHash,
    //      userLogin
    //  }
    createJwtToken(userData) {
        return jwt.sign(userData, this.getKey(), {
            expiresIn: this.getJwtTokenExpirationTimeInSeconds()
        });
    }

    setCookie(res, userData) {
        res.cookie(
            this.getJwtTokenName(),
            this.createJwtToken(userData),
            {httpOnly: true, maxAge: this.getJwtTokenExpirationTimeInSeconds()}
        );
    }

    deleteCookie(res) {
        res.cookie(
            this.getJwtTokenName(), "", {httpOnly: true, maxAge: -1}
        );
    }

    isJwtTokenValid(token) {
        const decoded = this.getUserDataFromJwtToken(token);
        if (decoded === null) {
            return false;
        } else {
            const login = decoded.userLogin;
            const hash = decoded.userHash;
            return login && hash
                ? this.userWorker.getUserHashByLogin(login) === hash
                : false;
        }
    }

    getUserDataFromJwtToken(token) {
        try {
            return jwt.verify(token, this.getKey());
        } catch {
            return null;
        }
    }

    getJwtTokenFromCookie(cookies) {
        return cookies[this.getJwtTokenName()];
    }
}


module.exports = SafetyWorker;


