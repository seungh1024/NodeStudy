exports.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        res.status(403).send('로그인 필요');
    }
};
//passport 는 req 객체에 isAuthenticated 메서드를 추가
//로그인 중이면 req.isAuthenticated 가 true 이고 그렇지 않으면 false


exports.isNotLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        next();
    }else{
        const message=encodeURIComponent('로그인한 상태입니다');
        res.redirect(`/?error=${message}`);
    }
};

//isLoggedIn과 isNotLoggedIn 미들웨어를 만든것
//page라우터에서 사용할 것임