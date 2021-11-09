const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
//로그인 전략을 구현한 것
//passport-local모듈에서 strategy생성자를 불러와서 그 안에 전략을 구현하면 됨
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = ()=>{
    passport.use('local',new LocalStrategy({
        usernameField: 'email',
        passwordField:'password',
    },async(email,password,done)=>{
        try{
            var exUser = await User.findOne({where:{email}});
            if(exUser){
                const result = await bcrypt.compare(password,exUser.password);
                if(result){
                    done(null,exUser);
                }else{
                    done(null,false,{message:'비밀번호가 일치하지 않습니다.'});
                }
            }else{
                done(null,false,{message:'가입되지 않은 회원입니다.'});
            }
        }catch(error){
            console.error(error);
            done(error);
        }
    }));
};