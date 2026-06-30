


const app = require("./src/app")
const dotenv = require("dotenv")
dotenv.config()
const port = process.env.PORT || 5000;



app.listen(port , ()=>{
     console.log(`Server is running at http://localhost:${port}`)
})