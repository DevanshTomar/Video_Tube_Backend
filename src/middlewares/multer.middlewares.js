import multer from 'multer'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), './public/temp')


//save on my server
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_DIR)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      // check back the field name
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})


  
export const upload = multer({ storage })