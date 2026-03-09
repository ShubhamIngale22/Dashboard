const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {VALID_ZONES} = require('../constant/constant');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        address: {
            type: String,
            required: true
        },
        roleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'role',
            required: true
        },
        roleLevel: {
            type: Number,
            required: true,
        },
        roleName: {
            type: String,
            required: true,
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            default: null
        },
        zone: {
            type: String,
            enum: VALID_ZONES,
            default: null  // null for roleLevel 1, 2, 3
        },
        activeStatus: {
            type: Boolean,
            default: false
        },
        lastActiveDate: {
            type: Date,
            default: () => new Date()
        }
    },
    { timestamps: true }
);

// pre-save hook — handles hashing automatically

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("user", userSchema);
