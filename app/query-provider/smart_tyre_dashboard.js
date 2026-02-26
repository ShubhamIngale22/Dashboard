module.exports={
    getLineChartDealerInstallations: (matchQuery, format, sortFormat) => {
        return [
            { $match: matchQuery },
            {
                $group: {
                    _id: { $dateToString: { format: sortFormat, date: "$installationDate" } },
                    displayLabel: {
                        $first: { $dateToString: { format: format, date: "$installationDate" } }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ];
    },

    getLineChartDealerSells: (matchQuery, format, sortFormat) => {
        return [
            { $match: matchQuery },
            {
                $group: {
                    _id: { $dateToString: { format: sortFormat, date: "$billingDate" } },
                    displayLabel: {
                        $first: { $dateToString: { format: format, date: "$billingDate" } }
                    },
                    count: { $sum: "$quantity" }   // sum of quantity, not count of docs
                }
            },
            { $sort: { _id: 1 } }
        ];
    },

    getZoneWiseDealerInstallation:(installationMatchQuery)=>{
        return [
            {
                $match:installationMatchQuery
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

    getZoneWiseDealerSells:(sellsMatchQuery)=>{
        return [
            {
                $match:sellsMatchQuery
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
    getTop5SmartTyreInstallation: (query, groupId, projection,limit) => {
        return [
            {$match: query},
            {
                $group: {
                    _id: groupId,
                    count: {$sum: 1}
                }
            },
            {$sort: {count: -1}},
            {$limit: limit},
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
