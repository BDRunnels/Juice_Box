// api/index.js
const express = require('express');
const apiRouter = express.Router();
const postsRouter = require("./posts");
const usersRouter = require("./users");
const tagsRouter = require("./tags");
const jwt = require("jsonwebtoken");
const { getUserByUsername } = require("../db");
const { JWT_SECRET } = process.env;

apiRouter.use(async (req, res, next) => {
    const prefix = "Bearer ";
    const auth = req.header("Authorization");
    // console.log(auth);
    if (!auth) {
        next();
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);
        console.log(token);
        try {
            const {username} = jwt.verify(token, JWT_SECRET);
            // console.log(tokenResponse);
            if (username) {
                req.user = await getUserByUsername(username);
                next();
            }
        } catch ({name, message}) {
            next({name, message});
        }
    } else {
        next({
            name: "AuthorizationHeaderError",
            message: `Authorization token must start with ${prefix}`
        });
    }
});

apiRouter.use((req,res,next) => {
    if (req.user) {
        console.log("User is set:", req.user);
    }

    next();
});

apiRouter.use("/users", usersRouter);
apiRouter.use("/posts", postsRouter);
apiRouter.use("/tags", tagsRouter);


apiRouter.use((error,req,res,next) => {
    res.send({
        name: error.name,
        message: error.message
    });
});

module.exports = apiRouter;