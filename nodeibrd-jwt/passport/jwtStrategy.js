const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const dotenv = require('dotenv');

const {User} = require('../models');
dotenv.config();

//토큰 확인을 위한 모듈
module.exports = ()=>{
    passport.use('jwt',new jwtStrategy({
        jwtFromRequest: ExtractJwt.fromHeader('authorization'),
        secretOrKey: process.env.JWT_SECRET
    },async(jwtPayload,done)=>{
        try{
            const user = await User.findOne({
                where:{id:jwtPayload.id}
            });
            if(user){
                done(null,user);
            }else{
                done(null,false,{message:'가입되지 않은 회원입니다'});
            }
        }catch(error){
            console.error(error);
            done(error);
        }
    }

))};
