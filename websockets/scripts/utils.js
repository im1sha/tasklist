class Utils {
    //
    // Parsing utils
    //

    static isDate(date){
        return date instanceof Date
            && !isNaN(date.valueOf())
    }

    static isPositiveInt(any) {
        if(any === undefined || any === null || any === '') {
            return false;
        }
        return isFinite(Number(any)) && Utils.isNumberPositiveInteger(any);
    }

    static isNumberInteger(number) {
        return number % 1 === 0;
    }

    static isNumberPositiveInteger(number) {
        return Utils.isNumberInteger(number) && (number > 0);
    }
}

module.exports = Utils;

