

class Utils {

    static isObjectEmpty(obj) {
        return (Object.entries(obj).length === 0) && (obj.constructor === Object);
    }

    static getDateAsObjectOfStrings(date) {
        const pad = "00";
        const padYear = "0000";

        let day = date.getDate().toString();
        let month = (date.getMonth() + 1).toString();
        let year = date.getFullYear().toString();
        let hours = date.getHours().toString();
        let minutes = date.getMinutes().toString();

        day = pad.substring(0, pad.length - day.length) + day;
        month = pad.substring(0, pad.length - month.length) + month;
        minutes = pad.substring(0, pad.length - minutes.length) + minutes;
        hours = pad.substring(0, pad.length - hours.length) + hours;
        year = padYear.substring(0, padYear.length - year.length) + year;

        return {
            day : day,
            month: month,
            minutes : minutes,
            hours: hours,
            year: year,
        };
    }

    // expected Date instance as parameter
    static formatDateForOutput(date) {

        const dateObject = this.getDateAsObjectOfStrings(date);

        return dateObject.day + "-" +
            dateObject.month + "-" +
            dateObject.year + " " +
            dateObject.hours + ":" +
            dateObject.minutes;
    }
}

module.exports = Utils;