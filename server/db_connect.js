require("mongoose")
    .connect(process.env.DB_KEY)
    .then(() => {
        console.log("Dabata Base is Connected")
    })
    .catch(error => {
        console.log(error)
    })