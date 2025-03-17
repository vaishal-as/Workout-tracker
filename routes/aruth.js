const express=require('express');
const router=express.Router();
const usercontroller=require('../controllers/user')

router.post('/register',usercontroller.register)
router.post('/login',usercontroller.login)
router.post('/search',usercontroller.search)
router.post('/send',usercontroller.send)
router.get('/edit/:id',usercontroller.edit)
router.get('/editwork/:id',usercontroller.editwork)
router.post('/editrecord/:id',usercontroller.editdata)
router.post('/editworkrecord/:id',usercontroller.editworkdata)
router.get('/delete/:id',usercontroller.delete);
router.get('/deletework/:id',usercontroller.deletework);
module.exports=router;