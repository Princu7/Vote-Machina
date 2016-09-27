var url=require('url');
var express=require('express');
var path=require('path');
var app=express();
var bodyParser=require('body-parser');
var cookieParser=require('cookie-parser');
var mongoClient=require('mongodb').MongoClient;
var url="mongodb://localhost:27017/voting";
var uuid=require('node-uuid');
var crypto=require('crypto');
app.use(express.static(path.join(__dirname,'public')));
app.set('views','./views');
app.set('view engine','jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
mongoClient.connect(url,function(err,database){
    if(err)
        throw err;
    console.log("connected to database");
    db=database;
    db.collection('sessions').ensureIndex( { "timestamp": 1 }, { expireAfterSeconds: 3600 } );
});
function searchMongo(colName,queryObj,callback){
    db.collection(colName).findOne(queryObj,{_id:0},function(err,doc){
        if(err)
            throw err;
        callback(doc);
    });
}
function insertMongo(colName,doc,callback){
    db.collection(colName).insert(doc,function(err,res){
        if(err)
            throw err;
        console.log(colName+" collection updated");
        if(typeof callback==='function')
            callback();
    });
};

var findPolls=function(callback){
    var newarr=[];
    var cursor=db.collection("polls").find({},{_id:0,"options":0});
    cursor.each(function(err,doc){
        if(err)
            throw err;
        if(doc!=null){
            console.log(doc);
            newarr.push(doc);
        }
        else
            callback(newarr);
    });
}
app.use(function(req,res,next){
    console.log("middleware");
    console.log(req.cookies);
    console.log("this is url of request "+req.url);
    req.session={};
    req.session.user=null;
    //why not this working Object.keys(req.cookies).length === 0 && req.cookies.constructor === Object
    if(Object.keys(req.cookies).length === 0){
        var id=uuid.v1();
        console.log("I am coming here inside no cookie zone");
        res.cookie('sessionid', id, { expires: new Date(Date.now() +9800000 ), httpOnly: true });
        req.session.sid=id;
        next();
        return;
    }
    req.session.sid=req.cookies['sessionid'];
    var queryObj={"sid":req.session.sid};
    searchMongo("sessions",queryObj,function(doc){
        if(doc!=null)
            req.session.user=doc['user'];
        console.log(req.cookies);
        next();
    });
});

app.get('/',function(req,res){
    findPolls(function(usearr){
        res.render('index',{arr:usearr});
    });
    //res.render('index');
});
app.get('/signup',function(req,res){
    res.render('register')
});
app.post('/signup',function(req,res){
	console.log("inside post signup");
    var userinfo=req.body;
    console.log(userinfo);
    var salt=crypto.randomBytes(16).toString('hex');
    var hash=crypto.pbkdf2Sync(req.body.password, salt, 1000, 64).toString('hex');
    delete userinfo.password;
    userinfo.salt=salt;
    userinfo.hash=hash;
    userinfo.polls=[];
    insertMongo("voting",userinfo);
    delete userinfo.hash;
    delete userinfo.salt;
    delete userinfo.documents;
    delete userinfo.polls;
    var obj={"sid":req.session.sid,"user":userinfo,"timestamp":Date()};
    insertMongo("sessions",obj,function(){
        res.redirect('home');
    });
});

app.get('/login',function(req,res){
    console.log("inside get login");
    res.render('login');
});

app.post('/login',function(req,res){
	console.log("inside post login");
    var inputuser=req.body.username;
    var inputpass=req.body.password;
    var queryObj={"username":inputuser};
	searchMongo("voting",queryObj,function(doc){
		console.log(doc);
	    if(doc==null){
            res.redirect("/")
            //res.render('/',{message: "The user not not found. "});
            return;
            }
        var hash=crypto.pbkdf2Sync(inputpass, doc.salt, 1000, 64).toString('hex');  
	    if(inputuser==doc.username && hash!=doc.hash){ 
            //res.render('',{message: "The password was inserted in the wrong manner"});
            res.redirect("/");
        }
        else if(inputuser==doc.username && hash==doc.hash){
            delete doc.hash;
            delete doc.salt;
            delete doc.polls;
            var obj={"sid":req.session.sid,"user":doc,"timestamp":Date()};
            insertMongo("sessions",obj,function(){
                res.redirect('/home');
            });
        }
    });
});

app.get('/home',function(req,res,next){
    if(req.session.user==null)
        res.redirect('/');
    else{
        findPolls(function(usearr){
            var usergreet="Welcome "+req.session.user.username;
            res.render('home',{arr:usearr,userdes:usergreet});
        });
    }
});
app.get('/createPoll',function(req,res){
    if(req.session.user===null){
        res.redirect("/");
        return;
    }
    res.render('createPoll');
});
app.post('/createpoll',function(req,res){
    if(req.session.user===null){
        res.redirect('/');
        return;
    }
    console.log("inside post createpoll");
    console.log(req.body);
    var doc={"pollques":req.body.pollques,"username":req.session.user.username,
        "totalVotes":0};
    delete req.body.pollques;
    var tempobj={};
    for(var prop in req.body){
        var newprop=req.body[prop];
        tempobj[newprop]=0;
    }
    doc.options=tempobj;
    console.log(doc);
    insertMongo('polls',doc,function(){
        var quesname=doc.pollques;
        db.collection('voting').update({"username":req.session.user.username},{$push: {
            "polls":quesname}},function(err){
                if(err)
                    throw err;
                console.log("All inserted");
                res.redirect('/home');
            });
    });
});

app.get('/logout',function(req,res,next){
    console.log("I am inside logout");
    if(req.session.user==null)
        res.redirect('/');
    db.collection('sessions').remove({"sid":req.session.sid});
    res.redirect('/');
});
app.get('/user/:name',function(req,res){
    console.log("I am in users section\n");
    var username=req.params.name;
    searchMongo("voting",{"username":username},function(doc){
        console.log(doc);
        var newdoc={};
        newdoc.username=username;
        newdoc.polls=doc.polls;
        newdoc.email=doc.email;
        res.render('users',{user:newdoc});
    });
});
app.get('/pollquestion/(*)',function(req,res){
    //var ques=req.params.question;
    //console.log("this is the poll questiona "+ques);
    var ques=decodeURI(req.url).split('/')[2];
    console.log(ques);
    searchMongo("polls",{"pollques":ques},function(userdoc){
        console.log(userdoc);
        res.render('question.jade',{doc:userdoc,user:req.session.user});
    });
});
app.get('/answer/(*)',function(req,res){
    console.log("inside answer");
    var url=decodeURI(req.url).split('/');
    var pollques=url[2];
    var optionSel=url[3];
    console.log(pollques);
    console.log(optionSel);
    var actions={};
    var key="options."+optionSel;
    actions[key]=1;
    // learn how to properly update these type of nested documents.Remember
    db.collection("polls").update({"pollques":pollques},{$inc:actions},function(err){
        if(err)
            throw err;
        db.collection("polls").update({"pollques":pollques},{$inc:{totalVotes:1}},function(err){
            if(err)
                throw err;
                res.end("updation was done successfully");
        });
    });
});
app.get('/query/(*)',function(req,res){
    console.log("inside query");
    var url=decodeURI(req.url).split('/');
    var pollques=url[2];
    console.log(pollques);
    searchMongo("polls",{"pollques":pollques},function(doc){
        var origArr=[];
        console.log(doc);
        Object.keys(doc.options).forEach(function(key,index){
            var tempArr=[];
            tempArr.push(key);
            tempArr.push(doc.options[key]);
            origArr.push(tempArr);
        });
        console.log(origArr);
        res.status(200).json({arr:origArr});
        res.end();
    });
});

app.get('/viewmypolls',function(req,res){
    console.log("I am inside viewmypolls");
    if(req.session.user==null){
        res.redirect('/');
        return;
    }
    var username=req.session.user.username;
    searchMongo("voting",{"username":username},function(doc){
        var newdoc={};
        newdoc.username=doc.username;
        newdoc.polls=[];
        doc.polls.forEach(function(element,index){
            console.log(element);
            searchMongo("polls",{"pollques":element},function(polldoc){
                console.log(polldoc);
                console.log(newdoc.polls.length);
                console.log(doc.polls.length);
                newdoc.polls.push({"question":element,"totalVotes":polldoc.totalVotes});
                if(newdoc.polls.length==doc.polls.length){
                    res.render('viewmypoll',{user:newdoc});
                    return;
                }
            });
        });
    });
});
app.get('/delete/(*)',function(req,res){
    if(req.session.user==null){
        res.redirect("/");
        return;
    }
    var ques=decodeURI(req.url).split('/')[2];
    console.log(ques);
    var username=req.session.user.username;
    var remove={"polls":ques};
    db.collection("voting").update({"username":username},{$pull:remove});
    db.collection("polls").remove({"pollques":ques,"username":username},{justOne:true});
});
app.get('/modify/(*)',function(req,res){
    if(req.session.user===null){
        res.redirect("/");
        return;
    }
    var ques=decodeURI(req.url).split('/')[2];
    console.log(ques);
    searchMongo("polls",{"pollques":ques},function(doc){
        res.render("modify",{ques:doc});
        return;
    });
});

app.get('/optiondelete/(*)',function(req,res){
    if(req.session.user===null){
        res.redirect("/");
        return;
    }
    console.log("I am coming here");
    var url=decodeURI(req.url).split('/');
    console.log(url);
    var ques=url[2];
    var option=url[3];
    console.log("this is question "+ques);
    console.log("this is the corresponding "+option);
    var key="options."+option;
    var actions={}
    actions[key]=""
    console.log(actions);
    db.collection("polls").update({"pollques":ques},{$unset:actions})
});

app.listen(8000);
