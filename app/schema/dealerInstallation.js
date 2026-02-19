/* Created by admin on 20-02-2024 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constant = require('../constant/constant');

const dealerInstallationSchema = new Schema({
    vehicleId: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId },
    scanningQRCodeDetailsId: { type: String },
    vehicleNo: { type: String},
    unit_sr_no: { type : String },
    customerCode: { type: String },
    dealerShopName: { type: String },
    districtName: { type: String },
    districtId: { type: String },
    dealerName: { type: String },
    earningAmount: { type: Number },
    mobileNumber: { type: String },
    tirePositionId: { type: String },
    status: { type: Boolean, default: false },
    manufacturerId:{ type:Schema.Types.ObjectId, default: null},
    manufacturerName: {type: String, default: ''},
    modelId:{ type:Schema.Types.ObjectId, default: null},
    vehicleModelNo:{type: String, default: ''},
    zone: { type: String},
    regionName: { type: String},
    territoryCode: { type: String},
    territoryName: { type: String},
    productType: { type: String},
    fitterId:{ type:Schema.Types.ObjectId, default: null},
    fitterName: { type: String},
    fitterMobileNumber: { type: String},
    installationDate: { type: Date},
    productKitAddToVehicleDateTime: {type:Date},
    fitterAddedBy: {type: String},
    fitterPaymentStatus: {type: String},
    fitterRemark: { type: String},
    fitterUpdatedBy: { type: String},
    installType: {type: String},
    fitterIncentiveAmount: {type: Number, default: constant.fitterAmount},
},{timestamps: true, versionKey: false});

dealerInstallationSchema.index({ installationDate: 1 });
dealerInstallationSchema.index({ installationDate: 1,_id:1 }); // summary table
dealerInstallationSchema.index({ installationDate: 1, zone: 1 });// Zone-wise pie chart
dealerInstallationSchema.index({ installationDate: 1, customerCode: 1 });// Top 5 dealers — getTop5DealerInstallation
dealerInstallationSchema.index({ installationDate: 1, customerCode: 1, manufacturerName: 1, vehicleModelNo: 1 });// Top 5 make/model — getTop5MakeModel
dealerInstallationSchema.index({ installationDate: 1, customerCode: 1, regionName: 1 });// Top 5 regions — getTop5region
dealerInstallationSchema.index({ installationDate: 1, customerCode: 1, zone: 1 });// Top 5 zones — getTop5zone

module.exports = mongoose.model('t_dealerInstallation', dealerInstallationSchema);



