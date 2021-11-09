const express = require('express');

const {isLoggedIn} = require('./middlewares');
const User = require('../models/user');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/:id/follow',isLoggedIn,async(req,res,next)=>{
    // Post /user/:id/follow 라우터
    //:id 부분이 req.params.id가 됨
    try{
        const user = await User.findOne({where:{id:req.user.id}});
        //먼저 팔로우할 사용자를 데이터베이스에서 조회함
        if(user){
            await user.addFollowing(parseInt(req.params.id,10));
            //addFollowing메서드로 현재 로그인한 사용자와의 관계를 지정함
            res.send('success');
        }else{
            res.status(404).send('no user');
        }
    }catch(error){
        console.error(error);
        next(error);
    }
});

//팔로잉 끊는 기능
//해당 id를 가진 사람과 팔로잉 기능을 끊음
router.delete('/:id/follow',isLoggedIn,async(req,res,next) => {
    try{
        const user = await User.findOne({
            where:{id:req.user.id} //현재 서비스 이용중인 사용자를 조회
        });
        
        if(user){
            //removeFollowing 으로 팔로윙을 끊었음
            //Follow 테이블에 생성되고 삭제되는 것이므로 한쪽에서 취소해서 없애면
            //팔로잉 당한 사람도 팔로잉 취소한 것을 볼 수 있음
            //Follow 테이블은 하나이므로 하나의 로우만 없애도 양쪽다
            //팔로잉 취소한 것을 볼 수 있는 것
            await user.removeFollowing(parseInt(req.params.id,10));
            res.send('success');
        }else{
            res.status(404).send('no user');
        }
        }catch(error){
            console.error(error);
            next(error);
    }
});

//프로필 정보를 변경하는 라우터
//비밀번호 변경
router.patch('/',isLoggedIn, async(req,res,next)=>{
    //새 비밀번호 암호화
    console.log(req.body.password);
    const hash=await bcrypt.hash(req.body.password, 12);
    console.log(hash);
    console.log(req.user.id);
    try{
        await User.update({
            password: hash
        },{
            where:{id:req.user.id}
        });
        res.send('success');

    }catch(error){
        console.error(error);
        next(error);
    }
    
})


module.exports=router;