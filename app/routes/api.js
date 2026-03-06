const upload = require("../utility/upload_middleware");
const dashboard=require("../functionality/dashboard");
const authentication=require('../utility/authentication');

module.exports = (app, express) => {
    let api = express.Router();

    api.get('/sellsInstallationsLineChart',(req, res) => {
        dashboard.sellsInstallationsLineChart(req, res);
    });

    api.get('/zoneWiseInstallationsSellsBarChart',(req, res) => {
        dashboard.zoneWiseInstallationsSellsBarChart(req, res);
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

    api.post('/loginUser', (req, res) => {
        dashboard.loginUser(req, res);
    });

    api.use(authentication);

    api.post('/addUser', (req, res) => {
        dashboard.addUser(req, res);
    });

    return api;
}

