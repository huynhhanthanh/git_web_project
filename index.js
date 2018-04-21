const express = require("express") ; 
const app = express(); 
const bodyParser = require('body-parser')
const session = require('express-session'); 
const Passport = require('passport'); 
const LocalStrategy = require('passport-local').Strategy
const fs = require('fs')
const multer = require('multer'); // thu viên load file
app.use(express.static("public"));
var pg = require('pg'); 
app.use(bodyParser.urlencoded({ extended: false }))
var urlencodedParser = bodyParser.urlencoded({ extended: false })




var path = require('path');

app.set('views','./views'); 
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, 'views')));

app.use(bodyParser.urlencoded({extended: true}));
app.use(Passport.initialize())
app.use(Passport.session())
app.use(session({secret: "mysecret"}))


app.get('/',function(req,res){
    res.render('index'); 
})

app.get('/lienhe',function(req,res){
    res.render('contact-us'); 
})

app.get('/thietke',function(req,res){
    res.render('design-clothes'); 
})


app.get('/chitiet',function(req,res){
    res.render('product-details'); 
})

app.get('/singin',function(req,res){
  res.render('sign_in'); 
})






app.route('/login')
.get((req, res) => res.render('login'))
.post(Passport.authenticate('local',{failureRedirect:'/login', // nếu login sai quay vè trang login 
                                     successRedirect:'/lienhe'})) // nếu login đúng chuyến tới trang loginOK

Passport.use(new LocalStrategy(
    (username ,password,done)=> {
        fs.readFile('./userDB.json',(err,data) =>{
            const db =JSON.parse(data)
            const userRecord = db.find(user => user.usr == username)
            if(userRecord && userRecord.pwd == password){
                return done(null,userRecord)
            }else{
                return done(null,false)
            }
        })
    }
))

Passport.serializeUser((user,done) => {
    done(null, user.usr); 
})

Passport.deserializeUser((name,done) => { // khi đăng nhập thành công thì sẽ so sanh pass với username 1 lần nữa nếu đúng mới hiển thị thông tin ra 
    fs.readFile('./userDB.json',(err,data) => {
        const db = JSON.parse(data)
        const userRecord = db.find(user => user.usr == name)
        if (userRecord){
            return done(null , userRecord)
        }else{
            return done(null,false)
        }
    })
})






//*******************************************Load Image */


// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  // Init Upload
  const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('myImage');
  
  // Check File Type
  function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
  }
  
  // Init app
  
  // EJS
  app.set('view engine', 'ejs');
  
  // Public Folder
  app.use(express.static('./public'));
  
  app.get('/', (req, res) => res.render('index'));
  
  app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
      if(err){
        res.render('index', {
          msg: err
        });
      } else {
        if(req.file == undefined){
          res.render('index', {
            msg: 'Error: No File Selected!'
          });
        } else {
          res.render('design-clothes', {
            msg: 'File Uploaded!',
            file: `uploads/${req.file.filename}`
          });
        }
      }
    });
  });

//*******************************************Postgress */

var config = {
  user:'postgres', 
  host: 'localhost', // server name or IP address;
  port: 5432,
  database: 'Khachhang',
  password: '123456ht',
  max: 10 , 
  idleTimeoutMillis: 3000,
};

var pool = new pg.Pool(config); 

app.post("/singin",urlencodedParser,function(req,res){
  // gui du lie len server 

  pool.connect(function(err,client,done){
   if(err){
       return console.error('error fetching client from pool',err)
   }
   var hoten = req.body.txtHoten ; 
   var email = req.body.txtEmail ;
   var password = req.body.txtPassword;
   var gioitinh = req.body.txtGioitinh;  
   client.query("INSERT INTO thongtin(hoten, email,gioitinh,password ) VALUES('"+hoten+"','"+email+"','"+gioitinh+"','"+password+"') " , function(err , result){
       done();
       if(err){
           res.end();
           return console.error('error running query',err);
       }
       //console.log(result.rows[0].hoten);
       res.redirect('/singin') ;
       
   });
});
});





//*****************server *******************************
const port = 3000 ; 
app.listen(port, console.log('App listening port 3000')) ;  