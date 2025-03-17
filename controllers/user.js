const mysql = require("mysql2");
const bcrypt = require('bcryptjs');
const express = require('express');
const jwt=require("jsonwebtoken");
const {promisify}=require("util");
const nodemailer = require('nodemailer');
const router=express.Router();  

const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
})  

exports.register=(req,res)=>{
    const {username,email,password}= req.body;
    let exersice='exersice';
    let workout='workout';
    db.query("select name from users where name=?",[username], async (error,result)=>{
        if(error){
            console.log(error);
        }
        if(result.length>0){
            return res.render('index',{msg : 'Name already taken',msg_type:'error'})
        }
        else{
        db.query("select email from users where email=?",[email],(error,result)=>{
            if (error){
                console.log(error);
            }
            if (result.length>0){
                return res.render('index',{msg:'Email already taken',msg_type:'error'})
            }
            else if (password==''){
                return res.render('index',{msg :'Password Must Be filled',msg_type:'error'})
            }
        
        })
    }
    let hashedpass=await bcrypt.hash(password,8);
    db.query("insert into users set ?",{name:username,email:email,pass:hashedpass});
    db.query("create table ?? (id int not null PRIMARY KEY AUTO_INCREMENT,exersice_name varchar(255),total_time time,date date,starting_time time,calories int)",[username+exersice]);
    db.query("create table ?? (id int not null PRIMARY KEY AUTO_INCREMENT,workout_name varchar(255),total_time time,date date,starting_time time,steps int,calories int)",[username+workout],(error,result)=>{
        if (error){
            console.log(error)
        }
        else{
            return res.render("index",{msg : "Registration Successfull",msg_type:'good'})
        }
    });
    })

};
exports.login= async (req,res)=>{
        try{
            const {username,password}=req.body;
            req.app.set('globalUsername', username);
            if(!username || !password){
                return res.status(400).render('index',{msg:'Please Enter Email and Password',msg_type:'error'});
            }
        db.query("select * from users where name=?",[username],async(error,result)=>{
            if(result.length<=0){
                return res.status(401).render('index',{msg:'Email incorrect!!!',msg_type:'error'});
            }
            else {
                if(!(await bcrypt.compare(password,result[0].pass))){
                    return res.status(401).render('index',{msg:'Password incorrect!!!',msg_type:'error'});
                }
                else{
                    const name=result[0].name;
                    const token=jwt.sign({name: name}, process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE_IN,})
                    const cookieOptions={expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),httpOnly: true,};
                    res.cookie("vaishal",token,cookieOptions);
                    res.status(200).redirect("/home?user="+username);
                }
            }
        })
    }catch(error){
        console.log(error);
    }
    
}

exports.isLoggedin=async(req,res,next)=>{
    if( req.cookies.vaishal){
        try{
        const decode=await promisify(jwt.verify)(req.cookies.vaishal,process.env.JWT_SECRET);
        db.query("select * from users where name=?",[decode.name],(err,result)=>{
            if (!result){
                return next();
            }
            req.user=result[0].name;
            return next();
        })
    }catch (error){
        console.log(error);
        return next();
    }
   }else{
    next();
   }
}
exports.send= async (req,res)=>{
        const {name,sname,phone,email,message}=req.body;
        let exersice='exersice';
        let workout='workout';  
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'vaishalsureshkumar22@gmail.com',
              pass: 'cwfgkrrscxsajcye'
            }
          });
          const mailOptions = {
            from: email,
            to: "vaishalsureshkumar22@gmail.com",
            subject: 'New email from'+email,
            text: `
      Name: ${name}+${sname}
      Email: ${email}
      Mobile: ${phone}
      Message: ${message}
    `
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error(error);
              res.status(500).send('Error: Unable to send email.');
            } else {
              console.log('Email sent: ' + info.response);
              db.query("select * from ??",[name+exersice],(err,result)=>{
                if(!err){
                    db.query("select * from ??",[name+workout],(err,result1)=>{
                        if(!err){
                            db.query("select  COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[name+exersice],(err,out)=>{
                                if(!err){
                                    db.query("select sum(calories) as sum_calories from ??",[name+exersice],(err,sum)=>{
                                    db.query("select  COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[name+workout],(err,out1)=>{
                                        if(!err){
                                           db.query("select sum(calories) as sum_calories from ??",[name+workout],(err,sum1)=>{
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
          });
}

exports.edit=async (req,res)=>{
    let id=req.params.id;
    let exersice='exersice';
    const globalUsername = req.app.get('globalUsername');
    console.log(id,globalUsername);
    db.query("select * from ?? where id=?",[globalUsername+exersice,id],(err,out)=>{
       if(err){
        console.log(err)
       }
       else{
        console.log(out)
        res.render("edit",{out})
       }
    })
}
  
exports.editdata=async(req,res)=>{
    let id=req.params.id;
    let exersice='exersice';
    let workout='workout'; 
    const {username,myselect,ttime,stime,weight,date}=req.body;
    const metvalues={'Running':8.0,'Cycling':7.5,'Jocking':7,'Walking':2.3,'Yoga':3.3,'Stretching':2.8,'Aerobics':7.3,'Dance':7.2,'Swimming':13.3,'Pushups':4}
    const timepart=ttime.split(':');
    const total = parseInt(timepart[0])*60+parseInt(timepart[1])+parseInt(parseInt(timepart[2])/60)
    const met=metvalues[myselect];
    const calories=parseInt(total*(met*3.5*weight)/200)
    const globalUsername = req.app.get('globalUsername');
    db.query("update ?? set exersice_name=?,total_time=?,starting_time=?,date=?,calories=? where id=?",[username+exersice,myselect,ttime,stime,date,calories,id],(err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log("Updated record")
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
}
exports.editwork=async (req,res)=>{
    let id=req.params.id;
    let exersice='workout';
    const globalUsername = req.app.get('globalUsername');
    console.log(id,globalUsername);
    db.query("select * from ?? where id=?",[globalUsername+exersice,id],(err,out)=>{
       if(err){
        console.log(err)
       }
       else{
        console.log(out)
        res.render("editwork",{out})
       }
    })
}
exports.editworkdata=async(req,res)=>{
    let id=req.params.id;
    let exersice='exersice';
    let workout='workout'; 
    const {username,myselect,ttime,stime,weight,date,steps}=req.body;
    const timepart=ttime.split(':');
    const metvalues={'Pilates':3,'Lunge':3.8,'OverHead Press':4.5,'Pullups':8,'Bench Press':6,'Dumbells':5,'Bicep curl':4,'Jump rope':11.8,'Barel curl':4,'cabel crossover':4}
    const total = parseInt(timepart[0])*60+parseInt(timepart[1])+parseInt(parseInt(timepart[2])/60)
    const met=metvalues[myselect];
    const calories=parseInt(total*(met*3.5*weight)/200)
    const globalUsername = req.app.get('globalUsername');
    db.query("update ?? set workout_name=?,total_time=?,starting_time=?,date=?,steps=?,calories=? where id=?",[username+workout,myselect,ttime,stime,date,steps,calories,id],(err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log("Updated record")
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
}

exports.delete=async(req,res)=>{
    let id=req.params.id;
    let exersice='exersice';
    let workout='workout';
    const globalUsername = req.app.get('globalUsername');
    db.query("delete from ?? where id=?",[globalUsername+exersice,id],(err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            db.query("select * from ??",[globalUsername+exersice],(err,result)=>{
                if(!err){
                    db.query("select * from ??",[globalUsername+workout],(err,result1)=>{
                        if(!err){
                            db.query("select  COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[globalUsername+exersice],(err,out)=>{
                                if(!err){
                                    db.query("select sum(calories) as sum_calories from ??",[globalUsername+exersice],(err,sum)=>{
                                    db.query("select  COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[globalUsername+workout],(err,out1)=>{
                                        if(!err){
                                           db.query("select sum(calories) as sum_calories from ??",[globalUsername+workout],(err,sum1)=>{
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
}
exports.deletework=async(req,res)=>{
    let id=req.params.id;
    let exersice='exersice';
    let workout='workout';
    const globalUsername = req.app.get('globalUsername');
    db.query("delete from ?? where id=?",[globalUsername+workout,id],(err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            db.query("select * from ??",[globalUsername+exersice],(err,result)=>{
                if(!err){
                    db.query("select * from ??",[globalUsername+workout],(err,result1)=>{
                        if(!err){
                            db.query("select  COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[globalUsername+exersice],(err,out)=>{
                                if(!err){
                                    db.query("select sum(calories) as sum_calories from ??",[globalUsername+exersice],(err,sum)=>{
                                    db.query("select  COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[globalUsername+workout],(err,out1)=>{
                                        if(!err){
                                           db.query("select sum(calories) as sum_calories from ??",[globalUsername+workout],(err,sum1)=>{
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
}
exports.search=async (req,res)=>{
    const globalUsername = req.app.get('globalUsername');
    let exersice='exersice';
    let workout='workout';
    const {search}=req.body;
    db.query("select * from ??",[globalUsername+exersice],(err,result)=>{
        if(!err){
            db.query("select * from ??",[globalUsername+workout],(err,result1)=>{
                if(!err){
                    db.query("select  COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[globalUsername+exersice],(err,out)=>{
                        if(!err){
                            db.query("select sum(calories) as sum_calories from ??",[globalUsername+exersice],(err,sum)=>{
                            db.query("select  COALESCE(hour(sum_time),00) as hour, COALESCE(minute(sum_time),00) as min, COALESCE(second(sum_time),00) as sec from (select sec_to_time(sum(time_to_sec(total_time))) as sum_time from ??) as subquery;",[globalUsername+workout],(err,out1)=>{
                                if(!err){
                                   db.query("select sum(calories) as sum_calories from ??",[globalUsername+workout],(err,sum1)=>{
                                    if (!err){
                                        db.query("select * from ?? where date=?",[globalUsername+exersice,search],(err,ser)=>{
                                            if(!err){
                                                db.query("select * from ?? where date=?",[globalUsername+workout,search],(err,ser1)=>{
                                                    res.render("home",{result,result1,out,out1,sum,sum1,ser,ser1})
                                                })
                                            }
                                        })
                                        
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