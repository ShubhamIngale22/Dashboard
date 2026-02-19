/* Created by admin on 12-02-2026 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sellsBillingSchema = new Schema({
    plant: {type: String,},
    billingDate: {type: Date},
    sensorType: {type: String},
    productCode: {type: String},
    productDesc: {type: String},
    quantity: {type: Number},
    customerCode: {type: String},
    dealerShopName: {type: String},
    districtName: {type: String},
    stateName: {type: String},
    cityName: {type: String},
    territoryCode: {type: String},
    territoryName: {type: String},
    zone: {type: String},
    regionName: {type: String}
},
    {
    timestamps: true,
    versionKey: false
});

sellsBillingSchema.index({ billingDate: 1 });// LineChart — getLineChartDealerSells
sellsBillingSchema.index({ billingDate: 1, zone: 1 });// Zone-wise pie chart — getZoneWiseDealerSells

module.exports = mongoose.model('t_dealerSell', sellsBillingSchema);

