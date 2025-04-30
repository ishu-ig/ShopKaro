import passwordValidator from "password-validator"
var schema = new passwordValidator();

// Add properties to it
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase(1)                             // Must have at least one uppercase letter
    .has().lowercase(1)                             // Must have at least one lowercase letter
    .has().digits(1)                                // Must have at least 1 digits
    .has().symbols(1)                               // Must have at least 1 special character
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123', 'Admin@123']); // Blacklist these values

export default function formValidator(e) {
    let { name, value } = e.target
    switch (name) {
        case "name":
        case "username":
        case "color":
        case "subject":
            if (!value || value.length === 0)
                return name + " Feild is mendatory"
            else if (value.length < 3 || value.length > 50)
                return name + " Feild length must be between 3-50 "
            else
                return ""
        case "email":
            if (!value || value.length === 0)
                return name + " Feild is mendatory"
            else if (value.length < 13 || value.length > 50)
                return name + " Feild length must be between 13-50 "

            else
                return ""
        case "phone":
            if (!value || value.length === 0)
                return name + " Feild is mendatory"
            else if (value.length < 10 || value.length > 10)
                return name + " Feild length must be of 10 Digit"
            else if (!(value.startsWith("6") || value.startsWith("7") || value.startsWith("8") || value.startsWith("9")))
                return "Invalid Phone Number,It Must Start With 6,7,8 or 9"

            else
                return ""
        case "password":
            if (!value || value.length === 0)
                return "Password Feild is mendatory"
            else if (!schema.validate(value))
                return "Invalid Password,It must contain 8-100 character,At Least 1 Uppercaser Character, 1 LowerCase Character,1 Digit,1 symbol and Doesn't Include Any Space"

            else
                return ""

        case "size":
            if (!value || value.length === 0)
                return name + " Feild is mendatory"
            else if (value.length < 0 || value.length > 10)
                return name + " Feild length Must be upto 10 characters"
            else
                return ""

        case "basePrice":
            if (!value || value.length === 0)
                return name + " Feild is mendatory"
            else if (value < 1)
                return " Base Price must be more than zero"
            else
                return ""

        case "discount":
            if (!value || value.length === 0)
                return name + " Feild is mendatory"
            else if (value.length < 0 || value.length > 100)
                return "Discount Must be between 0-100"
            else
                return ""

        case "stockQuantity":
            if (!value || value.length === 0)
                return name + " Feild is mendatory"
            else if (value < 0)
                return name + " Stock Quantity must not be negative"
            else
                return ""

        case "message":
            if (!value || value.length === 0)
                return name + " Feild is mendatory"
            else if (value.length < 50)
                return name + " Feild length must be Greater than 50 "
            else
                return ""

        default:
            return ""
    }
}
