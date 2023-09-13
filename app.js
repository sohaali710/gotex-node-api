let express = require('express')
let app = express();
const dotenv = require('dotenv')
dotenv.config({ path: '.env' })
const bodyParser = require('body-parser');
const multer = require('multer')
const cors = require('cors');
let morgan = require('morgan')
app.use(morgan('combined'))

const { dbConnection } = require('./db/mongoose');
const { upload, uploadClintReceipts } = require('./middleware/fileUpload')

const adminRoute = require('./routes/admin')
const userRoute = require('./routes/user')
const saeeRoute = require('./routes/saee')
const imileRoute = require('./routes/imile')
// const companiesRoute = require('./routes/companies')

const PORT = process.env.PORT

// Middlewares
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors({
    origin: 'gotex-app2.vercel.app',
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));

// Connect with database
dbConnection()

// File Upload
app.post('/user/signup', upload.array('cr'));
// app.post('/invitation/invited-user-signup', upload.array('cr'));

// Routes
app.use('/admin', adminRoute);
app.use('/user', userRoute);
app.use("/saee", saeeRoute);
app.use("/imile", imileRoute);
// app.use('/companies', companiesRoute);

app.all("*", (req, res, next) => {
    res.status(400).json({ msg: `Can't ${req.method} with this route: ${req.originalUrl}` })
})


app.listen(PORT, () => console.log('Server runs on : http://localhost:' + PORT));