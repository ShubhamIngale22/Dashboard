const services =  require("../services/index");
const cron = require("node-cron");

module.exports={
    generateInstallationSummary: () => {
        let task = cron.schedule('*/1 * * * *', () => {  //  IST
            console.log('Running a task of SmartTyre Installation Summary.');
            for (let i = 0; i <= 444; i++) {
                services.smart_tyre_dashboard.generateInstallationSummary(i);
            }

        },{scheduled:false});
        task.start();
    },
}
