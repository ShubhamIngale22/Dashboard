const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    roleName:  { type: String, required: true },
    roleLevel: { type: Number, required: true },
    isEnable:  { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: false
});

module.exports = mongoose.model('role', roleSchema);
