const express = require('express');
const dbConnect = require('./config/dbConnect');
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;
const bodyparser = require('body-parser');
const session = require('express-session');
const nocache = require('nocache');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');

dbConnect();
const app = express();
app.use(bodyparser.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(flash());
app.use(nocache());
app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL, collection: 'SessionDB' }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 10,
        },
    }),
);

//====== view engine ========
app.set('view engine', 'ejs');
app.set('views', './views/users');

//........ User Routes .......
const userRouter = require('./routes/userRouter');
app.use('/', userRouter);

//........ Admin Routes ........
const adminRouter = require('./routes/adminRouter');
app.use('/admin', adminRouter);

app.use('*', (req, res) => {
    res.render('404');
});

app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
});
