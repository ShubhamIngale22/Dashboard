const model = require('../models/models');
const constants = require(`../constant/constant`);
const moment = require("moment");
const dealer_query = require("../query-provider/dealer")
const stringConstant = require("../constant/constant");
const XLSX = require('xlsx');

module.exports={
    getLineChartDealerInstallations: (type) => {
        let startDate;
        let format;

        if (type === "1year") {
            startDate = moment().subtract(1, "year").toDate();
            format= "%Y-%m";
        } else if (type === "30days") {
            startDate = moment().subtract(30, "days").toDate();
            format= "%m-%d";
        }else{
            startDate = moment().subtract(7, "day").toDate();
            format= "%Y-%m-%d";
        }

        return model.dealerInstallation.aggregate(dealer_query.getLineChartDealerInstallations(startDate, format)).then((data) => {
            return Promise.resolve(data)
        }).catch((err) => {
            return Promise.reject(err);
        });
    },

    zoneWiseDealerInstallation: (type = "monthly") => {

        let startDate, endDate;

        if (type === "yearly") {
            startDate = moment().subtract(1, "year").startOf("year").toDate();
            endDate   = moment().subtract(1, "year").endOf("year").toDate();
        } else {
            startDate = moment().subtract(1, "month").startOf("month").toDate();
            endDate   = moment().subtract(1, "month").endOf("month").toDate();
        }
        return model.dealerInstallation.aggregate(dealer_query.getZoneWiseDealerInstallation(startDate, endDate)).then(result =>{
            return result ;
        }).catch(err=>{
            console.error("ZoneDealerInstallations service error is :",err);
            throw err;
        })
    },

    dealerInstallation: () => {

        const yesterdayStart = moment().subtract(1, "day").startOf("day").toDate();
        const yesterdayEnd   = moment().subtract(1, "day").endOf("day").toDate();

        const lastMonthStart = moment().subtract(1, "month").startOf("month").toDate();
        const lastMonthEnd   = moment().subtract(1, "month").endOf("month").toDate();

        const lastYearStart = moment().subtract(1, "year").startOf("year").toDate();
        const lastYearEnd   = moment().subtract(1, "year").endOf("year").toDate();

        return model.dealerInstallation.aggregate(dealer_query.getDealerInstallation(yesterdayStart,yesterdayEnd,lastMonthStart,lastMonthEnd,lastYearStart,lastYearEnd)).then(result => {
            const r = result[0] || {};
            return {
                yesterday: r.yesterday?.[0]?.count || 0,
                lastMonth: r.lastMonth?.[0]?.count || 0,
                lastYear: r.lastYear?.[0]?.count || 0
            }
        }).catch(err=>{
            console.error("totalDealerInstallations service error is :",err);
            throw err;
        })
    },

    top5DealerInstallation: () => {
        return model.dealerInstallation.aggregate(dealer_query.getTop5DealerInstallation()).then(result =>{
            return result;
        }).catch(err=>{
            console.error(" top5DealerInstallations Service error is :",err);
            throw err;
        })
    },

    top5MakeModel: () => {
        return model.dealerInstallation.aggregate(dealer_query.getTop5MakeModel()).then(result =>{
            return result;
        }).catch(err=>{
            console.error(" top5MakeModel Service error is :",err);
            throw err;
        })
    },

    top5region: () => {
        return model.dealerInstallation.aggregate(dealer_query.getTop5region()).then(result =>{
            return result ;
        }).catch(err=>{
            console.error("top5regions service error is :",err);
            throw err;
        })
    },

    top5Zone: () => {
        return model.dealerInstallation.aggregate(dealer_query.getTop5zone()).then(result =>{
            return result;
        }).catch(err=>{
            console.error(" top5Zones Service error is :",err);
            throw err;
        })
    }
}
