import { Router } from "express"
import createError from "http-errors"
import User from "./schema.js";
import { JWTAuthMiddleware } from "../auth/middlewares.js"
import q2m from "query-to-mongo"

const usersRouter = Router()

usersRouter.post("/register", async (req, res, next) => {
    try {
        const newUser = new User(req.body);
        const { _id } = await newUser.save();
        res.status(201).send({ _id });
    } catch (error) {
        next(error);
    }
});

//************* CHECKS CREDENTIALS, RETURNS NEW ACCESS TOKEN *************** \\

usersRouter.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.checkCredentials(email, password);
        if (user) {
            const accessToken = await JWTAuthenticate(user);
            res.send({ accessToken });
        } else {
            next(createError(401, "Credentials not valid!"));
        }
    } catch (error) {
        next(error);
    }
});

//************* GET ALL USERS *************** \\

usersRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const users = await getUser.find({});
        res.send(users);
    } catch (error) {
        next(createError(500, "An error occurred while getting users"));
    }
});

// ************* GET LOGGED IN USER INFO *************** \\

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {
        res.send(req.user);
    } catch (error) {
        console.log(error);
        next(createError(500, "An error occurred while finding you"));
    }
});

// ************* GET SPECIFIC USER BY ID *************** \\

usersRouter.get("/:id", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const author = await User.getUser(req.params.id);
        author ? res.send(author) : next(createError(404, `User ${req.params.id} not found`));
    } catch (error) {
        next(error);
    }
});

// ************* UPDATE USER INFO BY ID *************** \\

usersRouter.put("/:id", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const userId = req.params.id.toString()
        const myId = req.user._id.toString()

        if (userId === myId) {
            const updatedUser = await User.findOneAndUpdate({ _id: myId }, req.body, { new: true, runValidators: true })
            if (updatedUser) {
                res.send(updatedUser)
            } else {
                next(createError(404, `User Not Found!`))
            }
        } else {
            next(createError(404, `You are not authorized!`))
        }
    } catch (error) {
        next(error)
    }

});

// ************* DELETE USER BY ID *************** \\

usersRouter.delete("/:id", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const userId = req.params.id.toString()
        const myId = req.user._id.toString()

        if (userId === myId) {
            const deletedUser = await User.findOneAndDelete({ _id: myId })
            if (deletedUser) {
                res.status(204).send()
            } else {
                next(createError(404, `User Not Found!`))
            }
        } else {
            next(createError(404, `You are not authorized!`))
        }
    } catch (error) {
        next(error)
    }

});


export default usersRouter