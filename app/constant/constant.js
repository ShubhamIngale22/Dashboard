const dbURL = {    "database":  process.env.DB_URL || "mongodb://127.0.0.1:27017/dashboardDB" };

const PORT = {
    "port": process.env.PORT || 5000
}
const JWT_SECRET = process.env.JWT_SECRET || "9f3a4c8b1d0e7f5a9c2b6d8e3a1f4s5f7g3j5d6a0c8f2b1e4d9a7c5f3b8e6";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "1d";
const FILE_UPLOAD = {
    uploadPath:"uploads/"
};
const ROLE_PERMISSIONS = {
    1: [2],   // roleLevel 1 (Super System Admin) can add roleLevel 2 (System Admin)
    2: [3],   // roleLevel 2 (System Admin) can add roleLevel 3 (Admin)
    3: [4],   // roleLevel 3 (Admin) can add roleLevel 4 (ZM)
    4: []     // ZM cannot add anyone
};
module.exports = {
    'dbURL': dbURL,
    'PORT': PORT,
    'FILE_UPLOAD':FILE_UPLOAD,
    'JWT_SECRET':JWT_SECRET,
    'JWT_EXPIRE':JWT_EXPIRE,
    'ROLE_PERMISSIONS':ROLE_PERMISSIONS
};

