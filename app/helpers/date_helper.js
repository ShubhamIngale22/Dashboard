const moment=require('moment-timezone');

const TIMEZONE="Asia/Kolkata";

module.exports={
    nowIST:()=>{
        return moment().tz(TIMEZONE);
    },

    formatIST:(date,format="DD-MM-YYYY hh:mm:ss A")=>{
        return moment(date).tz(TIMEZONE).format(format);
    },

    addMinutes:(minutes)=>{
        return moment().add(minutes,"minutes").toDate();
    },

    isExpired:(date)=>{
        return moment().isAfter(date);
    },

    toISTDate:(date)=>{
        return moment(date).tz(TIMEZONE).toDate();
    },

    convertExcelDate : (date) => {
        if (!date) return null;

        if (typeof date === "string") {
            const parts = date.split('-'); // DD-MM-YYYY
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
        return new Date(date);
    }

};
