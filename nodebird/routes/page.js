const express = require('express');

const{isLoggedIn,isNotLoggedIn}=require('./middlewares');
const { Post, User ,Hashtag} = require('../models');

const router = express.Router();

router.use((req,res,next)=>{
    res.locals.user=req.user;
    res.locals.followerCount=req.user ? req.user.Followers.length:0;
    res.locals.followingCount=req.user ? req.user.Followings.length:0;
    res.locals.followerIdList=req.user ? req.user.Followings.map(f=>f.id):[];
    //locals로 설정한 이유는 이 변수들이 모든 템플릿 엔진에서 공통으로 사용하기 때문
    next();
});

router.get('/profile',isLoggedIn,(req,res)=>{
    //isLoggedIn이 호출되어 얘가 true여야 next가 호출되어 res.render가 있는 미들웨어로 넘어감
    //자신의 프로필은 로그인 해야 볼 수 있으므로 이렇게 설정함
    //만약 false가 되어 next호출되지 않으면 메인 페이지로 리다이렉트 됨
    res.render('profile',{title:'내 정보 - NodeBird'});
});

router.get('/join',isNotLoggedIn,(req,res)=>{
    //회원가입은 로그인 하지 않은 상태에서만 볼 수 있도록 해야하니 isNotLoggedIn 사용
    res.render('join',{title: '회원가입 - NodeBird'});
});

router.get('/',(req,res,next)=>{
    const twits=[];
    res.render('main',{
        title:'NodeBird',
        twits,
    });
});

router.get('/',async(req,res,next)=>{
    try{
        const posts = await Post.findAll({
            include:{
                model:User,
                attributes:['id','nick'],
            },
            order:[['createAt','DESC']],
        });
        res.render('main',{
            title:'NodeBird',
            twits:posts,
        });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/hashtag',async(req,res,next)=>{
    //해시태그로 조회하는 GET /hashtag 라우터
    const query = req.query.hashtag;
    //쿼리 스트링으로 해시태그 이름을 받음
    if(!query){
        return res.redirect('/');
        //해시태그 값이 없으면 메인 페이지로
    }
    try{
        const hashtag=await Hashtag.findOne({where:{title:query}});
        //쿼리로 해당 해시태그를 디비에서 검색
        let posts=[];
        if(hashtag){//있다면
            posts=await hashtag.getPosts({include:[{model:User}]});
            //posts에 getPosts 메서드로 모든 게시글을 가져옴 가져올 땐 작성자 정보를 합침
            //inlucde로 합친 것
        }

        return res.render('main',{
            //조회 후 메인페이지를 렌더링 하면서
            title:`${query}|NodeBird`,
            twits:posts,
            //전체 게시글 대신 조회된 게시글만 twits에 넣어 렌더링
        });
    }catch(error){
        console.error(error);
        return next(error);
    }
});
module.exports = router;