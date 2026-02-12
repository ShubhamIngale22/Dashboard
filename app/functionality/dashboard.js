const response = require("../utility/api_handler");
const chartFormatter = require("../utility/chart_formatter");
const services = require('../services/index');

module.exports = {
    dealerInstallationLineChart: (req, res) => {
        const type=req.query.type || "7days";

        return services.dealer.getLineChartDealerInstallations(type).then((data)=>{

            const LineChartData=chartFormatter.lineChart(data);

            return res.json(response.JsonMsg(true,LineChartData, "Dealer Installations Data for Line-Chart", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    zoneWiseDealerInstallationsPie: (req, res) => {
        const type=req.query.type;

        return services.dealer.zoneWiseDealerInstallation(type).then((data)=>{
            return res.json(response.JsonMsg(true, data, "Zone-wise Installations Data", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    dealerInstallationTable: (req, res) => {
        return services.dealer.dealerInstallation().then((data)=>{
            return res.json(response.JsonMsg(true, data, "Dealer Installations Data", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    top5DealerInstallationTable: (req, res) => {

        return services.dealer.top5DealerInstallation().then((data)=>{
            return res.json(response.JsonMsg(true,data, "Dealer Installations Data for top 5 regions", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    top5MakeModelTable: (req, res) => {

        return services.dealer.top5MakeModel().then((data)=>{
            return res.json(response.JsonMsg(true,data, "Dealer Installations Data for top 5 regions", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    top5regionTable: (req, res) => {

        return services.dealer.top5region().then((data)=>{
            return res.json(response.JsonMsg(true,data, "Dealer Installations Data for top 5 regions", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    top5ZoneTable: (req, res) => {

        return services.dealer.top5Zone().then((data)=>{
            return res.json(response.JsonMsg(true,data, "Dealer Installations Data for top 5 zones", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    }
}
