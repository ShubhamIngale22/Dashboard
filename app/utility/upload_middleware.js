const multer = require('multer');
const dateHelper=require('../helpers/date_helper');
const {FILE_UPLOAD}=require('../constant/constant');

const path = require('path');

const storage=multer.diskStorage({
    destination:(req,file,cb)=> {
        cb(null, FILE_UPLOAD.uploadPath);
    },
    filename: (req,file,cb)=> {
        const timeStamp=dateHelper.nowIST().format('DD-MM-YYYY_hh-mm-ss');
        cb(null,`${timeStamp}${path.extname(file.originalname)}`);
    }
});

const fileFilter=(req,file,cb)=>{
    const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if(allowedTypes.includes(file.mimetype)){
        cb(null,true)
    }else{
        cb(new Error("Only excel/csv files are allowed to upload"),false);
    }
};

const upload=multer({storage,fileFilter});
module.exports= upload;
