import express from "express";

import dotenv from "dotenv";
import mongooseConnectionPromise from "./db.js";

import TeamController from "./controllers/team_controller.js";
import UserController from "./controllers/user_controller.js";

import admin_router from "./routes/admin.js";
import country_router from "./routes/country.js";
import team_router from "./routes/team.js";
import attack_router from "./routes/attack.js";
import warzone_router from "./routes/warzone.js";

import Warzone from "./models/warzone.js";
import Team from "./models/team.js";
import Country from "./models/country.js";
import SuperAdmin from "./models/super_admin.js";

const app = express();

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

  const warzones = [
    {
      name: "Pacific Theater",
      number: 1,
      wars: [
        { name: "World War II", available: true },
        { name: "Korean War", available: false },
      ],
    },
    {
      name: "Middle East Conflict",
      number: 2,
      wars: [
        { name: "Gulf War", available: true },
        { name: "Iraq War", available: true },
      ],
    },
    {
      name: "European Front",
      number: 3,
      wars: [
        { name: "World War I", available: true },
        { name: "World War II", available: true },
      ],
    },
    {
      name: "Cold War Era",
      number: 4,
      wars: [
        { name: "Vietnam War", available: false },
        { name: "Cuban Missile Crisis", available: true },
      ],
    },
  ];

  // Zone.findOneAndDelete({ label: "Paraguay" }).then(() => {
  //   console.log("Zone deleted");
  // });

  // const newZone3 = new Zone({
  //   color: "#DDFDFF",
  //   label: "Paraguay",
  //   team_no: 3,
  //   points: pts,
  // });

  // newZone3
  //   .save()
  //   .then(() => {
  //     console.log("Zone created");
  //   })
  //   .catch((err) => {
  //     console.error("Error creating zone:", err);
  //   });

  // create admin user

  // const newAdmin = new Admin({
  //   name: "Ramez",
  //   password: "1",
  //   zone: "North Africa",
  // });

  const newSuperAdmin = new SuperAdmin ({
    name: "a",
    password: "1",
  });

  newSuperAdmin.save().then(() =>{
    console.log("Super Admin Created")
  }).catch((e) => {});

  // newAdmin.save().then(() => {
  //   console.log("Admin created");
  // }
  // ).catch((err) => {
  //   console.error("Error creating admin:", err);
  // });

  //   const africa = new Continent({
  //     name: 'South America',
  //     countryNames: ['Venezuela', 'Brazil', 'Peru', 'Bolivia', 'Paraguay', 'Argentina', 'Chile']
  //     // countryNames: ['Indonesia', 'New Guinea', 'Western Australia', 'Eastern Australia', 'New Zealand']
  //     // countryNames: ['North Africa', 'Egypt', 'East Africa', 'Central Africa', 'South Africa', 'Madagascar']
  // });
  // africa.save().then(() => {
  //     console.log('Africa continent with countries saved');
  // }).catch((err) => {
  //     console.error('Error saving Africa continent:', err);
  // });

  const countries = [
    {
      name: "South Africa",
      teamNo: 1,
    },
    {
      name: "Central Africa",
      teamNo: 2,
    },
    {
      name: "East Africa",
      teamNo: 3,
    },
    {
      name: "Egypt",
      teamNo: 4,
    },
    {
      name: "North Africa",
      teamNo: 5,
    },
    {
      name: "Madagascar",
      teamNo: 1,
    },
    {
      name: "New Zealand",
      teamNo: 2,
    },
    {
      name: "Western Australia",
      teamNo: 3,
    },
    {
      name: "Eastern Australia",
      teamNo: 4,
    },
    {
      name: "New Guinea",
      teamNo: 5,
    },
    {
      name: "Indonesia",
      teamNo: 1,
    },
    {
      name: "Brazil",
      teamNo: 2,
    },
    {
      name: "Venezuela",
      teamNo: 3,
    },
    {
      name: "Peru",
      teamNo: 4,
    },
    {
      name: "Bolivia",
      teamNo: 5,
    },
    {
      name: "Chile",
      teamNo: 1,
    },
    {
      name: "Argentina",
      teamNo: 2,
    },
    {
      name: "Paraguay",
      teamNo: 3,
    },
  ];

  // Country.insertMany(countries).then(() => {
  //   console.log('countries saved');
  // }).catch((err) => {
  //   console.error('Error saving countries:', err);
  // });
});

app.post("/login", UserController.login);

app.use("/admins", admin_router);
app.use("/teams", team_router);
app.use("/countries", country_router);
app.use("/attacks", attack_router);

app.use("/warzones", warzone_router);

