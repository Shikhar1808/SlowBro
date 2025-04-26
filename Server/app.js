import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { dirname, join } from "path";
import { fileURLToPath } from "url";
console.log("app.js loaded")

import userRoutes from "./src/routes/userRoutes.js"
import courseRoutes from "./src/routes/courseRoutes.js";
import courseUserRoutes from "./src/routes/courseUserRoutes.js";
import courseContentRoutes from "./src/routes/courseContentRoutes.js";

// import connectDB from "./src/db/connectDB.js";
// await connectDB();

import cors from 'cors';
import {connectDbMiddleware} from "./src/middlewares/connectDbMiddleware.js";


const app = express();

app.set('trust proxy' , 20);
app.get('/ip', (request, response) => response.send(request.ip));
app.get('/x-forwarded-for', (request, response) => response.send(request.headers['x-forwarded-for']));
// app.use(rateLimiter);

const NUM_INSTANCES = 1;
const START_PORT = 8000;
app.use(cors(
    {
      // origin:["https://www.backslashtiet.com","https://backslashtiet.com"],
//    origin:["http://localhost:5173", "http://localhost:7001"],
    // origin: "*",
	    origin: function (origin, callback) {
    // Allow requests from frontend, no-origin (like mobile apps), or specific trusted origins
    if (
      !origin || // allow mobile apps or curl/postman
      origin === "https://frontend.topishukla.xyz" ||
      origin === "capacitor://localhost" || // for Ionic/Capacitor apps
      origin === "file://" // for Electron apps
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
    methods:["POST","GET"],
    credentials: true // Allow cookies to be sent with the request
  }
  ));




  
//static files folders
// connectDB();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(connectDbMiddleware)

app.use(userRoutes);
app.use(courseRoutes);
app.use(courseUserRoutes);
app.use(courseContentRoutes);
function startServers() {
    for (let i = 0; i < NUM_INSTANCES; i++) {
        const port = START_PORT + i;
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:`,port);
        });
    }
}

startServers();