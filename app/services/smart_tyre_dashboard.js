const model = require('../models/models');
const constants = require(`../constant/constant`);
const moment = require("moment");
const smart_tyre_dashboard = require("../query-provider/smart_tyre_dashboard");
const XLSX = require('xlsx');
const dateHelper=require('../helpers/date_helper');

module.exports= {
    LineChartInstallationSell: (type) => {
        let startDate;
        let format;

        if (type === "1year") {
            startDate = moment().subtract(1, "year").toDate();
            format = "%Y-%m";
        } else if (type === "30days") {
            startDate = moment().subtract(30, "days").toDate();
            format = "%m-%d";
        } else {
            startDate = moment().subtract(7, "day").toDate();
            format = "%Y-%m-%d";
        }

        const installationsPromise=model.dealerInstallation.aggregate(
            smart_tyre_dashboard.getLineChartDealerInstallations(startDate, format)
        );

        const sellsPromise=model.dealerSell.aggregate(
            smart_tyre_dashboard.getLineChartDealerSells(startDate, format)
        );

        return Promise.all([installationsPromise,sellsPromise]).then(([installations,sells])=>{
            return {
                installations, sells
            }
        }).catch((err)=>{
            return Promise.reject(err);
        })
    },

    zoneWiseInstallationsSells: (type = "monthly") => {

        let startDate, endDate;

        if (type === "yearly") {
            startDate = moment().subtract(1, "year").startOf("year").toDate();
            endDate = moment().subtract(1, "year").endOf("year").toDate();
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

        return Promise.all([installationsPromise,sellsPromise]).then(([installations,sells])=>{
            return {
                installations, sells
            }
        }).catch((err)=>{
            return Promise.reject(err);
        })
    },

    dealerInstallationsSells: () => {

        const yesterdayStart = moment().subtract(1, "day").startOf("day").toDate();
        const yesterdayEnd = moment().subtract(1, "day").endOf("day").toDate();

        const lastMonthStart = moment().subtract(1, "month").startOf("month").toDate();
        const lastMonthEnd = moment().subtract(1, "month").endOf("month").toDate();

        const lastYearStart = moment().subtract(1, "year").startOf("year").toDate();
        const lastYearEnd = moment().subtract(1, "year").endOf("year").toDate();

        const installationsPromise=model.dealerInstallation.aggregate(
            smart_tyre_dashboard.getDealerInstallation(
                yesterdayStart, yesterdayEnd,
                lastMonthStart, lastMonthEnd,
                lastYearStart, lastYearEnd)
        );

        const sellsPromise=model.dealerSell.aggregate(
            smart_tyre_dashboard.getDealerSells(
                yesterdayStart, yesterdayEnd,
                lastMonthStart, lastMonthEnd,
                lastYearStart, lastYearEnd)
        );

        return Promise.all([installationsPromise,sellsPromise]).then(([installations,sells]) => {
            const installData = installations?.[0] ?? {};
            const sellData = sells?.[0] ?? {};

            return {
                Installations:{
                    yesterday: installData.yesterday?.[0]?.count ?? 0,
                    lastMonth: installData.lastMonth?.[0]?.count ?? 0,
                    lastYear: installData.lastYear?.[0]?.count ?? 0
                },
                sells:{
                    yesterday: sellData.yesterday?.[0]?.count ?? 0,
                    lastMonth: sellData.lastMonth?.[0]?.count ?? 0,
                    lastYear: sellData.lastYear?.[0]?.count ?? 0
                }
            }
        }).catch(err => {
            console.error("totalDealerInstallations service error is :", err);
            throw err;
        })
    },

    top5DealerInstallation: () => {
        return model.dealerInstallation.aggregate(smart_tyre_dashboard.getTop5DealerInstallation()).then(result => {
            return result;
        }).catch(err => {
            console.error(" top5DealerInstallations Service error is :", err);
            throw err;
        })
    },

    top5MakeModel: () => {
        return model.dealerInstallation.aggregate(smart_tyre_dashboard.getTop5MakeModel()).then(result => {
            return result;
        }).catch(err => {
            console.error(" top5MakeModel Service error is :", err);
            throw err;
        })
    },

    top5region: () => {
        return model.dealerInstallation.aggregate(smart_tyre_dashboard.getTop5region()).then(result => {
            return result;
        }).catch(err => {
            console.error("top5regions service error is :", err);
            throw err;
        })
    },

    top5Zone: () => {
        return model.dealerInstallation.aggregate(smart_tyre_dashboard.getTop5zone()).then(result => {
            return result;
        }).catch(err => {
            console.error(" top5Zones Service error is :", err);
            throw err;
        })
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
