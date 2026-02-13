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

    api.get('/top5DealerInstallationTable',(req, res) => {
        dashboard.top5DealerInstallationTable(req, res);
    });

    api.get('/top5MakeModelTable',(req, res) => {
        dashboard.top5MakeModelTable(req, res);
    });

    api.get('/top5regionTable',(req, res) => {
        dashboard.top5regionTable(req, res);
    });

    api.get('/top5ZoneTable',(req, res) => {
        dashboard.top5ZoneTable(req, res);
    });

    api.post('/uploadDealerSellExcel', upload.single('file'), (req, res) => {
        dashboard.uploadDealerSellExcel(req, res).then(()=>{});
    });

    return api;
}

