
function asyncHandler(requesHandler){
    return function (req,res,next){
        Promise.resolve(requesHandler(req,res,next)).catch((err) => next(err))
    }
}

module.exports = asyncHandler