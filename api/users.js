const express = require('express');
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
// const { token } = require('morgan');
const { getAllUsers, getUserByUsername, createUser, getUserById, updateUser } = require("../db");
const { requireUser, requireActiveUser } = require('./utils');

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");

//   res.send({ message: 'hello from /users!' });
    next();

});

// UPDATE
usersRouter.get("/", async (req, res) => {
    const users = await getAllUsers();

    res.send({
        users
    });
});

// usersRouter.post("/login", async (res, req, next) => {
//     console.log(req.body);
//     res.end();
// });

// LOGIN
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
  
    // request must have both
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }
  
    try {
      const user = await getUserByUsername(username);
  
      if (user && user.password == password) {
        // create token & return to user
        const token = jwt.sign(req.body, process.env.JWT_SECRET);

        res.send({ 
            message: "you're logged in!",
            token: token
        });


      } else {
        next({ 
          name: 'IncorrectCredentialsError', 
          message: 'Username or password is incorrect'
        });
      }
    } catch(error) {
      console.log(error);
      next(error);
    }
  });

// CREATE USER
usersRouter.post("/register", async (req, res, next) => {
    const {username, password, name, location} = req.body;

    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            next({
                name: "UserExistsError",
                message: "A user by that username already exists."
            });
        }

        const user = await createUser({
            username,
            password,
            name,
            location,
        });

        const token = jwt.sign({
            id: user.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: "1w"
        });

        res.send({
            message: "Thank you for signing up!",
            token
        });
    } catch ({name, message}) {
        next({name, message});
    }
});

// Delete User by Id
usersRouter.delete("/:userId", requireActiveUser, async (req,res,next) => {
    try {
        const { user } = await getUserById(req.params.userId)
        if (user && user.id === req.user.id) {
            const updateUser = await updateUser(user.id, {active: false});
            res.send({user: updateUser});
        } else {
            next(user ? {
                name: "Unauthorized User Error",
                message: "Cannot delete post you did not post."
                } : {
                name: "User not found.",
                message: "User does not exist."
                })
        }

     } catch ({name, message}) {
        next({
            message: "You are not logged in and cannot delete a user."
        });
     };
});

module.exports = usersRouter;