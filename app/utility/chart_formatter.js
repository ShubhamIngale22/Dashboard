module.exports = {
    combinedLineChart: (installations, sells) => {

        const installMap = {};
        const sellMap = {};

        installations.forEach(item => {
            installMap[item._id] = item.count;
        });

        sells.forEach(item => {
            sellMap[item._id] = item.count;
        });

        // Union of all labels
        const labels = [
            ...new Set([
                ...Object.keys(installMap),
                ...Object.keys(sellMap)
            ])
        ].sort();

        return {
            labels,
            installations: labels.map(label => installMap[label] ?? 0),
            sells: labels.map(label => sellMap[label] ?? 0)
        };
    }
};
