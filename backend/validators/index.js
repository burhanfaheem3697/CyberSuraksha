const { body } = require("express-validator");

exports.userRegistrationValidator = () => {
    
    return [
        body('email')
            .trim()
            .notEmpty().withMessage("email is required")
            .isEmail().withMessage("email is invalid"),
        body('username')
            .trim()
            .notEmpty().withMessage("username is required")
            .isLength({min : 3}).withMessage("username should be at least 3 char")
            .isLength({max : 13}).withMessage("username should cannot exceed 13 char"),
        body('password')
            .trim()
            .notEmpty().withMessage("password is required")
            .isStrongPassword().withMessage('Password must be at least 8 characters long and include 1 uppercase, 1 lowercase, 1 number, and 1 symbol.'),
        body('fullname')
            .trim()
            .notEmpty().withMessage("fullname is required"),
    ]
}

exports.userLoginValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty().withMessage("email is required")
            .isEmail().withMessage("email is invalid"),
        body('password')
            .trim()
            .notEmpty().withMessage("password is required")
            .isStrongPassword().withMessage('Password must be at least 8 characters long and include 1 uppercase, 1 lowercase, 1 number, and 1 symbol.'),
        
    ]
}

exports.createProjectValidator = async () => {
    return [
        body('name')
            .trim()
            .notEmpty().withMessage("project name is required"),
        body('description')
            .trim(),
        body('username')
            .trim()
            .notEmpty().withMessage("username is required")

    ]
}
