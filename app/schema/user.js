const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
        role: {
            type: String,
            default: "RM",
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        customerId: {
            type: String,
            required: true,
            default:"69a9601eb9b332cccf6fe0ec"
        },
        activeStatus: {
            type: Boolean,
            default: false
        },
        logout: {
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

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("user", userSchema);
