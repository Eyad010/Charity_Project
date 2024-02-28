const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const xss = require("xss-clean");
const beneFactorRouter = require("./routes/beneFactorRoutes");
const OrganizationRouter = require("./routes/authOrganizationRoutes");
const talabatRouter = require("./routes/talabatRouter");
const itemsRouter = require("./routes/itemsRouter");

const app = express();

// Set security HTTP headers
app.use(helmet());
app.use(morgan());
app.use(express.json()); // for parsing application/json
app.use(cors()); // enable CORS
// data santiziation against cross-site-script attacks (xss)
app.use(xss());

// routes
app.use("/api/v2/beneFactor", beneFactorRouter);
app.use("/api/v2/authOrganization", OrganizationRouter);
app.use("/api/v2/talabat", talabatRouter);
app.use("/api/v2/items", itemsRouter);

module.exports = app;
