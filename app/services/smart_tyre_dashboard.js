const model = require('../models/models');
const moment = require("moment");
const smart_tyre_dashboard = require("../query-provider/smart_tyre_dashboard");
const dateHelper=require('../helpers/date_helper');

module.exports= {
    sellsInstallationsLineChart: (type) => {
        let startDate;
        let format;
        let sortFormat;

        if (type === "1year") {
            startDate = moment().subtract(1, "year").toDate();
            format = "%b-%Y";
            sortFormat="%Y-%m";
        } else if (type === "30days") {
            startDate = moment().subtract(30, "days").toDate();
            format = "%d-%b";
            sortFormat="%Y-%m-%d";
        } else {
            startDate = moment().subtract(7, "day").toDate();
            format = "%d-%b";
            sortFormat="%Y-%m-%d";
        }

        const installationsPromise=model.dealerInstallation.aggregate(
            smart_tyre_dashboard.getLineChartDealerInstallations(startDate, format,sortFormat)
        );

        const sellsPromise=model.dealerSell.aggregate(
            smart_tyre_dashboard.getLineChartDealerSells(startDate, format,sortFormat)
        );

        return Promise.all([installationsPromise,sellsPromise]).then(([installations,sells])=>{
            return {
                installations, sells
            }
        }).catch((err)=>{
            return Promise.reject(err);
        })
    },

    zoneWiseInstallationsSellsPie: (type = "monthly") => {

        let startDate, endDate;

        if (type === "yearly") {
            startDate=dateHelper.fyYearStart();
            endDate = moment().endOf("day").toDate();
        } else {
            startDate = moment().subtract(1, "month").startOf("month").toDate();
            endDate = moment().subtract(1, "month").endOf("month").toDate();
        }

        const installationsPromise=model.dealerInstallation.aggregate(
            smart_tyre_dashboard.getZoneWiseDealerInstallation(startDate,endDate)
        );

        const sellsPromise=model.dealerSell.aggregate(
            smart_tyre_dashboard.getZoneWiseDealerSells(startDate,endDate)
        );

        const lastMonthLabel=moment().subtract(1,"month").format("MMM-YYYY");
        const fyYearLabel=dateHelper.fyYearLabel();

        return Promise.all([installationsPromise,sellsPromise]).then(([installations,sells])=>{
            return {
                labels:{
                    lastMonthLabel:lastMonthLabel,
                    fyYearLabel:fyYearLabel
                },
                installations,
                sells
            }
        }).catch((err)=>{
            return Promise.reject(err);
        })
    },

    getInstallationCount: (query) => {
        return model.dealerInstallation.aggregate(
            smart_tyre_dashboard.getInstallationCount(query)
        );
    },

    getSellsCount: (query) => {
        return model.dealerSell.aggregate(
            smart_tyre_dashboard.getSellsCount(query)
        );
    },

    getTop5SmartTyreInstallation: (query,groupId, projection) => {
        return model.dealerInstallation.aggregate(smart_tyre_dashboard.getTop5SmartTyreInstallation(query,groupId, projection)).then(result => {
            return result;
        }).catch(err => {
            console.error(" top5DealerInstallations Service error is :", err);
            throw err;
        });
    },

    uploadDealerSellExcel: (rows) => {

        const cleanedRows = rows.map(row => {
            const newRow = {};
            Object.keys(row).forEach(key => {
                newRow[key.trim()] = row[key];
            });
            return newRow;
        });
        const formattedData = cleanedRows.map(row => ({
            plant: row.plant?.toString().trim(),
            billingDate: dateHelper.convertExcelDate(row.billingDate),
            sensorType: row.sensorType,
            productCode: row.productCode,
            productDesc: row.productDesc,
            quantity: Number(row.Quantity || 0),
            customerCode: row.customerCode?.toString(),
            dealerShopName: row.dealerShopName,
            districtName: row.districtName,
            stateName: row.stateName,
            cityName: row.cityName,
            territoryCode: row.territoryCode?.toString(),
            territoryName: row.territoryName,
            zone: row.zone,
            regionName: row.regionName
        }));
        return model.dealerSell.insertMany(formattedData, {ordered: false});
    }

}
