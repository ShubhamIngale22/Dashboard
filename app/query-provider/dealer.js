module.exports={
    getLineChartDealerInstallations : (startDate, format) => {
        return [
            {
                $match: {
                    installationDate: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: format,
                            date: "$installationDate"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]
    },

    getZoneWiseDealerInstallation:(startDate,endDate)=>{
        return [
            {
                $match:{
                    installationDate:{$gte:startDate , $lte:endDate}
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

    getDealerInstallation : (yesterdayStart,yesterdayEnd,lastMonthStart,lastMonthEnd,lastYearStart,lastYearEnd) => {

        return [
            {
                $facet: {
                    yesterday: [
                        {
                            $match: {
                                installationDate: {
                                    $gte: yesterdayStart,
                                    $lte: yesterdayEnd
                                }
                            }
                        },
                        { $count: "count" }
                    ],

                    lastMonth: [
                        {
                            $match: {
                                installationDate: {
                                    $gte: lastMonthStart,
                                    $lte: lastMonthEnd
                                }
                            }
                        },
                        { $count: "count" }
                    ],

                    lastYear: [
                        {
                            $match: {
                                installationDate: {
                                    $gte: lastYearStart,
                                    $lte: lastYearEnd
                                }
                            }
                        },
                        { $count: "count" }
                    ]
                }
            }
        ]
    },

    getTop5DealerInstallation: () => {
        return [
            {
                $match: {
                    dealerShopName: { $ne: null }
                }
            },
            {
                $group: {
                    _id: "$dealerShopName",
                    count: { $sum: 1 }
                },
            },
            {
                $sort: {count:-1}
            },
            {
                $limit:5
            },
            {
                $project:{
                    _id:0,
                    dealerShopName:"$_id",
                    count:1
                }
            }

        ]
    },

    getTop5MakeModel: ()=>{
        return [
            {
                $match: {
                    manufacturerName: { $ne: null },
                    vehicleModelNo: { $ne: null }
                }
            },
            {
                $group: {
                    _id:{
                        make:"$manufacturerName",
                        model:"$vehicleModelNo"
                    } ,
                    count: { $sum: 1 }
                },
            },
            {
                $sort: {count:-1}
            },
            {
                $limit:5
            },
            {
                $project:{
                    _id:0,
                    make:"$_id.make",
                    model:"$_id.model",
                    count:1
                }
            }
        ]
    },

    getTop5region : () => {
        return [
            {
                $match: {
                    regionName: { $ne: null }
                }
            },
            {
                $group: {
                    _id: "$regionName",
                    count: { $sum: 1 }
                },
            },
            {
                $sort: {count:-1}
            },
            {
                $limit:5
            },
            {
                $project: {
                    _id: 0,
                    regionName: "$_id",
                    count: 1
                }
            }

        ]
    },

    getTop5zone : () => {
        return [
            {
                $match: {
                    zone: { $ne: null }
                }
            },
            {
                $group: {
                    _id: "$zone",
                    count: { $sum: 1 }
                },
            },
            {
                $sort: {count:-1}
            },
            {
                $limit:5
            },
            {
                $project: {
                    _id: 0,
                    zone: "$_id",
                    count: 1
                }
            }
        ]
    }

}
