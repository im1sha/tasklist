const fs = require ('fs');
const random = require ('secure-random');
const jwt = require ('jsonwebtoken');


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

    getJwtTokenExpirationTimeInSeconds() { return 60 * 60 * 12;} // 12h

    // userData is
    //  {
    //      userId ,
    //      userHash,
    //      serLogin
    //  }
    createJwtToken(userData) {
        return jwt.sign(JSON.parse(JSON.stringify(userData)), this.getKey(),
            { expiresIn: this.getJwtTokenExpirationTimeInSeconds() }
            );
    }

    setCookie(cookie, userData) {
        cookie(this.getJwtTokenName(),
            this.createJwtToken(userData),
            { httpOnly: true, maxAge: this.getJwtTokenExpirationTimeInSeconds() }
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

    getTokenFromRequest(req) {
        return req.cookies[cookieName];
    }
}


module.exports = SafetyWorker;


