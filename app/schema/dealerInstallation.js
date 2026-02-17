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

module.exports = mongoose.model('t_dealerInstallation', dealerInstallationSchema);

dealerInstallationSchema.index({scanningQRCodeDetailsId: 1}, {unique: true});
dealerInstallationSchema.index({status: 1, createdAt: 1}); //Cron - updateDealerTransactionData
dealerInstallationSchema.index({scanningQRCodeDetailsId: 1, status: 1}); //API - /v2/releasedSmartTyreTags/:macId || /v1/update/vehicletag/ || /v1/deleteSmartTyre
dealerInstallationSchema.index({fitterMobileNumber: 1}); //API - /getFitterListForPayment
dealerInstallationSchema.index({vehicleId: 1, tirePositionId: 1}); //API - /v1/update/vehicletag/
dealerInstallationSchema.index({customerCode: 1, createAt: 1, dealerShopName: 1});

