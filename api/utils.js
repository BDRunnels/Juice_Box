function requireUser(req,res,next) {
    if (!req.user) {
        next({
            name: "MissingUserError",
            message: "You must be logged in to perform this action."
        });
    }

    next();
};

function requireActiveUser(req,res,next) {
    if (!req.user) {
        next({
            name: "MissingUserError",
            message: "You must be logged in to perform this action."
        });
    }
    if (!req.user.active) {
        next({
            name: "Inactive User.",
            message: "You have provided an inactive user credentials."
        })
    }
}

module.exports = { requireUser, requireActiveUser }