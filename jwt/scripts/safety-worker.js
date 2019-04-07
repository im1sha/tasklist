const fs = require ('fs');
const random = require ('secure-random');


let key = '';

class SafetyWorker {

    constructor(){
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
}


module.exports = SafetyWorker;


