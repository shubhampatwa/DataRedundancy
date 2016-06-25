var express = require('express');
var multipart=require('connect-multiparty');
var passport = require('passport');
var mongoose=require('mongoose');
require('../config/passport')(passport); 
var User = mongoose.model('User');
var File=mongoose.model('File');
var fs=require('fs');
var Grid = require('gridfs-stream');
var mongo=require('mongodb');
var multipartMiddleware = multipart();
var db= new mongo.Db('test', new mongo.Server("127.0.0.1", 27017), { safe : false });
var router = express.Router();
var app=express();
db.open(function (err) {
  if (err) {
    throw err;
  }
  var gfs = Grid(db, mongoose.mongo);
  var app = express();
// mongoose.connect('mongodb://localhost/dedup');

/* GET home page. */
var hashfrombody="";
var filenamefrombody="";
var flag;
router.post('/upload',multipartMiddleware, function(req, res) {
	if(!flag){
  console.log("path:",req.files.ufiles.path);
  //var hash=req.form.out;
  console.log("hash:",hashfrombody);
    var tempfile    = req.files.ufiles.path;
    var origname    = req.files.ufiles.name;
    var writestream = gfs.createWriteStream({ _id:hashfrombody,filename: origname, metadata: { count:1 } });
    // open a stream to the temporary file created by Express...
    fs.createReadStream(tempfile)
      .on('end', function() {
        res.send('Your File is Uploaded and instance is created');
      })
      .on('error', function() {
        res.send('ERR');
      })
      // and pipe it to gfs
      .pipe(writestream);}
      else{
        console.log("yesss");
        res.send('Your File is uploaded ,no instance is created');
      }
      //redirect('/profile');
  });
/* GET home page. */
router.get('/',isNotLoggedIn, function(req, res,next) {
  res.render('index', { title: 'Express',user:req.user });
});

router.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


router.get('/login',isNotLoggedIn,function(req,res,next){
	res.render('login',{message:req.flash('loginMessage')});
});
router.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

router.get('/signup',isNotLoggedIn,function(req, res,next) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });
 router.get('/profile', isLoggedIn, function(req, res,next) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });
 router.get('/logout', function(req, res,next) {
        req.logout();
        res.redirect('/');
    });

router.get('/check',function(req,res){
	var file=new File(req.query);
	file.filename=req.query.file_name;
	file.hash=req.query.hash_value;
  hashfrombody=req.query.hash_value;
  filenamefrombody=req.query.file_name;
	console.log(file.filename,file.hash,hashfrombody);
	file.save(function(err,file){
		if (err) {return err};

	req.user.files.push(file);
	req.user.save(function(err,user){
		if(err)return err;
		//console.log(user,"success");
	});
});
  var count=0;
   var cursor =db.collection('fs.files').find({_id:hashfrombody}).limit(1);
   cursor.forEach(
      function(doc)
      {
        console.log(doc);
        count=count+1;
        flag=1;
        res.send('1');
        return;
      },
      function(err)
      {
        if(!count){
          flag=0;
          console.log("Error Not Found Data");
          res.send('0');
        }
        return;
      }
    );
   // cursor.forEach(function(err, doc) {
   //    //assert.equal(err, null);
   //    if (doc == null) {
   //      console.log("nhi mila");
   //      res.send('1');
   //      return;
   //    }
   //     else {
   //      count=1;
   //    console.log(doc);
   //       res.send('0');
   //       return;
   //    }
   // });
	
})
//  fs.readFile('Welcome Letter.pdf', function (err, data) {
//    if (err) {
//        return console.error(err);
//    }
//    console.log("Asynchronous read: " + data.toString());
// });
  //var f="fs.files";
  // fs.find({_id:file.hash},function(err,files){
  //  if (err) {return err;}
  //  console.log(files);
  // })
  //var readstream = gfs.createReadStream({_id:file.hash});
  //console.log("!");
  //console.log(readstream);
  // db.collection('users').find(function(err,f){
  //  if (err) {return err;}
  //  console.log(f);
  // })

 function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
 function isNotLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (!req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/profile');
}

});

module.exports = router;
