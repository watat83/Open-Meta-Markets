// server.js

// set up ======================================================================
// get all the dependencies we need
var express = require("express");
var app = express();
var path = require("path");
var port = process.env.PORT || new Date().getFullYear();
var mongoose = require("mongoose");
const cors = require("cors");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var favicon = require("serve-favicon");
require("dotenv").config();

mongoose.Promise = global.Promise;

// configuration ===============================================================
const { MONGODB_ATLAS_URL } = process.env;
const pathURL = __dirname + "/public";

// connect to the database

mongoose.connect(
  MONGODB_ATLAS_URL,
  {
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  },
  function (err, db) {
    if (err) {
      console.log(err);
    } else {
      console.log(
        "The ADMIN 👉  " +
          db.connection.user +
          " just connected to database..." +
          db.connection.name +
          " on PORT " +
          db.connection.port
      );
      // db.close();
    }
  }
);

// set the static files location /public/img will be /img for users
// app.use(express.static(__dirname + '/public'));

// set the favicon
app.use(favicon("favicon.ico"));

app.use(morgan("dev")); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  bodyParser.json({
    type: "application/vnd.api+json",
  })
); // parse application/vnd.api+json as json
app.use(
  bodyParser.json({
    type: "application/*+json",
  })
); // parse application/vnd.api+json as json
app.use(methodOverride()); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT

app.use(function (req, res, next) {
  var pattern = /.(ttf|otf|eot|woff|jpg|png|jpeg|gif|js|json|html|css|pdf)/;
  if (pattern.test(req.url)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,Content-Type,  Accept ,Origin,Authorization,User-Agent, DNT,Cache-Control, X-Mx-ReqToken, Keep-Alive, If-Modified-Since"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
  }
  next();
});

// Set API Request Limiter
let APIRateLimit = require("express-rate-limit");
app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)
var apiLimiter = new APIRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,
  delayMs: 0, // disabled
});

app.use("/uploads", express.static("uploads"));
app.use("/business-uploads", express.static("business-uploads"));
app.use(express.static(pathURL));
app.use(express.static(path.join(__dirname, "public")));

// only apply to requests that begin with /api/
app.use("/api/", apiLimiter);

// routes ======================================================================
// API Routes load

// Account Routes
const account = require("./app/routes/account");
app.use("/api/accounts", account);

// NFT Collection Routes
const { routerNFTCollection } = require("./app/routes/nft");
app.use("/api/nftCollections", routerNFTCollection);

// NFT Serial Routes
const { routerNFTSerial } = require("./app/routes/nft");
app.use("/api/nftSerials", routerNFTSerial);

// Job Smart Contract Routes
const { routerJobSmartContract } = require("./app/routes/job");
app.use("/api/jobSmartContracts", routerJobSmartContract);

// Jobs Routes
const { routerJob } = require("./app/routes/job");
app.use("/api/jobs", routerJob);

// Job-Account Routes
const { routerAccountJob } = require("./app/routes/job");
app.use("/api/job-account", routerAccountJob);

app.use("/api", require("./app/api"));

// serve the homepage
app.get("*", (req, res) => {
  console.log("Welcome to the Open Meta Markets");
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
  console.log(pathURL + "/index.html");
});

// error handlers
// Catch unauthorised errors
app.use(function (err, req, res, next) {
  // var ip = req.headers['x-forward-for'] || req.connection.remoteAddress;
  // console('Client IP:', ip);
  if (err.name === "UnauthorizedError") {
    res.status(401);
    res.json({
      message: err.name + ": " + err.message,
    });
  }
  next();
});

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
});

// launch ======================================================================
app.listen(port);
console.log("Backend Server is Live on port " + port);

// expose API
exports = module.exports = app;
