const fs = require ('fs');
const random = require ('secure-random');
const jwt = require ('jsonwebtoken');
// const User = require ('./user');

const MINUTE_TO_SECONDS = 60;

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

    getJwtTokenExpirationTimeInMinutes() { return 60; }

    // userData is
    //  {
    //      userId ,
    //      userHash,
    //      userLogin
    //  }
    createJwtToken(userData) {
        return jwt.sign(userData, this.getKey(), {
            expiresIn: MINUTE_TO_SECONDS *  this.getJwtTokenExpirationTimeInMinutes()
        });
    }

    setCookie(res, userData) {
        res.cookie(
            this.getJwtTokenName(),
            this.createJwtToken(userData),
            {
                httpOnly: true,
                maxAge: MINUTE_TO_SECONDS * this.getJwtTokenExpirationTimeInMinutes()  //<max-age-in-seconds>
            }
        );
    }

    deleteCookie(res) {
        res.cookie(
            this.getJwtTokenName(),
            "",
            {httpOnly: true, maxAge: -1},
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


