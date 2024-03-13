const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const xss = require("xss-clean");
const beneFactorRouter = require("./routes/beneFactorRoutes");
const OrganizationRouter = require("./routes/authOrganizationRoutes");
const talabatRouter = require("./routes/talabatRouter");
const itemsRouter = require("./routes/itemsRouter");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// Set security HTTP headers
app.use(helmet());
app.use(morgan());
app.use(express.json()); // for parsing application/json
app.use(cors()); // enable CORS
// data santiziation against cross-site-script attacks (xss)
app.use(xss());

// routes
// for the user who use the app
app.use("/api/v2/beneFactor", beneFactorRouter);
// for  organization that sign up to our platform and want to give access to admin in some points
app.use("/api/v2/authOrganization", OrganizationRouter);
// route for talabat API
app.use("/api/v2/talabat", talabatRouter);
// route for item related operations
app.use("/api/v2/items", itemsRouter);

// handle any rout does not exist in the server
app.all("*", (req, res, next) => {
  next(new AppError(`can not find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

module.exports = app;
