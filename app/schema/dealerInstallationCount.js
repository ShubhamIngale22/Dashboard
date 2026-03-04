/* Created by Rutik on 27-02-2026 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const installationCountSchema = new Schema({
    installationCount: {type: Number},
    installationDate: {type: Date, unique: true},
}, {timestamps: true, versionKey: false});

module.exports = mongoose.model("t_dealerInstallationsCount", installationCountSchema);
