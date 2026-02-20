module.exports={
    getLineChartDealerInstallations: (startDate, format, sortFormat) => {
        return [
            { $match: { installationDate: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: sortFormat, date: "$installationDate" } // e.g. "2025-01"
                    },
                    displayLabel: {
                        $first: {
                            $dateToString: { format: format, date: "$installationDate" } // e.g. "Jan 2025"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }  // sorts correctly on "2025-01", "2025-02" etc.
        ]
    },

    getLineChartDealerSells: (startDate, format, sortFormat) => {
        return [
            { $match: { billingDate: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: sortFormat, date: "$billingDate" }
                    },
                    displayLabel: {
                        $first: {
                            $dateToString: { format: format, date: "$billingDate" }
                        }
                    },
                    count: {$sum:"$quantity"}
                }
            },
            { $sort: { _id: 1 } }
        ]
    },

    getZoneWiseDealerInstallation:(startDate,endDate)=>{
        return [
            {
                $match:{
                    installationDate:{$gte:startDate , $lte:endDate},
                    zone:{$ne:null}
                }
            },
            {
                $group:{
                    _id:"$zone",
                    count:{$sum:1}
                }
            },
            {
                $project:{
                    _id:0,
                    zone:"$_id",
                    count:1
                }
            },
            {
                $sort:{
                    count:-1
                }
            }
        ]
    },

    getZoneWiseDealerSells:(startDate,endDate)=>{
        return [
            {
                $match:{
                    billingDate:{$gte:startDate , $lte:endDate},
                    zone:{$ne:null}
                }
            },
            {
                $group:{
                    _id:"$zone",
                    count:{$sum:"$quantity"}
                }
            },
            {
                $project:{
                    _id:0,
                    zone:"$_id",
                    count:1
                }
            },
            {
                $sort:{
                    count:-1
                }
            }
        ]
    },

    getInstallationCount: (query) => {
        return [
            { $match: query },
            { $count: "count" }
        ]
    },

    getSellsCount: (query) => {
        return [
            { $match: query },
            {
                $group: {
                    _id: null,
                    count: { $sum: "$quantity" }
                }
            }
        ]
    },

    // ─── TOP 5 PIPELINES ──────────────────────────────────────────────────────────
    getTop5SmartTyreInstallation: (query, groupId, projection) => {
        return [
            {$match: query},
            {
                $group: {
                    _id: groupId,
                    count: {$sum: 1}
                }
            },
            {$sort: {count: -1}},
            {$limit: 5},
            {
                $project: {
                    _id: 0,
                    ...projection,
                    count: 1
                }
            }
        ];
    }
}
