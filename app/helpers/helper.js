const moment = require("moment/moment");

module.exports={
    buildMultiMonthFilter : (months, startYear, endYear, dateField) => {
        if (!months || months.length === 0) return null;

        const ranges = months.map((month) => {
            const calendarYear = month >= 4 ? startYear : endYear;
            const start = moment({ year: calendarYear, month: month - 1, date: 1 }).toDate();
            const end   = moment(start).endOf("month").toDate();
            return { [dateField]: { $gte: start, $lte: end } };
        });

        return ranges.length === 1 ? ranges[0] : { $or: ranges };
    },

// ── Helper: parse months from query ───────────────────────
// supports single: month=4
// supports multiple: months=4,5,6
    parseMonths : (query) => {
        if (query.months) {
            return query.months.split(",").map(m => parseInt(m)).filter(Boolean);
        }
        if (query.month) {
            return [parseInt(query.month)];
        }
        return [];
    }
};
