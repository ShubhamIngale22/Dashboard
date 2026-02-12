module.exports={
    lineChart : (data) => {
        return {
            labels: data.map(item => item._id),
            data: data.map(item => item.count)
        };
    }
}

