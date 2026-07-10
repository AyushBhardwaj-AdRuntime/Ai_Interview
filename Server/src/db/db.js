 const mongoose = require("mongoose")

 async function connectDb (){
      await mongoose.connect(process.env.MONGO_URL);

    console.log("db is connected")
 }

 module.exports = connectDb;