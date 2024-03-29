const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const authRouter = require('./routes/authRoutes');

const app = express();

// Set security HTTP headers
app.use(helmet());
app.use(morgan());
app.use(express.json()); // for parsing application/json
app.use(cors()); // enable CORS
// data santiziation against cross-site-script attacks (xss)
app.use(xss());

// routes
app.use('/api/v2/auths', authRouter);

module.exports = app;