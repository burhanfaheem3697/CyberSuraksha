const { validationResult } = require("express-validator");
const ApiError = require('../utils/api_Error')

exports.validate = (req,res,next) => {    
    console.log(req.body)
    
    
    const errors = validationResult(req)

    console.log("error : ",errors)
    

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
