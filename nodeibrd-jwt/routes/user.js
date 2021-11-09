const express = require('express');
const passport = require('passport');
const {isLoggedIn,isNotLoggedIn} = require('./middlewares');

const User = require('../models/user');

const router = express.Router();

router.get('/',
    (req,res,next)=>{passport.authenticate('jwt',{session:false},
    async(error,user,info)=>{
        if(error){
            console.error(error);
            next(error);
        }else if(info){
            if(info.message == '가입되지 않은 회원입니다'){
                res.json({
                    code:401,
                    message:info.message
                });
            }else if(info.message == 'invalid signature'){
                res.json({
                    code:410,
                    message:'유효하지 않은 토큰입니다'
                });
            }else if(info.message == 'jwt malformed' || info.message == 'invalid token'){
                res.json({
                    code:411,
                    message:'잘못된 토큰 형식입니다'
                })
            }else if(info.message == 'jwt expired'){
                res.json({
                    code:419,
                    message:'토큰이 만료되었습니다'
                })
            }else{
                res.json({
                    code:412,
                    message:'헤더에 토큰값이 없습니다'
                })
            }
        }else if(user){
            res.json({
                code:200,
                id:user.id,
                email:user.email,
                nick:user.nick,
                provider:user.provider
            });
        }
        
    })(req,res,next)},);

module.exports = router;