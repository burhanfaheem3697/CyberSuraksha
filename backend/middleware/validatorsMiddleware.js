const { validationResult } = require("express-validator");
const ApiError = require('../utils/api_Error')

exports.validate = (req,res,next) => {    
    
    const errors = validationResult(req)

    if(errors.isEmpty()) return next()
    const extractedError = []   
    errors.array().map((err) => {
        extractedError.push({
            [err.path] : err.msg
        })
    })

    console.log(extractedError)
    

    throw new ApiError(
        422,
        "Received data is not valid",
        extractedError
    )   
}
