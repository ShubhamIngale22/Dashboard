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

    getDealerInstallation : (
        yesterdayStart,yesterdayEnd,
        lastMonthStart,lastMonthEnd,
        fyYearStart,todayEnd) => {
        return [
            {
                $facet: {
                    yesterday: [
                        {
                            $match: {
                                installationDate: {
                                    $gte: yesterdayStart,
                                    $lte: yesterdayEnd
                                },
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

                    fyYear: [
                        {
                            $match: {
                                installationDate: {
                                    $gte: fyYearStart,
                                    $lte: todayEnd
                                }
                            }
                        },
                        { $count: "count" }
                    ]
                }
            }
        ]
    },

    getDealerSells : (
        yesterdayStart,yesterdayEnd,
        lastMonthStart,lastMonthEnd,
        fyYearStart,todayEnd) => {
        return [
            {
                $facet: {
                    yesterday: [
                        {
                            $match: {
                                billingDate: {
                                    $gte: yesterdayStart,
                                    $lte: yesterdayEnd
                                }
                            }
                        },
                        {
                            $group:{
                                _id:null,
                                count: { $sum: "$quantity" }
                            }
                        }
                    ],

                    lastMonth: [
                        {
                            $match: {
                                billingDate: {
                                    $gte: lastMonthStart,
                                    $lte: lastMonthEnd
                                }
                            }
                        },
                        {
                            $group:{
                                _id:null,
                                count: { $sum: "$quantity" }
                            }
                        }
                    ],

                    fyYear: [
                        {
                            $match: {
                                billingDate: {
                                    $gte: fyYearStart,
                                    $lte: todayEnd
                                }
                            }
                        },
                        {
                            $group:{
                                _id:null,
                                count: { $sum: "$quantity" }
                            }
                        }
                    ]
                }
            }
        ]
    },

    getTop5DealerInstallation: (query) => {
        return [
            {
                $match: query
            },
            {
                $group: {
                    _id: {
                        customerCode: "$customerCode",
                        dealerShopName: "$dealerShopName"
                    },
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
                    dealerShopName: "$_id.dealerShopName",
                    customerCode: "$_id.customerCode",
                    count:1
                }
            }

        ]
    },

    getTop5MakeModel: (query)=>{
        return [
            {
                $match: query
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
