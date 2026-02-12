const upload = require("../utility/upload_middleware");
const dashboard=require("../functionality/dashboard");

module.exports = (app, express) => {
    let api = express.Router();

    api.get('/dealerInstallationLineChart',(req, res) => {
        dashboard.dealerInstallationLineChart(req, res);
    });

    api.get('/zoneWiseDealerInstallationsPie',(req, res) => {
        dashboard.zoneWiseDealerInstallationsPie(req, res);
    });

    api.get('/dealerInstallationTable',(req, res) => {
        dashboard.dealerInstallationTable(req, res);
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

