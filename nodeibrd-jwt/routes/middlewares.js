const RateLimit = require('express-rate-limit');

exports.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        res.status(403).send('로그인 필요');
    }
};


exports.isNotLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        next();
    }else{
        const message=encodeURIComponent('로그인한 상태입니다');
        res.redirect(`/?error=${message}`);
    }
};


//무료 apiLimiter
exports.apiLimiter = new RateLimit({
    windowMs: 60*1000,//1분
    max:10,
    delayMs:0,
    handler(req,res){
        res.status(this.statusCode).json({
            code: this.statusCode,//기본값 429
            message:'무료 사용자는 1분에 한 번만 요청할 수 있습니다.',
        });
    },
});

//프리미엄 apiLimiter
exports.premiumApiLimiter = new RateLimit({
    windowMs: 60*1000,//1분
    max:1000,
    delayMs:0,
    handler(req,res){
        res.status(this.statusCode).json({
            code: this.statusCode,//기본값 429
            message:'유료 사용자는 1분에 천 번만 요청할 수 있습니다.',
        });
    },
});

exports.deprecated = (req,res)=>{
    res.status(410).json({
        code:410,
        message:'새로운 버전이 나왔습니다. 새로운 버전을 사용하세요.',
    });
};