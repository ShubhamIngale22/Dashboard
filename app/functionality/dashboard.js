const response = require("../utility/api_handler");
const chartFormatter = require("../utility/chart_formatter");
const services = require('../services/index');
const fs = require('fs');
const XLSX = require('xlsx');
const moment = require("moment/moment");
const dateHelper = require("../helpers/date_helper");

module.exports = {
    sellsInstallationsLineChart: (req, res) => {
        const type       = req.query.type        || "7days";
        const fiscalYear = req.query.fiscal_year || null;
        const month      = req.query.month ? parseInt(req.query.month) : null;

        let startDate, endDate, format, sortFormat;

        if (type === "1year") {
            startDate  = moment().subtract(1, "year").toDate();
            endDate    = null;
            format     = "%b-%Y";
            sortFormat = "%Y-%m";

        } else if (type === "30days") {
            startDate  = moment().subtract(30, "days").toDate();
            endDate    = null;
            format     = "%d-%b";
            sortFormat = "%Y-%m-%d";

        } else if (type === "custom" && fiscalYear) {
            const startYear = parseInt(fiscalYear.split("-")[0]);
            const endYear   = startYear + 1;

            if (month) {
                const calendarMonth = month <= 9 ? month + 3 : month - 9;
                const calendarYear  = month <= 9 ? startYear : endYear;
                startDate  = moment({ year: calendarYear, month: calendarMonth - 1, date: 1 }).toDate();
                endDate    = moment(startDate).endOf("month").toDate();
                format     = "%d-%b";
                sortFormat = "%Y-%m-%d";
            } else {
                startDate  = moment({ year: startYear, month: 3, date: 1 }).toDate();  // Apr 1
                endDate    = moment({ year: endYear,   month: 2, date: 31 }).toDate(); // Mar 31
                format     = "%b-%Y";
                sortFormat = "%Y-%m";
            }

        } else {
            startDate  = moment().subtract(7, "days").toDate();
            endDate    = null;
            format     = "%d-%b";
            sortFormat = "%Y-%m-%d";
        }

        // Two separate match queries — different date field names per collection
        const installationMatchQuery = endDate
            ? { installationDate: { $gte: startDate, $lte: endDate } }
            : { installationDate: { $gte: startDate } };

        const sellsMatchQuery = endDate
            ? { billingDate: { $gte: startDate, $lte: endDate } }
            : { billingDate: { $gte: startDate } };

        return services.smart_tyre_dashboard
            .sellsInstallationsLineChart(installationMatchQuery, sellsMatchQuery, format, sortFormat)
            .then((data) => {
                const lineChartData = chartFormatter.combinedLineChart(
                    data.installations,
                    data.sells
                );
                return res.json(response.JsonMsg(true, lineChartData, "Line-Chart data is fetched.", 200));
            })
            .catch((err) => {
                console.error(err);
                return res.json(response.JsonMsg(false, null, "Failed to fetch data", 500));
            });
    },

    zoneWiseInstallationsSellsPie: (req, res) => {
        const type=req.query.type;

        return services.smart_tyre_dashboard.zoneWiseInstallationsSellsPie(type).then((data)=>{

            return res.json(response.JsonMsg(true, data, "Zone-wise data is fetched.", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    dealerInstallationsSellsTable: (req, res) => {
        const now = moment();

        const yesterdayStart = now.clone().subtract(1, "day").startOf("day").toDate();
        const yesterdayEnd   = now.clone().subtract(1, "day").endOf("day").toDate();
        const lastMonthStart = now.clone().subtract(1, "month").startOf("month").toDate();
        const lastMonthEnd   = now.clone().subtract(1, "month").endOf("month").toDate();
        const fyYearStart    = dateHelper.fyYearStart();
        const todayEnd       = now.clone().endOf("day").toDate();

        const lastMonthLabel = now.clone().subtract(1, "month").format("MMM-YYYY");
        const fyYearLabel    = dateHelper.fyYearLabel();

        const yesterdayQuery    = { installationDate: { $gte: yesterdayStart, $lte: yesterdayEnd } };
        const lastMonthQuery    = { installationDate: { $gte: lastMonthStart, $lte: lastMonthEnd } };
        const fyYearQuery       = { installationDate: { $gte: fyYearStart,    $lte: todayEnd     } };

        const yesterdaySellQuery = { billingDate: { $gte: yesterdayStart, $lte: yesterdayEnd } };
        const lastMonthSellQuery = { billingDate: { $gte: lastMonthStart, $lte: lastMonthEnd } };
        const fyYearSellQuery    = { billingDate: { $gte: fyYearStart,    $lte: todayEnd     } };

        return Promise.all([
            services.smart_tyre_dashboard.getInstallationCount(yesterdayQuery),
            services.smart_tyre_dashboard.getInstallationCount(lastMonthQuery),
            services.smart_tyre_dashboard.getInstallationCount(fyYearQuery),
            services.smart_tyre_dashboard.getSellsCount(yesterdaySellQuery),
            services.smart_tyre_dashboard.getSellsCount(lastMonthSellQuery),
            services.smart_tyre_dashboard.getSellsCount(fyYearSellQuery),
        ]).then(([iYesterday, iLastMonth, iFyYear, sYesterday, sLastMonth, sFyYear]) => {
            const data = {
                labels: {
                    lastMonthLabel,
                    fyYearLabel
                },
                installations: {
                    yesterday: iYesterday[0]?.count ?? 0,
                    lastMonth: iLastMonth[0]?.count ?? 0,
                    fyYear:    iFyYear[0]?.count    ?? 0
                },
                sells: {
                    yesterday: sYesterday[0]?.count ?? 0,
                    lastMonth: sLastMonth[0]?.count ?? 0,
                    fyYear:    sFyYear[0]?.count    ?? 0
                }
            };
            return res.json(response.JsonMsg(true, data, "Dealer Installations and sells data is fetched.", 200));
        }).catch((err) => {
            console.error(err);
            return res.json(response.JsonMsg(false, null, "Failed to fetch data", 500));
        });
    },

    getTop5SmartTyreInstallation: (req, res) => {
        let filter = req.query.filter;
        let type = req.query.type;
        let startDate,endDate;
        let query = {customerCode: {$ne: null}};
        let groupId = {};
        let projection = {};
        let limit;

        if(filter === "Dealers"){
            query = {customerCode: {$ne: null}};
            groupId = { customerCode: "$customerCode", dealerShopName: "$dealerShopName" };
            projection = { customerCode: "$_id.customerCode", dealerShopName: "$_id.dealerShopName" };
            limit=6;
        }else if(filter === "Zones"){
            query ={zone: { $ne: null }, customerCode: {$ne: null}};
            groupId = "$zone";
            projection =  { zone: "$_id" };
            limit=6;
        }else if(filter === "Regions"){
            query ={regionName: { $ne: null }, customerCode: {$ne: null}};
            groupId = "$regionName";
            projection =  { regionName: "$_id" };
            limit=5;
        }else if(filter === "MakeModels"){
            query ={manufacturerName: { $ne: null }, vehicleModelNo: { $ne: null }, customerCode: {$ne: null}};
            groupId = { make: "$manufacturerName", model: "$vehicleModelNo" };
            projection ={ make: "$_id.make", model: "$_id.model" };
            limit=5;
        }

        if (type === "monthly") {
            startDate = moment().subtract(1, "month").startOf("month").toDate();
            endDate = moment().subtract(1, "month").endOf("month").toDate();
            Object.assign(query, {installationDate: {$gte: startDate, $lte: endDate}});
        } else if (type === "Finance Year") {
            startDate = dateHelper.fyYearStart();
            endDate = moment().endOf("day").toDate();
            Object.assign(query, {installationDate: { $gte: startDate, $lte: endDate }});
        }
        return services.smart_tyre_dashboard.getTop5SmartTyreInstallation(query,groupId, projection,limit).then((data)=>{
            return res.json(response.JsonMsg(true,data, "Dealer Installations Data for top 5 regions", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    uploadDealerSellExcel: (req, res) => {
        const deleteFile = (filePath) => {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        };
        if (!req.file) {
            return res.json(
                response.JsonMsg(false, null, "No file uploaded", 400)
            );
        }

        let rows;

        try {
            const workbook = XLSX.readFile(req.file.path);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(sheet);

            if (!rows.length) {
                deleteFile(req.file.path);
                return res.json(
                    response.JsonMsg(false, null, "Empty file", 400)
                );
            }
        } catch (err) {
            deleteFile(req.file.path);
            return res.json(
                response.JsonMsg(false, null, "Invalid Excel file", 400)
            );
        }

        return services.smart_tyre_dashboard.uploadDealerSellExcel(rows)
            .then(result => {
                deleteFile(req.file.path);
                return res.json(
                    response.JsonMsg(true, result.length, "Excel uploaded successfully", 200)
                );
            })
            .catch(err => {
                deleteFile(req.file.path);
                return res.json(
                    response.JsonMsg(false, null, err.message, 400)
                );
            });
    }
}
