const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

//to make undisconnect db
const db = mysql.createConnection({
  user: "usrldok6l26m1shb",
  host: "b49bwrnqfdny2lwumg8t-mysql.services.clever-cloud.com",
  password: "rvr1l2JFfU48xp7FD0NE",
  database: "b49bwrnqfdny2lwumg8t",
});
db.connect();

//to register
app.post("/register", (req, res) => {
  const username = req.body.username;
  const phone_number = req.body.phone_number;
  const password = req.body.password;

  //encrypt password
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }

    db.query(
      "INSERT INTO users_tbl (username, phone_number, password) VALUES (?,?,?)",
      [username, phone_number, hash],
      (err, result) => {
        console.log(err);
      }
    );
  });
});

// to login
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/login", (req, res) => {
  const phone_number = req.body.phone_number;
  const password = req.body.password;

  db.query(
    "SELECT * FROM users_tbl WHERE phone_number = ?;",
    phone_number,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            req.session.user = result;
            console.log(req.session.user);
            res.send(result);
            
          } else {
            res.send({ message: "Wrong username/password combination!" });
          }
        });
      } else {
        res.send({ message: "User doesn't exist" });
      }
    }
  );
}); 


// to get data from json file store in mysql
app.get("/userDetail", (req, res) => {
    const sqlGet =  "SELECT * FROM users_tbl ORDER BY user_id DESC LIMIT 1;";
    db.query(sqlGet, (err, result) => {
      if (err) {
        res.send({ err: err });
      }else{
        res.send(result);
      }
    });
});

//post service
app.post("/posts", (req, res) => {
  const service = req.body.service;
  const service_name = req.body.service_name;
  const price = req.body.price;
  const description =  req.body.description;
  const image = req.body.image;
  const location_detail = req.body.location_detail;

    db.query(
      "INSERT INTO post (service, service_name, price, description, image, location_detail) VALUES (?,?,?,?,?,?)",
      [service, service_name, price, description, image, location_detail],
      (err, result) => {
        console.log(err);
      }
    );
  
});

app.listen(8800, () => {
  console.log("running server on port 8800");
});