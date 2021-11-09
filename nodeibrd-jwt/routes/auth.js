const express = require('express');
const passport = require('passport');
const bcrypt =require('bcrypt');
const {isLoggedIn,isNotLoggedIn}=require('./middlewares');
const jwt = require('jsonwebtoken')
const User = require('../models/user');

const router = express.Router();

router.post('/join',isNotLoggedIn,async(req,res,next)=>{
    const{email,nick,password}=req.body;
    try{
        const exUser=await User.findOne({where:{email}});
        if(exUser){
            res.json('이미 가입된 이메일 입니다');
        }
        const hash=await bcrypt.hash(password, 12);
        await User.create({
            email,
            nick,
            password: hash,
        });
        res.json('회원가입 완료');
    }catch(error){
        console.error(error);
        return next(error);
    }
});


router.post('/login',isNotLoggedIn,(req,res,next)=>{
    passport.authenticate('local',{session: false},(authError,user,info)=>{
        if(authError){
            console.error(authError);
            next(authError);
        }
        if(!user){
            next(info);
        }
        req.login(user,{session:false},(loginError)=>{
            if(loginError){
                console.error(loginError);
                next(loginError);
            }
            const token = jwt.sign({
                id:user.id,
                nick:user.nick
            },process.env.JWT_SECRET,{
                expiresIn:'10m',
                issuer:'nodebird'
            });
            res.json({
                code:200,
                message:'토큰이 발급되었습니다',
                token});
        });
    })(req,res,next);
});

module.exports=router;