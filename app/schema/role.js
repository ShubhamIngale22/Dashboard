const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    roleId:    { type: Number, required: true, unique: true },
    roleName:  { type: String, required: true },
    roleLevel: { type: Number, required: true },
    isEnable:  { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('role', roleSchema);
