/* Created by Rutik on 27-02-2026 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const installationZoneCountSchema = new Schema({
    zone: {type: String},
    installationCount: {type: Number},
    installationDate: {type: Date},
}, {timestamps: true, versionKey: false});

installationZoneCountSchema.index({zone: 1, installationDate: 1}, {unique: true});

module.exports = mongoose.model("t_dealerInstallationZoneCount", installationZoneCountSchema);
