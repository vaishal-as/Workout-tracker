const express = require('express');
const mysql = require("mysql2");
const doenv= require("dotenv");
const path=require("path");
const cookieparser=require("cookie-parser");
const app = express();
doenv.config({
    path:'./.env',

})
const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
})
db.connect((err)=>{
    if (err){
        console.log(err);
    }
    else{
        console.log("Mysql connection successfull")
    }
})
app.use(cookieparser());
const location = path.join(__dirname,'./public');


app.use(express.urlencoded({ extended: false }));
app.use(express.static(location));
app.set("view engine","hbs");
app.use("/",require("./routes/pages"));
app.use("/aruth",require("./routes/aruth"));
app.listen(5000,()=>{
    console.log("Server started @ port 5000")
})
