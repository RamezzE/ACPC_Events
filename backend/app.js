import express from "express";
import session from "express-session";

import dotenv from "dotenv";
import mongooseConnectionPromise from "./db.js";

import admin_router from "./routes/admin.js";
import country_router from "./routes/country.js";
import team_router from "./routes/team.js";
import attack_router from "./routes/attack.js";
import warzone_router from "./routes/warzone.js";
import user_router from "./routes/user.js";

const app = express();

app.use(session({
  secret: 'idk_whats_this',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.json());

dotenv.config({ path: "./.env" });

app.set("env", process.env.ENV);
app.set("port", process.env.PORT);
app.set("host", process.env.HOST);

mongooseConnectionPromise
  .then(() => {
    // Database connection is established, start your Express server
    app.listen(process.env.PORT, () => {
      console.log("Server is up and running");
      console.log(`Listening on ${process.env.HOST}:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    // Handle error if database connection fails
    console.error("Error connecting to MongoDB:", err);
  });

app.get("/", (req, res, next) => {
  res.send("Server is up and running");

});



app.use("/users", user_router);
app.use("/admins", admin_router);
app.use("/teams", team_router);
app.use("/countries", country_router);
app.use("/attacks", attack_router);

app.use("/warzones", warzone_router);

