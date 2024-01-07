import multer, { diskStorage } from "multer";

const storage = diskStorage({
    destination(req, file, callback) {
        callback(null, "upload");
    },
    filename(req, file, callback) {
        callback(null, file.originalname);
    }
});

export const singleUpload = multer({storage}).single("photo")