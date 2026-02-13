const response = require("../utility/api_handler");
const chartFormatter = require("../utility/chart_formatter");
const services = require('../services/index');
const fs = require('fs');
const XLSX = require('xlsx');

module.exports = {
    sellsInstallationsLineChart: (req, res) => {
        const type=req.query.type || "7days";

        return services.smart_tyre_dashboard.LineChartInstallationSell(type).then((data)=>{
            const lineChartData = chartFormatter.combinedLineChart(
                data.installations,
                data.sells
            );
            return res.json(response.JsonMsg(true,lineChartData, "Line-Chart data is fetched.", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    zoneWiseInstallationsSellsPie: (req, res) => {
        const type=req.query.type;

        return services.smart_tyre_dashboard.zoneWiseInstallationsSells(type).then((data)=>{

            return res.json(response.JsonMsg(true, data, "Zone-wise data is fetched.", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    dealerInstallationsSellsTable: (req, res) => {
        return services.smart_tyre_dashboard.dealerInstallationsSells().then((data)=>{
            return res.json(response.JsonMsg(true, data, "Dealer Installations and sells data is fetched.", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    top5DealerInstallationTable: (req, res) => {

        return services.smart_tyre_dashboard.top5DealerInstallation().then((data)=>{
            return res.json(response.JsonMsg(true,data, "Dealer Installations Data for top 5 regions", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    top5MakeModelTable: (req, res) => {

        return services.smart_tyre_dashboard.top5MakeModel().then((data)=>{
            return res.json(response.JsonMsg(true,data, "Dealer Installations Data for top 5 regions", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    top5regionTable: (req, res) => {

        return services.smart_tyre_dashboard.top5region().then((data)=>{
            return res.json(response.JsonMsg(true,data, "Dealer Installations Data for top 5 regions", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    top5ZoneTable: (req, res) => {

        return services.smart_tyre_dashboard.top5Zone().then((data)=>{
            return res.json(response.JsonMsg(true,data, "Dealer Installations Data for top 5 zones", 200));
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
