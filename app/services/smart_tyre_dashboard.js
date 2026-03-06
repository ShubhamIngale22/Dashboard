const model = require('../models/models');
const moment = require("moment");
const smart_tyre_dashboard = require("../query-provider/smart_tyre_dashboard");
const dateHelper=require('../helpers/date_helper');

module.exports= {

    addUser: (data) => {
        let user= new model.user(data);
        return user.save().then((result) => {
            return Promise.resolve(result);
        }).catch((err) => {
            return Promise.reject(err);
        });
    },

    getUser: (query, includePassword = false) => {
        let q = model.user.findOne(query);
        if (includePassword) {
            q = q.select('+password');
        }
        return q
            .then((data) => Promise.resolve(data))
            .catch((err) => Promise.reject(err));
    },

    allUser: () => {
        return model.user.find({}).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            return Promise.reject(err);
        });
    },

    updateUser: (query, update) => {
        return model.user.findOneAndUpdate(
            query,
            { $set: update },
            { returnDocument: "after" }
        );
    },

    updateUserWithSave: async (query, updateData) => {
        const user = await model.user.findOne(query);

        if (!user) return null;
        Object.keys(updateData).forEach((key) => {
            user[key] = updateData[key];
        });
        return user.save();
    },

    deleteUser: (query) => {
        return model.user.findOneAndDelete(query).then((data) => {
            return Promise.resolve(data);
        }).catch((err) => {
            return Promise.reject(err);
        });
    },

    getRole: (query) => {
        return model.role.findOne(query);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    sellsInstallationsLineChart: (installationMatchQuery, sellsMatchQuery, format, sortFormat) => {

        const installationsPromise = model.dealerInstallationCount.aggregate(
            smart_tyre_dashboard.getLineChartDealerInstallations(installationMatchQuery, format, sortFormat)
        );

        const sellsPromise = model.dealerSell.aggregate(
            smart_tyre_dashboard.getLineChartDealerSells(sellsMatchQuery, format, sortFormat)
        );

        return Promise.all([installationsPromise, sellsPromise])
            .then(([installations, sells]) => ({ installations, sells }))
            .catch((err) => Promise.reject(err));
    },

    zoneWiseInstallationsSellsBarChart: (installationMatchQuery, sellsMatchQuery) => {

        const installationsPromise=model.dealerInstallationZoneCount.aggregate(
            smart_tyre_dashboard.getZoneWiseDealerInstallation(installationMatchQuery)
        );

        const sellsPromise=model.dealerSell.aggregate(
            smart_tyre_dashboard.getZoneWiseDealerSells(sellsMatchQuery)
        );

        return Promise.all([installationsPromise, sellsPromise])
            .then(([installations, sells]) => ({ installations, sells }))
            .catch((err) => Promise.reject(err));
    },

    getInstallationCount: (query) => {
        return model.dealerInstallationCount.aggregate(
            smart_tyre_dashboard.getInstallationCount(query)
        );
    },

    getSellsCount: (query) => {
        return model.dealerSell.aggregate(
            smart_tyre_dashboard.getSellsCount(query)
        );
    },

    getTop5SmartTyreInstallation: (query,groupId, projection,limit,count,filter) => {

        const collection= filter === "Zones"
        ? model.dealerInstallationZoneCount : model.dealerInstallation;
        return collection.aggregate(smart_tyre_dashboard.getTop5SmartTyreInstallation(query,groupId, projection,limit,count)).then(result => {
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
    },

    generateInstallationSummary: (day) => {
        try {
            const today = moment();

            const startDate = today.clone().subtract(day, 'day').startOf('day').toDate();
            console.log("StartDate is :",startDate);
            const endDate = today.clone().subtract(day, 'day').endOf('day').toDate();
            console.log("endDate is :",endDate);
            let query = {
                installationDate: {$gte: startDate, $lte: endDate},
                installType: {$ne: "Online"},
                customerCode: {$ne: null},
                zone: {$ne: null},
            };

            //Dealer installation daily counts
            model.dealerInstallation.aggregate(smart_tyre_dashboard.generateInstallationSummary(query, startDate)).then(async (installData) => {
                const zoneMap = {};
                let installCount = 0
                installData.forEach(item => {
                    zoneMap[item.zone] = item.installationCount;
                    installCount += item.installationCount;
                });

                const allZones = ["NZ", "SZ", "EZ", "WZ", "CZ", "TZ"];
                const finalData = allZones.map(zone => ({
                    zone,
                    installationDate: startDate,
                    installationCount: zoneMap[zone] ?? 0,
                }));

                const dailyInstallation = new model.dealerInstallationCount({
                    installationDate: startDate,
                    installationCount: installCount,
                });
                await dailyInstallation.save();
                await model.dealerInstallationZoneCount.insertMany(finalData);
            }).catch((err) => {
                console.log("ERR:", err.message);
            });
        } catch (e) {
            console.error('ERR::', e.message);
        }
    },
}
