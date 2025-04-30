// const mongoose = require("mongoose")

// async function getConnect() {
//     try {
//         await mongoose.connect(process.env.DB_KEY)
//         console.log("DataBase is Connected")
//     } catch (error) {
//         console.log(error)
//     }
// }
// getConnect()


// const mongoose = require("mongoose")
// mongoose.connect(process.env.DB_KEY)
//     .then(() => {
//         console.log("Dabata Base is Connected")
//     })
//     .catch(error => {
//         console.log(error)
//     })

require("mongoose")
    .connect(process.env.DB_KEY)
    .then(() => {
        console.log("Dabata Base is Connected")
    })
    .catch(error => {
        console.log(error)
    })