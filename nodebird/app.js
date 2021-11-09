const express = require('express')
const cookieparser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks=require('nunjucks');
const dotenv=require('dotenv');
const passport = require('passport');

dotenv.config();
const pageRouter=require('./routes/page');
const authRouter=require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const {sequelize}=require('./models');//db모델을 서버와 연결하기 위함

const passportConfig = require('./passport');//passport모듈 index.js가 뒤에 생략된 것
//passport모듈은 세션이나 쿠키기능을 우리가 다 구현하기엔 보안상 무리도 있기 때문에
//이렇게 모듈을 들고와서 씀 이걸로 카카오나 페이스북 등을 연동하여 로그인 가능

const app=express();
passportConfig();//패스포트 설정
app.set('port',process.env.PORT||8005);
app.set('view engine','html');
nunjucks.configure('views',{
    express:app,
    watch:true,
});
sequelize.sync({force:false})
    .then(()=>{
        console.log('데이터 베이스 연결 성공');
    })
    .catch((err)=>{
        console.error(err);
    });
//index.js에서 db를 불러와서 sync메서드를 사용해 서버 실행 시 MYSQL과 연동되는 것
//force:false 옵션을 true로 설정하면 서버 실행 시마다 테이블을 재생성함
//테이블 잘못 만든 경우에 true로 설정함

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,'public')));
//static 미들웨어는 정적인 파일들을 제공하는 라우터 역할
//기본제공 되므로 express객체 안에서 꺼내서 사용
//app.use('요청경로',express.static('실제경로'));
app.use('/img',express.static(path.join(__dirname,'uploads')));
//업로드 폴더 내 사진들이 /img주소로 제공됨
//express.static은 여러번 쓸 수 있다는 것을 기억
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieparser(process.env.COOKIE_SECRET));
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET,
    cookie:{
        httpOnly:true,
        secure:false,
    },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/',pageRouter);

app.use('/auth',authRouter);
app.use('/post',postRouter);
app.use('/user',userRouter);

app.use((req,res,next)=>{
    const error=new Error(`${req.method} ${req.url}라우터가 없습니다.`);
    error.status=404;
    next(error);
});

app.use((err,req,res,next)=>{
    res.locals.message=err.message;
    res.locals.error=process.env.NODE_ENV !=='production'? err:{};
    res.status(err.status||500);
    res.render('error');
});

app.listen(app.get('port'),()=>{
    console.log(app.get('port'),'번 포트에서 대기 중');
});