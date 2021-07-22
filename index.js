require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const cookieSession   = require("cookie-session");
const cookieparser = require('cookie-parser');
const passport = require('passport');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

let users = {};

app.use(cors({
  origin : ["http://localhost:3001"],
  credentials : true,
  methods : ["GET","PUT","POST","DELETE","OPTIONS"]
})); 
app.use(express.json());
app.use(cookieparser())

const port = process.env.PORT || 3001;

const User = require('./models/user');
const General = require('./models/general');
const Cyber = require('./models/cyber.js'); 
const Cloud = require('./models/cloud.js');
const Machinelearning = require('./models/machinelearning.js');
const Appdev = require('./models/appdev.js');
const Programming = require('./models/programming.js');
const Ui = require('./models/ui.js');
const Web = require('./models/web.js');
const Freelancing = require('./models/freelancing.js');
const Ds = require('./models/ds.js');
const Datascience = require('./models/datascience.js');


app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys : ['key1']
  }));

mongoose.connect("mongodb://localhost:27017/kcespotChatroom",{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
        console.log("MongoDB Connected");
});
 mongoose.set('useFindAndModify', false);

    app.use(passport.initialize());
    app.use(passport.session()); 
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());


    var GoogleStrategy = require('passport-google-oauth20').Strategy;

    passport.serializeUser((user,done)=>{
      done(null,user.id);
    });

    passport.deserializeUser((id,done)=>{
      User.findById(id).then((user)=>{
        done(null,user);
      });
    });


      passport.use(new GoogleStrategy({
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/auth/google/redirect"
      }, (accessToken, refreshToken, profile, done)=>{
        User.findOne({googleId:profile.id}).then((currentUser)=>{
          if(currentUser){
            done(null,currentUser);
          }else{
            new User({
              username : profile._json.email,
              name     : profile.displayName,
              googleId : profile.id,
              image    : profile.photos[0].value
            }).save().then((newUser)=>{
              done(null,newUser);
            });
          }
        });
      })
     );

     app.get("/success", (req, res)=>{
 
            if(req.user){
              
                res.json(
                    {
                        success: true,
                        data: req.user,
                    }
                )
            }else{
                res.json(
                    {
                        success: false,
                        data: null,
                    }
                )
            }
        })


   app.get('/google',passport.authenticate('google', { scope: ['profile','email'] }));

   app.get('/auth/google/redirect', passport.authenticate('google'),(req, res)=> {
          // Successful authentication, redirect home.
          res.redirect('http://localhost:3000/dashboard');
    });

    io.on('connection',(socket)=>{
        

          socket.on('login', function(data){
              // saving userId to object with socket ID
              if(!users.hasOwnProperty(socket.id)){
                  users[socket.id] = data.userId;
              }
             io.emit('users',users);
          });
        
          socket.on('disconnect',()=>{
            delete users[socket.id];
            io.emit('users',users);
          });

          socket.on('newGeneralMessage',(generaldata)=>{
              General.create(generaldata,(err,docs)=>{
                    if(err){
                      console.log(err)
                    }else{
                      io.emit('generalData',docs);
                    }
              });
          });

          socket.on('newWebdevelopmentMessage',(data)=>{
            Web.create(data,(err,docs)=>{
                  if(err){
                    console.log(err)
                  }else{
                    io.emit('WebdevelopmentData',docs);
                  }
            });
        });

          socket.on('newFreelancingMessage',(newpost)=>{
            Freelancing.create(newpost,(err,docs)=>{
                  if(err){
                    console.log(err)
                  }else{
                    io.emit('FreelancingData',docs);
                  }
            });
        });

        socket.on('newProgrammingMessage',(data)=>{
          Programming.create(data,(err,docs)=>{
                if(err){
                  console.log(err)
                }else{
                  io.emit('ProgrammingData',docs);
                }
          });
      });

      socket.on('newDsMessage',(data)=>{
        Ds.create(data,(err,docs)=>{
              if(err){
                console.log(err)
              }else{
                io.emit('dsData',docs);
              }
        });
    });

    socket.on('datascienceMessage',(data)=>{
      Datascience.create(data,(err,docs)=>{
            if(err){
              console.log(err)
            }else{
              io.emit('datascienceData',docs);
            }
          });
      });

      socket.on('appdevMessage',(data)=>{
        Appdev.create(data,(err,docs)=>{
              if(err){
                console.log(err)
              }else{
                io.emit('appdevData',docs);
              }
        });
      });

      socket.on('cloudcomputingMessage',(data)=>{
        Cloud.create(data,(err,docs)=>{
              if(err){
                console.log(err)
              }else{
                io.emit('cloudcomputingData',docs);
              }
        });
      });

      socket.on('machinelearningMessage',(data)=>{
        Machinelearning.create(data,(err,docs)=>{
              if(err){
                console.log(err)
              }else{
                io.emit('machinelearningData',docs);
              }
        });
      });

      socket.on('cyberMessage',(data)=>{
        Cyber.create(data,(err,docs)=>{
              if(err){
                console.log(err)
              }else{
                io.emit('cyberData',docs);
              }
        });
      });

      socket.on('uiMessage',(data)=>{
        Ui.create(data,(err,docs)=>{
              if(err){
                console.log(err)
              }else{
                io.emit('uiData',docs);
              }
        });
      });

    });

    

  app.get("/",(req,res)=>{
      res.send("<h1>Hello World! Welcome to Home Page!</h1>")
  });

  app.post('/login',(req,res)=>{
      var user = req.body;

      User.findOne({googleId:req.body.googleId}).then((currentUser)=>{
          if(currentUser){
              res.json(currentUser);
          }else{
              User.create(user,(err,user)=>{
              if(err){
                  console.log(err);
              }else{
                  console.log(user);
                  res.json(user);
                  }
              });
          }
      })
  });

  app.get("/user",(req,res)=>{
      User.find({}).sort({"name" : 1}).exec((err,user)=>{
          if(err){
              console.log(err);
          }else{
              res.json(user)
          }
      })
  })


//! All Fetch Api's are here

  app.get('/general',(req,res)=>{
    General.find({}).populate('author').exec((err,chat)=>{
      if(err){
        console.log(err);
      }else{
        res.json({chat});
      }
    })
  });

  app.get('/freelancing',(req,res)=>{
    Freelancing.find({}).populate('author').exec((err,chat)=>{
      if(err){
        console.log(err);
      }else{
        res.json({chat});
      }
    })
  });

  app.get('/webdev',(req,res)=>{
    Web.find({}).populate('author').exec((err,chat)=>{
      if(err){
        console.log(err);
      }else{
        res.json({chat});
      }
    })
  });

  app.get('/programming',(req,res)=>{
    Programming.find({}).populate('author').exec((err,chat)=>{
      if(err){
        console.log(err);
      }else{
        res.json({chat});
      }
    })
  });

  app.get('/ds',(req,res)=>{
    Ds.find({}).populate('author').exec((err,chat)=>{
      if(err){
        console.log(err);
      }else{
        res.json({chat});
      }
    })
  });

  app.get('/datascience',(req,res)=>{
    Datascience.find({}).populate('author').exec((err,chat)=>{
      if(err){
        console.log(err);
      }else{
        res.json({chat});
      }
    })
  });  

  app.get('/appdev',(req,res)=>{
    Appdev.find({}).populate('author').exec((err,chat)=>{
      if(err){
        console.log(err);
      }else{
        res.json({chat});
      }
    })
  });

  app.get('/cloud',(req,res)=>{
    Cloud.find({}).populate('author').exec((err,chat)=>{
      if(err){
        console.log(err);
      }else{
        res.json({chat});
      }
    })
  });

  app.get('/machinelearning',(req,res)=>{
    Machinelearning.find({}).populate('author').exec((err,chat)=>{
      if(err){
        console.log(err);
      }else{
        res.json({chat});
      }
    })
  });

  app.get('/cyber',(req,res)=>{
    Cyber.find({}).populate('author').exec((err,chat)=>{
      if(err){
        console.log(err);
      }else{
        res.json({chat});
      }
    })
  });

  app.get('/ui',(req,res)=>{
    Ui.find({}).populate('author').exec((err,chat)=>{
      if(err){
        console.log(err);
      }else{
        res.json({chat});
      }
    })
  });


//! All Fetch Api's *****ENDS***** here

  app.get('/logout',(req,res)=>{
    req.cookieSession = null;
    req.logout()
    res.redirect('http://localhost:3000/');
  });

  server.listen(port,()=>{
      console.log("Server Connected on BackEnd Port No = " + port);
  });