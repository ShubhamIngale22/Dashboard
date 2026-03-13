const response = require("../utility/api_handler");
const chartFormatter = require("../utility/chart_formatter");
const services = require('../services/index');
const fs = require('fs');
const XLSX = require('xlsx');
const moment = require("moment/moment");
const dateHelper = require("../helpers/date_helper");
const error=require("../constant/messages");
const bcrypt=require("bcrypt");
const jwtHelper=require("../helpers/jwt_helper");
const {ROLE_PERMISSIONS,VALID_ZONES} = require('../constant/constant');

module.exports = {

    loginUser: (req, res) => {
        if (!req.body || !req.body.emailOrMobile || !req.body.password) {
            return res.json(response.JsonMsg(false, null, error.EMPTY_STRING, 400));
        }

        const { password, emailOrMobile } = req.body;
        const query = { $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }] };

        return services.smart_tyre_dashboard.getUser(query, true)
            .then((userData) => {
                if (!userData) {
                    return Promise.reject({ key: 'msg', msg: 'Please enter valid Email or Mobile!', status: 404 });
                }
                if (!userData.activeStatus) {
                    return Promise.reject({ key: 'msg', msg: 'Your account is disabled!', status: 403 });
                }
                return bcrypt.compare(password, userData.password)
                    .then((isMatch) => {
                        if (!isMatch) {
                            return Promise.reject({ key: 'msg', msg: 'Invalid password!', status: 401 });
                        }
                        let query={ _id: userData._id };
                        let update={ logout: false };

                        return services.smart_tyre_dashboard.updateUser(query,update).then((updatedUser) => {
                            const token = jwtHelper.generateToken({
                                userId:    updatedUser._id,
                                email:     updatedUser.email,
                                roleId:    updatedUser.roleId,
                                roleLevel: updatedUser.roleLevel,
                                roleName:  updatedUser.roleName,
                                zone:      updatedUser.zone
                                });
                            const userObj = updatedUser.toObject();
                            delete userObj.password;
                            return res.json(response.JsonMsg(true, { user: userObj, token }, 'Login successful', 200));
                        });
                    });
            }).catch((err) => {
                if (err && err.key === 'msg') {
                    return res.json(response.JsonMsg(false, null, err.msg, err.status || 401));
                }
                return res.json(response.JsonMsg(false, null, err.message, 500));
            });
    },

    addUser: (req, res) => {
        if (!req.body || !req.body.name || !req.body.email || !req.body.mobile ||
            !req.body.password || !req.body.address || !req.body.roleId) {
            return res.json(response.JsonMsg(false, null, error.EMPTY_STRING, 400));
        }

        const { name, email, mobile, password, address, roleId, zone, customerId } = req.body;
        const loggedInUser = req.user;

        // 1. Get allowed roleLevels for logged-in user
        const allowedLevels = ROLE_PERMISSIONS[loggedInUser.roleLevel] || [];
        if (allowedLevels.length === 0) {
            return res.json(response.JsonMsg(false, null, 'You are not authorized to add any user!', 403));
        }

        // 2. Fetch target role
        let query={_id: roleId, roleLevel: { $in: allowedLevels }, isEnable: true};
        return services.smart_tyre_dashboard.getRole(query).then((targetRole) => {
            if (!targetRole) {
                return Promise.reject({ key: 'msg', msg: 'Invalid or unauthorized role!', status: 403 });
            }
            // 3. zone required for ZM
            if (targetRole.roleLevel === 4) {
                if (!zone) {
                    return Promise.reject({ key: 'msg', msg: 'Zone is required for ZM!', status: 400 });
                }
                if (!VALID_ZONES.includes(zone)) {
                    return Promise.reject({ key: 'msg', msg: `Invalid zone! Must be one of: ${VALID_ZONES.join(', ')}`, status: 400 });
                }
            }
            // 4. customerId logic
            // System Admin (2) creating ZM (4) → customerId must be provided (selected Admin)
            if (loggedInUser.roleLevel === 2 && targetRole.roleLevel === 4) {
                if (!customerId) {
                    return Promise.reject({ key: 'msg', msg: 'Please select an Admin to manage this ZM!', status: 400 });
                }
                // verify selected customerId is a valid Admin under this System Admin
                let query={_id: customerId, roleLevel: 3, customerId: loggedInUser.userId, activeStatus: true};
                return services.smart_tyre_dashboard.getUser(query).then((adminUser) => {
                    if (!adminUser) {
                        return Promise.reject({ key: 'msg', msg: 'Invalid Admin selected!', status: 400 });
                    }
                    return {adminUser,targetRole};
                });
            }
            return {adminUser:null,targetRole};
        }).then(({adminUser,targetRole}) => {
            let query={ $or: [{ email }, { mobile }] };
            return services.smart_tyre_dashboard.getUser(query).then((existingUser) => {
                if (existingUser) {
                    const msg = existingUser.email === email
                        ? error.EMAIL_EXISTS
                        : error.PHONE_EXISTS;
                    return Promise.reject({ key: 'msg', msg, status: 409 });
                }
                // 6. Build customerId and createdBy based on role
                let finalCustomerId;
                let createdBy = loggedInUser.userId;
                if (loggedInUser.roleLevel === 1) {
                    finalCustomerId = null;
                } else if (loggedInUser.roleLevel === 2 && adminUser) {
                    finalCustomerId = adminUser._id;
                } else {
                    finalCustomerId = loggedInUser.userId;
                }
                // 7. Build data
                const data = {
                    name,
                    email,
                    mobile,
                    password,
                    address,
                    roleId:     targetRole._id,
                    roleLevel:  targetRole.roleLevel,
                    roleName:   targetRole.roleName,
                    customerId: finalCustomerId,
                    createdBy:  createdBy,
                    zone:       targetRole.roleLevel === 4 ? zone : null
                };
                return services.smart_tyre_dashboard.addUser(data);
            });
        }).then((result) => {
            if (!result) {
                return Promise.reject({ key: 'msg', msg: 'Unable to add user!', status: 500 });
            }
            const userObj = result.toObject();
            delete userObj.password;
            return res.json(response.JsonMsg(true, userObj, 'User added successfully!', 201));
        }).catch((err) => {
            if (err && err.key === 'msg') {
                return res.json(response.JsonMsg(false, null, err.msg, err.status || 400));
            }
            console.error('[addUser] Unexpected error:', err.message);
            return res.json(response.JsonMsg(false, null, err.message, 500));
        })
    },

    getRoles: (req, res) => {
        const loggedInUser = req.user;

        const allowedLevels = ROLE_PERMISSIONS[loggedInUser.roleLevel] || [];
        if (allowedLevels.length === 0) {
            return res.json(response.JsonMsg(false, null, 'You are not authorized to add any role!', 403));
        }
        let query={roleLevel: { $in: allowedLevels }, isEnable: true };
        return services.smart_tyre_dashboard.getRoles(query).then((roles) => {
            if (!roles || roles.length === 0) {
                return Promise.reject({ key: 'msg', msg: 'No roles found!', status: 404 });
            }
            return res.json(response.JsonMsg(true, roles, 'Roles fetched successfully!', 200));
        }).catch((err) => {
            if (err && err.key === 'msg') {
                return res.json(response.JsonMsg(false, null, err.msg, err.status || 400));
            }
            return res.json(response.JsonMsg(false, null, err.message, 500));
        });
    },

    getUsers: (req, res) => {
        const loggedInUser = req.user;
        if (loggedInUser.roleLevel === 4) {
            return res.json(response.JsonMsg(false, null, 'Not authorized!', 403));
        }
        let query;
        if (loggedInUser.roleLevel === 1) {
            query = {};
        } else if (loggedInUser.roleLevel === 2) {
            query = {
                $or: [
                    { roleLevel: 3, customerId: loggedInUser.userId },  // Admins under them
                    { roleLevel: 4 }    //  all ZMs
                ]
            };
        } else if (loggedInUser.roleLevel === 3) {
            query = {roleLevel: 4, customerId: loggedInUser.userId};
        }
        return services.smart_tyre_dashboard.getAllUser(query).then((users) => {
            if (!users || users.length === 0) {
                return Promise.reject({ key: 'msg', msg: 'No users found!', status: 404 });
            }
            return res.json(response.JsonMsg(true, users, 'Users fetched successfully!', 200));
        }).catch((err) => {
            if (err && err.key === 'msg') {
                return res.json(response.JsonMsg(false, null, err.msg, err.status || 400));
            }
            console.error('[getUsers] Unexpected error:', err.message);
            return res.json(response.JsonMsg(false, null, err.message, 500));
        })
    },

    getAdmins: (req, res) => {
        const loggedInUser = req.user;
        if (loggedInUser.roleLevel !== 2) {
            return res.json(response.JsonMsg(false, null, 'Not authorized!', 403));
        }
        let query={roleLevel: 3, customerId: loggedInUser.userId, activeStatus: true};
        return services.smart_tyre_dashboard.getAllUser(query).then((admins) => {
            if (!admins || admins.length === 0) {
                return Promise.reject({ key: 'msg', msg: 'No admins found!', status: 404 });
            }
            return res.json(response.JsonMsg(true, admins, 'Admins fetched successfully!', 200));
        }).catch((err) => {
            if (err && err.key === 'msg') {
                return res.json(response.JsonMsg(false, null, err.msg, err.status || 400));
            }
            console.error('[getAdmins] Unexpected error:', err.message);
            return res.json(response.JsonMsg(false, null, err.message, 500));
        })
    },

    deleteUser: (req, res) => {
        const userId = req.params.userId?.trim();
        const loggedInUser = req.user;
        if (!userId) {
            return res.json(response.JsonMsg(false, null, error.EMPTY_STRING, 400));
        }
        return services.smart_tyre_dashboard.getUser({ _id: userId }).then((targetUser) => {
            if (!targetUser) {
                return Promise.reject({ key: 'msg', msg: 'User not found!', status: 404 });
            }
            // permission check
            const allowedLevels = ROLE_PERMISSIONS[loggedInUser.roleLevel] || [];
            if (!allowedLevels.includes(targetUser.roleLevel)) {
                return Promise.reject({ key: 'msg', msg: 'You are not authorized to perform this action!', status: 403 });
            }
            // cannot delete yourself
            if (targetUser._id.toString() === loggedInUser.userId.toString()) {
                return Promise.reject({ key: 'msg', msg: 'You cannot delete yourself!', status: 400 });
            }
            // toggle activeStatus
            const newStatus = !targetUser.activeStatus;
            const msg = newStatus ? 'User reactivated successfully!' : 'User deleted successfully!';
            let query={ _id: userId };
            let update={ activeStatus: newStatus, lastActiveDate: new Date() };
            return services.smart_tyre_dashboard.updateUser(query,update).then((updatedUser) => {
                if (!updatedUser) {
                    return Promise.reject({ key: 'msg', msg: 'Unable to perform action!', status: 500 });
                }
                return res.json(response.JsonMsg(true, null, msg, 200));
            });
        }).catch((err) => {
            if (err && err.key === 'msg') {
                return res.json(response.JsonMsg(false, null, err.msg, err.status || 400));
            }
            console.error('[deleteUser] Unexpected error:', err.message);
            return res.json(response.JsonMsg(false, null, err.message, 500));
        });
    },

    updateUser: (req, res) => {
        const userId = req.params.userId?.trim();
        const loggedInUser = req.user;
        if (!userId) {
            return res.json(response.JsonMsg(false, null, error.EMPTY_STRING, 400));
        }
        const { name, email, mobile, address, zone, password } = req.body;
        return services.smart_tyre_dashboard.getUser({ _id: userId }).then((targetUser) => {
            if (!targetUser) {
                return Promise.reject({ key: 'msg', msg: 'User not found!', status: 404 });
            }
            // permission check
            const allowedLevels = ROLE_PERMISSIONS[loggedInUser.roleLevel] || [];
            if (!allowedLevels.includes(targetUser.roleLevel)) {
                return Promise.reject({ key: 'msg', msg: 'You are not authorized to update this user!', status: 403 });
            }
            // zone validation — only for ZM
            if (zone !== undefined) {
                if (targetUser.roleLevel !== 4) {
                    return Promise.reject({ key: 'msg', msg: 'Zone can only be set for ZM!', status: 400 });
                }
                if (!VALID_ZONES.includes(zone)) {
                    return Promise.reject({ key: 'msg', msg: `Invalid zone! Must be one of: ${VALID_ZONES.join(', ')}`, status: 400 });
                }
            }
            // check duplicate email/mobile (exclude current user)
            const orConditions = [];
            if (email) orConditions.push({ email });
            if (mobile) orConditions.push({ mobile });

            if (orConditions.length === 0) {
                return { targetUser, existingUser: null };
            }
            let query={$or: orConditions, _id: { $ne: userId }}
            return services.smart_tyre_dashboard.getUser(query).then((existingUser) => ({ targetUser, existingUser }));
        }).then(({ targetUser, existingUser }) => {
            if (existingUser) {
                const msg = existingUser.email === email ? error.EMAIL_EXISTS : error.PHONE_EXISTS;
                return Promise.reject({ key: 'msg', msg, status: 409 });
            }
            // build update object — only include provided fields
            const updateData = {};
            if (name    !== undefined) updateData.name    = name;
            if (email   !== undefined) updateData.email   = email;
            if (mobile  !== undefined) updateData.mobile  = mobile;
            if (address !== undefined) updateData.address = address;
            if (zone    !== undefined && targetUser.roleLevel === 4) updateData.zone = zone;

            // password — use updateUserWithSave to trigger bcrypt pre-save hook
            if (password) {
                let query={ _id: userId };
                let update={ ...updateData, password };
                return services.smart_tyre_dashboard.updateUserWithSave(query,update);
            }
            return services.smart_tyre_dashboard.updateUser({ _id: userId }, updateData);
        }).then((updatedUser) => {
            if (!updatedUser) {
                return Promise.reject({ key: 'msg', msg: 'Unable to update user!', status: 500 });
            }
            const userObj = updatedUser.toObject();
            delete userObj.password;
            return res.json(response.JsonMsg(true, userObj, 'User updated successfully!', 200));
        }).catch((err) => {
            if (err && err.key === 'msg') {
                return res.json(response.JsonMsg(false, null, err.msg, err.status || 400));
            }
            console.error('[updateUser] Unexpected error:', err.message);
            return res.json(response.JsonMsg(false, null, err.message, 500));
        });
    },

    logoutUser: (req, res) => {
        const loggedInUser = req.user; // from JWT middleware

        let query={ _id: loggedInUser.userId };
        let update={logout: true, lastActiveDate: new Date()};

        return services.smart_tyre_dashboard.updateUser(query,update).then((updatedUser) => {
            if (!updatedUser) {
                return Promise.reject({ key: 'msg', msg: 'User not found!', status: 404 });
            }
            return res.json(response.JsonMsg(true, updatedUser, 'Logout successful', 200));
        }).catch((err) => {
            if (err && err.key === 'msg') {
                return res.json(response.JsonMsg(false, null, err.msg, err.status || 400));
            }
            return res.json(response.JsonMsg(false, null, err.message, 500));
        });
    },

    sellsInstallationsLineChart: (req, res) => {
        const type       = req.query.type;
        const fiscalYear = req.query.fiscal_year || null;
        const month      = req.query.month ? parseInt(req.query.month) : null;
        const zoneFilter = services.smart_tyre_dashboard.getZoneFilter(req.user);

        let startDate, endDate, format, sortFormat;

        if (type === "YTD") {
            startDate=dateHelper.fyYearStart();
            endDate = null;
            format     = "%b-%Y";
            sortFormat = "%Y-%m";

        } else if (type === "MTD") {
            startDate = moment().startOf("month").toDate();
            endDate = moment().endOf("month").toDate();
            format     = "%d-%b";
            sortFormat = "%Y-%m-%d";

        } else if (type === "custom" && fiscalYear) {
            const startYear = parseInt(fiscalYear.split("-")[0]);
            const endYear   = startYear + 1;

            if (month) {
                const calendarMonth = month;
                const calendarYear  = month >= 4 ? startYear : endYear;
                startDate  = moment({ year: calendarYear, month: calendarMonth - 1, date: 1 }).toDate();
                endDate    = moment(startDate).endOf("month").toDate();
                format     = "%d-%b";
                sortFormat = "%Y-%m-%d";
            } else {
                startDate  = moment({ year: startYear, month: 3, date: 1 }).toDate();  // Apr 1
                endDate    = moment({ year: endYear,   month: 2, date: 31 }).toDate(); // Mar 31
                format     = "%b-%Y";
                sortFormat = "%Y-%m";
            }
        }

        // Two separate match queries — different date field names per collection
        const installationMatchQuery = endDate
            ? { installationDate: { $gte: startDate, $lte: endDate }, ...zoneFilter }
            : { installationDate: { $gte: startDate }, ...zoneFilter };

        const sellsMatchQuery = endDate
            ? { billingDate: { $gte: startDate, $lte: endDate }, ...zoneFilter }
            : { billingDate: { $gte: startDate }, ...zoneFilter };

        return services.smart_tyre_dashboard
            .sellsInstallationsLineChart(installationMatchQuery, sellsMatchQuery, format, sortFormat)
            .then((data) => {
                const lineChartData = chartFormatter.combinedLineChart(
                    data.installations,
                    data.sells
                );
                return res.json(response.JsonMsg(true, lineChartData, "Line-Chart data is fetched.", 200));
            })
            .catch((err) => {
                console.error(err);
                return res.json(response.JsonMsg(false, null, "Failed to fetch data", 500));
            });
    },

    zoneWiseInstallationsSellsBarChart: (req, res) => {
        const type       = req.query.type;
        const fiscalYear = req.query.fiscal_year || null;
        const month      = req.query.month ? parseInt(req.query.month) : null;
        const zoneFilter = services.smart_tyre_dashboard.getZoneFilter(req.user);

        let startDate, endDate;

        if (type === "MTD") {
            startDate = moment().startOf("month").toDate();
            endDate = moment().endOf("month").toDate();
        } else if (type === "custom" && fiscalYear) {
            const startYear = parseInt(fiscalYear.split("-")[0]);
            const endYear   = startYear + 1;
            if (month) {
                const calendarMonth = month;
                const calendarYear  = month >= 4 ? startYear : endYear;
                startDate  = moment({ year: calendarYear, month: calendarMonth - 1, date: 1 }).toDate();
                endDate    = moment(startDate).endOf("month").toDate();
            } else {
                startDate  = moment({ year: startYear, month: 3, date: 1 }).toDate();  // Apr 1
                endDate    = moment({ year: endYear,   month: 2, date: 31 }).toDate(); // Mar 31
            }
        }else{
            startDate=dateHelper.fyYearStart();
            endDate = null;
        }
        // Two separate match queries — different date field names per collection
        const installationMatchQuery = endDate
            ? { installationDate: { $gte: startDate, $lte: endDate }, zone: { $ne: null }, ...zoneFilter  }
            : { installationDate: { $gte: startDate }, zone: { $ne: null }, ...zoneFilter };

        const sellsMatchQuery = endDate
            ? { billingDate: { $gte: startDate, $lte: endDate }, zone: { $ne: null }, ...zoneFilter }
            : { billingDate: { $gte: startDate }, zone: { $ne: null }, ...zoneFilter };

        const lastMonthLabel=moment().format("MMM-YYYY");
        const fyYearLabel=dateHelper.fyYearLabel();

        return services.smart_tyre_dashboard.zoneWiseInstallationsSellsBarChart(installationMatchQuery, sellsMatchQuery).then((data) => {
            const { installations, sells } = data;
            const barChartData ={
                labels:{
                    lastMonthLabel:lastMonthLabel,
                    fyYearLabel:fyYearLabel
                },
                installations,
                sells
            }
            return res.json(response.JsonMsg(true, barChartData, "Bar-Chart data is fetched", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    dealerInstallationsSellsTable: (req, res) => {
        const now = moment();
        const zoneFilter = services.smart_tyre_dashboard.getZoneFilter(req.user);

        const yesterdayStart = now.clone().subtract(1, "day").startOf("day").toDate();
        const yesterdayEnd   = now.clone().subtract(1, "day").endOf("day").toDate();
        const lastMonthStart = now.clone().subtract(1, "month").startOf("month").toDate();
        const lastMonthEnd   = now.clone().subtract(1, "month").endOf("month").toDate();
        const mtdStart = now.clone().startOf("month").toDate();
        const mtdEnd   = now.clone().endOf("month").toDate();
        const ytdStart    = dateHelper.fyYearStart();
        const todayEnd       = now.clone().endOf("day").toDate();

        const lastMonthLabel = now.clone().subtract(1, "month").format("MMM-YYYY");
        const mtdLabel = now.clone().format("MMM-YYYY");
        const ytdLabel    = dateHelper.fyYearLabel();

        const yesterdayQuery    = { installationDate: { $gte: yesterdayStart, $lte: yesterdayEnd }, ...zoneFilter };
        const lastMonthQuery    = { installationDate: { $gte: lastMonthStart, $lte: lastMonthEnd }, ...zoneFilter };
        const mtdQuery    = { installationDate: { $gte: mtdStart, $lte: mtdEnd }, ...zoneFilter };
        const ytdQuery       = { installationDate: { $gte: ytdStart,    $lte: todayEnd     }, ...zoneFilter };

        const yesterdaySellQuery = { billingDate: { $gte: yesterdayStart, $lte: yesterdayEnd }, ...zoneFilter };
        const lastMonthSellQuery    = { billingDate: { $gte: lastMonthStart, $lte: lastMonthEnd }, ...zoneFilter };
        const mtdSellQuery = { billingDate: { $gte: mtdStart, $lte: mtdEnd }, ...zoneFilter };
        const ytdSellQuery    = { billingDate: { $gte: ytdStart,    $lte: todayEnd     }, ...zoneFilter };

        return Promise.all([
            services.smart_tyre_dashboard.getInstallationCount(yesterdayQuery),
            services.smart_tyre_dashboard.getInstallationCount(lastMonthQuery),
            services.smart_tyre_dashboard.getInstallationCount(mtdQuery),
            services.smart_tyre_dashboard.getInstallationCount(ytdQuery),
            services.smart_tyre_dashboard.getSellsCount(yesterdaySellQuery),
            services.smart_tyre_dashboard.getSellsCount(lastMonthSellQuery),
            services.smart_tyre_dashboard.getSellsCount(mtdSellQuery),
            services.smart_tyre_dashboard.getSellsCount(ytdSellQuery),
        ]).then(([iYesterday,ilastMonth, iMTD, iYTD, sYesterday,slastMonth, sMTD, sYTD]) => {
            const data = {
                labels: {
                    lastMonthLabel,
                    mtdLabel,
                    ytdLabel
                },
                installations: {
                    yesterday: iYesterday[0]?.count ?? 0,
                    lastMonth:ilastMonth[0]?.count?? 0,
                    mtd: iMTD[0]?.count ?? 0,
                    ytd:    iYTD[0]?.count    ?? 0
                },
                sells: {
                    yesterday: sYesterday[0]?.count ?? 0,
                    lastMonth:slastMonth[0]?.count?? 0,
                    mtd: sMTD[0]?.count ?? 0,
                    ytd:    sYTD[0]?.count    ?? 0
                }
            };
            return res.json(response.JsonMsg(true, data, "Dealer Installations and sells data is fetched.", 200));
        }).catch((err) => {
            console.error(err);
            return res.json(response.JsonMsg(false, null, "Failed to fetch data", 500));
        });
    },

    getTop5SmartTyreInstallation: (req, res) => {
        let filter = req.query.filter;
        const zoneFilter = services.smart_tyre_dashboard.getZoneFilter(req.user);
        let type = req.query.type;
        const fiscalYear = req.query.fiscal_year || null;
        const month      = req.query.month ? parseInt(req.query.month) : null;
        let startDate,endDate;
        let query = {customerCode: {$ne: null}};
        let groupId = {}, projection = {}, count = {};
        let limit;

        if(filter === "Dealers"){
            query = {customerCode: {$ne: null}, ...zoneFilter};
            groupId = { customerCode: "$customerCode", dealerShopName: "$dealerShopName" };
            projection = { customerCode: "$_id.customerCode", dealerShopName: "$_id.dealerShopName" };
            limit=5;
            count={$sum: 1};
        }else if(filter === "Zones"){
            query ={zone: { $ne: null }, ...zoneFilter};
            groupId = "$zone";
            projection =  { zone: "$_id" };
            limit=6;
            count= {$sum: "$installationCount"}
        }else if(filter === "Regions"){
            query ={regionName: { $ne: null }, customerCode: {$ne: null}, ...zoneFilter};
            groupId = "$regionName";
            projection =  { regionName: "$_id" };
            limit=6;
            count={$sum: 1};
        }else if(filter === "MakeModels"){
            query ={manufacturerName: { $ne: null }, vehicleModelNo: { $ne: null }, customerCode: {$ne: null}, ...zoneFilter};
            groupId = { make: "$manufacturerName", model: "$vehicleModelNo" };
            projection ={ make: "$_id.make", model: "$_id.model" };
            limit=5;
            count={$sum: 1};
        }

        // here else is all time
        if (type === "MTD") {
            startDate = moment().startOf("month").toDate();
            endDate = moment().endOf("month").toDate();
            Object.assign(query, {installationDate: {$gte: startDate, $lte: endDate}});
        } else if (type === "YTD") {
            startDate = dateHelper.fyYearStart();
            endDate = moment().endOf("day").toDate();
            Object.assign(query, {installationDate: { $gte: startDate, $lte: endDate }});
        } else if (type === "custom" && fiscalYear) {
            const startYear = parseInt(fiscalYear.split("-")[0]);
            const endYear   = startYear + 1;
            if (month) {
                const calendarMonth = month;
                const calendarYear  = month >= 4 ? startYear : endYear;
                startDate  = moment({ year: calendarYear, month: calendarMonth - 1, date: 1 }).toDate();
                endDate    = moment(startDate).endOf("month").toDate();
                Object.assign(query, {installationDate: {$gte: startDate, $lte: endDate}});
            } else {
                startDate  = moment({ year: startYear, month: 3, date: 1 }).toDate();  // Apr 1
                endDate    = moment({ year: endYear,   month: 2, date: 31 }).toDate(); // Mar 31
                Object.assign(query, {installationDate: {$gte: startDate, $lte: endDate}});
            }
        }
        return services.smart_tyre_dashboard.getTop5SmartTyreInstallation(query,groupId, projection,limit,count,filter).then((data)=>{
            return res.json(response.JsonMsg(true,data, "Dealer Installations Data for top 5 regions", 200));
        }).catch((err)=>{
            console.error(err);
            return res.json(response.JsonMsg(false, null , "Failed to fetch data", 500));
        })
    },

    uploadDealerSellExcel: (req, res) => {
        const deleteFile = (filePath) => {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        };
        if (!req.file) {
            return res.json(response.JsonMsg(false, null, "No file uploaded", 400));
        }
        let rows;
        try {
            const workbook = XLSX.readFile(req.file.path);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(sheet);

            if (!rows.length) {
                deleteFile(req.file.path);
                return res.json(response.JsonMsg(false, null, "Empty file", 400));
            }
        } catch (err) {
            deleteFile(req.file.path);
            return res.json(response.JsonMsg(false, null, "Invalid Excel file", 400));
        }
        return services.smart_tyre_dashboard.uploadDealerSellExcel(rows)
            .then(result => {
                deleteFile(req.file.path);
                return res.json(response.JsonMsg(true, result.length, "Excel uploaded successfully", 200));
            })
            .catch(err => {
                deleteFile(req.file.path);
                return res.json(response.JsonMsg(false, null, err.message, 400));
            });
    }
}
