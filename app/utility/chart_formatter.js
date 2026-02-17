module.exports = {
    combinedLineChart: (installations, sells) => {

        const installMap = {};
        const sellMap = {};
        const labelsMap={};

        installations.forEach(item => {
            installMap[item._id] = item.count;
            labelsMap[item._id]=item.displayLabel;
        });

        sells.forEach(item => {
            sellMap[item._id] = item.count;
            labelsMap[item._id]=item.displayLabel;
        });

        // Union of all labels
        const sortKeys = [
            ...new Set([
                ...Object.keys(installMap),
                ...Object.keys(sellMap)
            ])
        ].sort();

        return {
            labels:sortKeys.map(k => labelsMap[k]),
            installations: sortKeys.map(k => installMap[k] ?? 0),
            sells: sortKeys.map(k => sellMap[k] ?? 0)
        };
    }
};
