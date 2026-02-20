const upload = require("../utility/upload_middleware");
const dashboard=require("../functionality/dashboard");

module.exports = (app, express) => {
    let api = express.Router();

    api.get('/sellsInstallationsLineChart',(req, res) => {
        dashboard.sellsInstallationsLineChart(req, res);
    });

    api.get('/zoneWiseInstallationsSellsPie',(req, res) => {
        dashboard.zoneWiseInstallationsSellsPie(req, res);
    });

    api.get('/dealerInstallationsSellsTable',(req, res) => {
        dashboard.dealerInstallationsSellsTable(req, res);
    });

    api.get('/getTop5SmartTyreInstallation',(req, res) => {
        dashboard.getTop5SmartTyreInstallation(req, res);
    });

    api.post('/uploadDealerSellExcel', upload.single('file'), (req, res) => {
        dashboard.uploadDealerSellExcel(req, res).then(()=>{});
    });
    return api;
}

