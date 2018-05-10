const express = require("express") ; 
const app = express(); 
const bodyParser = require('body-parser')
const session = require('express-session'); 
const Passport = require('passport'); 
const LocalStrategy = require('passport-local').Strategy
const fs = require('fs')
const multer = require('multer'); // thu viên load file
const nodemailer = require('nodemailer'); // thu vien gui mail auto 
const request = require('request') ; 
var hbs = require('nodemailer-express-handlebars'); 
app.use(express.static("public"));
var pg = require('pg'); 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json()); 
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var bcrypt = require('bcrypt'); // thư vien ma hoa 
const saltRounds = 10;
var validator = require('express-validator');

var path = require('path');

var u;
app.set('views','./views'); 
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, 'views')));

app.use(bodyParser.urlencoded({extended: true}));
app.use(Passport.initialize())
app.use(Passport.session())
app.use(session({secret: "mysecret"}))
app.use(validator());

// register the session with it's secret ID
app.use(session({secret: 'uitisawesome'}));

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
                                     successRedirect:'/admin/index'})) // nếu login đúng chuyến tới trang loginOK

                                     

app.post('/login',function(req,res){
	// Very basic. Set the session e-mail to whatever the user has added.
	req.session.username = req.body.username;
	req.session.password = req.body.pass;
	res.end('done');
});


app.get('/login',function(req,res){
	// Check if an e-mail address is set in the session.
	// If it is, we will redirect to the admin page.
	if(req.session.username) {
	    res.redirect('/admin');
	}
	else {
	    res.render('/admin');
	}
});

app.get('/dathang',function(req,res){
  res.render('dathang') ; 
});

app.post("/dathang",urlencodedParser,function(req,res){
  // gui du lie len server 

  var Ten = req.body.Ten ; 
  var Sdt = req.body.Sdt ;
  var Diachi = req.body.Diachi;
  var Phuong = req.body.Phuong; 
  var Quan = req.body.Quan; 
  var Thanhpho = req.body.Thanhpho;
  pool.connect(function(err,client,done){
    if(err){
        return console.error('error fetching client from pool',err)
    }
    var sql = 'INSERT INTO "Donhang" ("Ten","Sdt","Diachi","Thanhpho","Quan","Phuong" ) VALUES(' +"'"+Ten+ "'"+ ','+Sdt+',' +"'"+Diachi+ "'" + ',' +"'"+Thanhpho+ "'" + ',' +"'"+Quan+ "'" + ',' +"'"+Phuong+ "'" + ') '
    client.query(sql, function(err , result){
      done();
      if(err){
        res.end();
        return console.error('error running query',err);
      }
      res.redirect('./');
    });
  });
});


app.get('/admin1',function(req,res){
	if(req.session.use) {
		res.write('<h1>Hello'+req.session.username+'</h1>');
		res.write('<a href="/logout">Logout</a>');
		res.end();
	} else {
		res.write('<h1>Please login first.</h1>');
		res.write('<a href="/">Login</a>');
		res.end();
	}
});

app.get('/logout',function(req,res){
	// if the user logs out, destroy all of their individual session
	// information
	req.session.destroy(function(err) {
		if(err) {
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});

Passport.use(new LocalStrategy(
    (username ,password,done)=> {
        fs.readFile('./userDB.json',(err,data) =>{
            const db =JSON.parse(data)
            const userRecord = db.find(user => user.usr == username)
            if(userRecord && userRecord.pwd == password){
                u=userRecord;
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
    destination: function(req,file,cb){
      cb(null,'./upload')
    },
    filename: function(req,file,cb){
      cb(null,file.originalname)
    }
  });
  
  // Init Upload
const upload = multer({storage:storage}).single('uploadfile')
  
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


//********************Send email**************************** */

  // create reusable transporter object using the default SMTP transport


  // send mail with defined transport object



//*******************************************Postgress for Sing In **********************/

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

app.get("/admin/blog",function(req,res){
  pool.connect(function(err,client,done){
    if(err){
        return console.error('error fetching client from pool',err)
    } 
    client.query('SELECT * FROM "thongtin" ', function(err , result){
        done();
        if(err){
            
            return console.error('error running query',err);
        }
        
        //res.redirect('/singin') ;
        //res.render("product-details");

        res.render("admin/blog",{data:result,user:u});
    });
  });
})


app.get("/admin/donhang",function(req,res){
  pool.connect(function(err,client,done){
    if(err){
        return console.error('error fetching client from pool',err)
    } 
    client.query('SELECT * FROM "Donhang" ', function(err , result){
        done();
        if(err){
            
            return console.error('error running query',err);
        }
        
        //res.redirect('/singin') ;
        //res.render("product-details");

        res.render("admin/donhang",{data:result,user:u});
    });
  });
});



app.post("/singin",urlencodedParser,function(req,res){
  // gui du lie len server 

  var hoten = req.body.txtHoten ; 
  var email = req.body.txtEmail ;
  var password = req.body.txtPassword;
  var password1 = req.body.txtPassword1; 
  var gioitinh = req.body.txtGioitinh; 

  req.checkBody('hoten', 'Email is required.').notEmpty();
  req.checkBody('email', 'Email is required.').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail(); 
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password1', 'Passwords do not match').equals(password);
  console.log(password1) ;
  pool.connect(function(err,client,done){
   if(err){
       return console.error('error fetching client from pool',err)
   }
  

  bcrypt.hash(password, saltRounds, function(err, hash) {
        client.query("INSERT INTO thongtin(hoten, email,gioitinh,password ) VALUES('"+hoten+"','"+email+"','"+gioitinh+"','"+hash+"') " , function(err , result){
          done();
          if(err){
              res.end();
              return console.error('error running query',err);
          }
          //console.log(result.rows[0].hoten);
        // res.redirect('/singin') ;
          
      });
    });
  });
   

    var transporter = nodemailer.createTransport('smtps://huynhhanthanh1997%40gmail.com:123456ht@smtp.gmail.com')

    // setup email data with unicode symbols
    transporter.use('compile',hbs({
      viewPath: 'views' , 
      extname:'ejs'
    }))
    transporter.sendMail({
      from:'huynhhanthanh1997@gmail.com', 
      to: email , 
      subject: 'thu xac nhan' , 
      template : 'mail' , 
      context:{
        hoten , 
        email,
        password 
      }
      
    },function(err,response){
      if(err){res.send('gui mail that bai');console.log(err)}else{
        res.send('thanh cong')
      }
    })

    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
    }
    // Put your secret key here.
    var secretKey = "	6LcTllcUAAAAAOKTY_Q2_FdDdWIpG_vGiCYDaxvy";
    // req.connection.remoteAddress will provide IP address of connected user.
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    request(verificationUrl,function(error,response,body) {
      body = JSON.parse(body);
      // Success will be true or false depending upon captcha validation.
      if(body.success !== undefined && !body.success) {
        return res.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
      }
      
    });
   
});

/**********************************************Postgress like********************** */
var config1 = { // cấu hình databasse item khac với trên 
  user:'postgres', 
  host: 'localhost', // server name or IP address;
  port: 5433,
  database: 'item',
  password: '123456ht',
  max: 10 , 
  idleTimeoutMillis: 3000,
};

var pool1 = new pg.Pool(config1); 


app.get("/admin/index",function(req,res){
  pool1.connect(function(err,client,done){
    if(err){
        return console.error('error fetching client from pool',err)
    } 
    client.query('SELECT * FROM "collection" ', function(err , result){
        done();
        if(err){
            
            return console.error('error running query',err);
        }
        
        //res.redirect('/singin') ;
        //res.render("product-details");

        res.render("admin/index",{data:result,user:u});
    });
  });
})


app.get("/admin/delete/:id",function(req,res){
  pool1.connect(function(err, client ,done){
    if(err){
      return console.error('error fetching client from pool',err)
    }
    client.query('DELETE FROM "collection" WHERE "Id" =' +  req.params.id, function(err , result){
      done();
      if(err){
          res.end() ; 
          return console.error('error running query',err);
      }
      res.redirect("../index");
    }); 
  });
});

app.get("/admin/add",function(req,res){
  res.render("admin/forms") ;
});

app.post("/admin/add",urlencodedParser,function(req,res){
  upload(req,res,function(err){
    if(err){
      res.send("loi"); 
    }else{
      if(req.file == undefined)
      {
        res.send("file chua duoc chon"); 
      }else{
        console.log(req.file.originalname) ; 
        console.log(req.body.tieude) ; 
        console.log(req.body.mota) ; 
        console.log(req.body.key) ; 
        pool1.connect(function(err,client,done){
          if(err){
              return console.error('error fetching client from pool',err)
          }
          var sql = 'INSERT INTO "collection" ("Hinh", "Like" , "Dislike" ,"Price") VALUES(' +"'"+req.file.originalname+ "'" + ','+req.body.tieude+','+req.body.mota+','+req.body.key+')'
          console.log(sql);
          client.query(sql, function(err , result){
              done();
              if(err){
                  
                  return console.error('error running query',err);
              }
              res.redirect("./index")
          });
        });
      }
    }
  })
});

app.get("/admin/edit/:id",function(req,res){
  var id = req.params.id ; 
  pool1.connect(function(err,client,done){
    if(err){
      res.end();
      return console.error('error running query',err);
    }
    client.query('SELECT * FROM "collection" WHERE "Id" =' + id , function(err , result){
      done();
      if(err){
          res.end();
          return console.error('error running query',err);
      }
      res.render("admin/edit",{data:result.rows[0],user:u});
      console.log(result.rows[0]);
    });
  });
});

app.post("/admin/edit/:id",urlencodedParser,function(req,res){
  var id = req.params.id ; 
  upload(req,res,function(err){
    if(err){
      res.send("xảy ra loi trong qua trinh Upload"); 
    }
    else{
      if(typeof(req.file)=='undefined'){
        pool1.connect(function(err,client,done){
          if(err){
            res.end();
            return console.error('error running query',err);
          }
          client.query('UPDATE "collection" SET "Hinh" = ' +"'"+req.file.originalname+ "'" + ',"Like"= '+req.body.tieude+', "Dislike" = '+req.body.mota+', "Price"= '+req.body.mota+' WHERE "Id" =' + id , function(err , result){
            done();
            if(err){
                res.end();
                return console.error('error running query',err);
            }
            res.redirect("../index");
          
          });
        });
      }
      else{
        pool1.connect(function(err,client,done){
          if(err){
            res.end();
            return console.error('error running query',err);
          }
          client.query('UPDATE "collection" SET "Hinh" = ' +"'"+req.file.originalname+ "'" + ',"Like"= '+req.body.tieude+', "Dislike" = '+req.body.mota+', "Price"= '+req.body.mota+' WHERE "Id" =' + id , function(err , result){
            done();
            if(err){
                res.end();
                return console.error('error running query',err);
            }
            res.redirect("../index");
          });
        }); 
      }
    }
  })
}); 

app.get("/chitiet/:id",function(req, res){
  var id = req.params.id; 
  pool1.connect(function(err,client,done){
    if(err){
        return console.error('error fetching client from pool',err)
    } 
    client.query('SELECT * FROM "collection" WHERE "Id" =' + id , function(err , result){
        done();
        if(err){
            res.end();
            return console.error('error running query',err);
        }
        console.log(result);
        //res.redirect('/singin') ;
        //res.render("product-details");
        res.render("product-details",{dangxem:id,hinh:result.rows[0].Hinh,like:result.rows[0].Like,dislike:result.rows[0].Dislike});
    });
  });
});
/************************************Postgress likeee*************************** */

var pool2 = new pg.Pool(config1); 
app.get("/like/:id",function(req,res){
  var id = req.params.id ; 
  pool1.connect(function(err,client,done){
    if(err){
        return console.error('error fetching client from pool',err)
    } 
    client.query('UPDATE "collection" SET "Like" = "Like" + 1 WHERE "Id" =' + id , function(err , result){
        done();
        
        if(err){
            res.end();
            return console.error('error running query',err);
        }
    
          client.query('SELECT * FROM "collection" WHERE "Id" =' + id  , function(err , result){
              done();
              
              if(err){
                  res.end();
                  return console.error('error running query',err);
              }
              console.log("UPDATE LIKE successful") ;
              console.log(result.rows[0].Like) ;
              res.render("product-details",{dangxem:id,hinh:result.rows[0].Hinh,like:result.rows[0].Like,dislike:result.rows[0].Dislike}) 
          });
    });
  }); 
});

app.get("/dislike/:id",function(req,res){
  var id = req.params.id ; 
  pool1.connect(function(err,client,done){
    if(err){
        return console.error('error fetching client from pool',err)
    } 
    client.query('UPDATE "collection" SET "Dislike" = "Dislike" + 1 WHERE "Id" =' + id , function(err , result){
        done();
        if(err){
            res.end();
            return console.error('error running query',err);
        }
        console.log();
        //res.redirect('/singin') ;
        //res.render("product-details");
       console.log("UPDATE DISLIKE successful") ; 
       res.end(); 
    });
}); 
});













//*****************server *******************************
const port = 3000 ; 
app.listen(port, console.log('App listening port 3000')) ;