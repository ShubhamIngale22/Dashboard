const dbURL = {    "database":  process.env.DB_URL || "mongodb://127.0.0.1:27017/dashboardDB" };

const PORT = {
    "port": process.env.PORT || 5000
}
const FILE_UPLOAD = {
    uploadPath:"uploads/"
};

module.exports = {
    'dbURL': dbURL,
    'PORT': PORT,
    'FILE_UPLOAD':FILE_UPLOAD
};

