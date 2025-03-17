const express = require('express');
const mysql = require("mysql2");
const usercontroller=require('../controllers/user');
const router=express.Router();

const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
})  


router.get(["/","/login"],(req,res)=>{
    res.render("index");
});

router.get("/home",usercontroller.isLoggedin,(req,res)=>{
    const user=req.query.user;
    router.globalvalue=user;
    let exersice='exersice';
    let workout='workout';
    if (req.user){
        db.connect((err)=>{
            if(err){
                console.log(err)
            }else{
                console.log("Connection Success in home")
            }
        });
        db.query("select * from ??",[user+exersice],(err,result)=>{
            if(!err){
                db.query("select * from ??",[user+workout],(err,result1)=>{
                    if(!err){
                        db.query("select COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[user+exersice],(err,out)=>{
                            if(!err){
                                db.query("select sum(calories) as sum_calories from ??",[user+exersice],(err,sum)=>{
                                db.query("select COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[user+workout],(err,out1)=>{
                                    if(!err){
                                       db.query("select sum(calories) as sum_calories from ??",[user+workout],(err,sum1)=>{
                                        if (!err){
                                            console.log(out)
                                            res.render("home",{result,result1,out,out1,sum,sum1,msg:user})
                                        }
                                       }) 
                                    }
                                })
                            })
                            }
                        })
                    }
                })
            }
            else{
                console.log(err)
            }
        })
    }
    else{
        res.redirect("/login");
    }
})



router.get("/add",(req,res)=>{
    res.render("add")
})
router.get("/addwork",(req,res)=>{
    res.render("addwork")
})



router.post("/record-work",(req,res)=>{
    const {username,myselect,ttime,stime,weight,date,steps}=req.body;
    const timepart=ttime.split(':');
    const metvalues={'Pilates':3,'Lunge':3.8,'OverHead Press':4.5,'Pullups':8,'Bench Press':6,'Dumbells':5,'Bicep curl':4,'Jump rope':11.8,'Barel curl':4,'cabel crossover':4}
    const total = parseInt(timepart[0])*60+parseInt(timepart[1])+parseInt(parseInt(timepart[2])/60)
    const met=metvalues[myselect];
    const calories=parseInt(total*(met*3.5*weight)/200)
    let exersice='exersice';
    let workout='workout';
    if (username!==''){
        db.connect((err)=>{
            if(err){
                console.log(err)
            }else{
                console.log("Connection Success in after adding")
            }
        });
        db.query("insert into ?? set ?",[username+workout,{workout_name:myselect,total_time:ttime,date:date,steps:steps,starting_time:stime,calories:calories}],(err,out)=>{
            if(err){
                console.log(err)
            }else{
                console.log(out)
            }
        })
        db.query("select * from ??",[username+exersice],(err,result)=>{
            if(!err){
                db.query("select * from ??",[username+workout],(err,result1)=>{
                    if(!err){
                        db.query("select  COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[username+exersice],(err,out)=>{
                            if(!err){
                                db.query("select sum(calories) as sum_calories from ??",[username+exersice],(err,sum)=>{
                                db.query("select  COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[username+workout],(err,out1)=>{
                                    if(!err){
                                       db.query("select sum(calories) as sum_calories from ??",[username+workout],(err,sum1)=>{
                                        if (!err){
                                            res.render("home",{result,result1,out,out1,sum,sum1})
                                        }
                                       }) 
                                    }
                                })
                            })
                            }
                        })
                    }
                })
            }
            else{
                console.log(err)
            }
        })
    }
})
router.post("/record",(req,res)=>{
    const {username,myselect,weight,ttime,stime,date}=req.body;
    const metvalues={'Running':8.0,'Cycling':7.5,'Jocking':7,'Walking':2.3,'Yoga':3.3,'Stretching':2.8,'Aerobics':7.3,'Dance':7.2,'Swimming':13.3,'Pushups':4}
    const timepart=ttime.split(':');
    const total = parseInt(timepart[0])*60+parseInt(timepart[1])+parseInt(parseInt(timepart[2])/60)
    const met=metvalues[myselect];
    const calories=parseInt(total*(met*3.5*weight)/200)
    let exersice='exersice';
    let workout='workout';
    if (username!==''){
        db.connect((err)=>{
            if(err){
                console.log(err)
            }else{
                console.log("Connection Success in after adding")
            }
        });
        db.query("insert into ?? set ?",[username+exersice,{exersice_name:myselect,total_time:ttime,date:date, starting_time:stime,calories:calories}],(err,out)=>{
            if(err){
                console.log(err)
            }
        })
        db.query("select * from ??",[username+exersice],(err,result)=>{
            if(!err){
                db.query("select * from ??",[username+workout],(err,result1)=>{
                    if(!err){
                        db.query("select  COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[username+exersice],(err,out)=>{
                            if(!err){
                                db.query("select sum(calories) as sum_calories from ??",[username+exersice],(err,sum)=>{
                                db.query("select  COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[username+workout],(err,out1)=>{
                                    if(!err){
                                       db.query("select sum(calories) as sum_calories from ??",[username+workout],(err,sum1)=>{
                                        if (!err){
                                            res.render("home",{result,result1,out,out1,sum,sum1})
                                        }
                                       }) 
                                    }
                                })
                            })
                            }
                        })
                    }
                })
            }
            else{
                console.log(err)
            }
        })
    }
})


module.exports=router;  