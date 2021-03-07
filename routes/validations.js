const Joi = require('joi')

const registerValidation =  (data) =>{
    const schema = Joi.object({
        first: Joi.string().min(3).max(12).required().messages({
            'string.base': `First name should be a string`,
            'string.empty': `First name can not be empty`,
            'string.min': `First name must be at least 3 characters`,
            'string.max': `First name can only contain up to 12 characters`,
            'any.required': `First name is required`,
            'any.empty': `Invalid first name`
        }),
        last: Joi.string().min(3).required().messages({
            'string.base': `Last name should be a string`,
            'string.empty': `Last name can not be empty`,
            'string.min': `Last name must be at least 3 characters`,
            'any.required': `Last name is required`,
            'any.empty': `Invalid last name`
        }),
        email: Joi.string().min(6).required().email().messages({
            'string.base': `Email should be a string`,
            'string.empty': `Email can not be empty`,
            'string.min': `Email must be at least 6 characters`,
            'any.required': `Email is required`,
            'any.empty': `Invalid email`
        }),
        password: Joi.string().min(6).regex(/.*[0-9].*$/).required().messages({
            'string.base': `Password should be a string`,
            'string.empty': `Password can not be empty`,
            'string.min': `Pssword must be at least 6 characters`,
            'any.required': `Password is required`,
            'string.pattern.base': "Password must contain 1 number",
            'any.empty': `Invalid password`
        })
    })
    return schema.validate(data)
}

const loginValidation = (data)=> {
    const schema =  Joi.object({
        email: Joi.string().min(6).required().email().messages({
            'string.empty': `Invalid email`,
            'any.empty': `Invalid email`
        }),
        password: Joi.string().min(6).regex(/.*[0-9].*$/).required().messages({
            'string.empty': `Invalid password`,
            'any.empty': `Invalid password`
        }),
        remember: Joi.boolean()
    })

    return schema.validate(data)
}


const resetpassValidation = (data)=>{
    const schema = Joi.object({
        email: Joi.string().min(6).required().email().messages({
            'any.empty': `Invalid email`
        })
    })
    return schema.validate(data)

}

module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
module.exports.resetpassValidation = resetpassValidation