import {
    badRequestErrorHandler,
    catchAllErrorHandler,
    notFoundErrorHandler,
} from "./errorHandlers.js";

import cors from "cors";
import express from "express";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import usersRouter from "./users/users.js"

console.time("Server startup");
const server = express();
const port = process.env.PORT || 3069;


// ><><><><: MIDDLEWARES :><><><>< \\

server.use(express.json());
server.use(cors());

// ><><><><: ROUTES :><><><>< \\

server.use("/users", usersRouter);
console.table(listEndpoints(server));

// ><><><><: ERROR MIDDLEWARES :><><><>< \\

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(catchAllErrorHandler);

// ><><><><: MONGO TIME :><><><>< \\

mongoose.connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() =>
        server.listen(port, () => {
            console.log("🚀 server is running on port", port);
        })
    )
    .catch((err) => console.log(err));