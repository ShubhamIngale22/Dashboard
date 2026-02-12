const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const http = require("http");

const { connectDB } = require("./db/config");
const { PORT } = require("./app/constant/constant");

//create dir
const dir = "./logger_logs";
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

const app = express();

app.use(cors());
app.options("", cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// If you don't have /public, you can remove this line
app.use(express.static(__dirname + "/public"));

const api = require("./app/routes/api")(app, express);
app.use("/api", api);

const httpServer = http.createServer(app);

// Start only after DB is connected
connectDB()
    .then(() => {
        httpServer.listen(PORT.port, () => {
            console.log(`Server running on port ${PORT.port}`);
        });
    })
    .catch((err) => {
        console.error("Failed to start server (DB connection error):", err?.message || err);
        process.exit(1);
    });
