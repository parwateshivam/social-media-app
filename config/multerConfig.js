import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(req.user)
    console.log(file)
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    let unique = Date.now() + "-" + file.originalname
    cb(null, unique)
  }
})

const upload = multer({ storage })

export { upload }