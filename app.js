const cart = require('./models/cart');

var express = require('express'),
    bodyparser = require('body-parser'),
    path = require('path'),
    mongoose = require('mongoose'),
    multer = require('multer'),
    mehtodOverride = require('method-override'),
    fs = require('fs'),
    app = express(),
    items = require('./models/item'),
    user = require('./models/user'),
    admin = require('./models/admin'),
    Cart = require('./models/cart'),
    Order = require('./models/order'),
    faq = require('./models/faq'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    session       = require('express-session'),
    MongoStore    = require('connect-mongo'),
    nodemailer    = require('nodemailer');

require('dotenv/config');

// mongoose.connect('mongodb://localhost/Pastries', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });
mongoose.connect('mongodb+srv://noman:noman54321@cakes-pastry.fzbte.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });
// mongoose.connect('mongo "mongodb+srv://cakes-pastry.fzbte.mongodb.net/myFirstDatabase" --username noman', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
// app.use('./images', express.static(path.join(__dirname, 'images')));
app.use(mehtodOverride('_method'));

app.set('view engine', 'ejs');

//========================
//Passport Confi
//========================
app.use(session({
    secret: 'Pastries and Cakes',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongoUrl : 'mongodb+srv://noman:noman54321@cakes-pastry.fzbte.mongodb.net/cart-session?retryWrites=true&w=majority' }),
    // store: new MongoStore({ mongoUrl : 'mongodb://localhost/CartSession' }),
    cookie: { maxAge: 20 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
//multer storage file

app.use(function(req,res,next){
    res.locals.session = req.session;
    res.locals.CurrentAdmin = req.admin;
    res.locals.CurrentUser = req.user;
    next();
})

var storage = multer.diskStorage({

    destination: 'public/assets/images/products/',
    filename: (req, file, cb) => {

        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage }).single('image');

//====================
// USER-PANEL ROUTES
//====================
app.get('/', function (req, res) {
    res.redirect('/index');
});

app.get('/index', function (req, res) {
    res.render('user/vegetables');
});

//  USER-REGISTER ROUTE
app.get('/register', function (req, res) {
    res.render('user/register');
});
app.post('/register', function (req, res) {
    user.register(new user({ username: req.body.username, email: req.body.email, address: req.body.address, phoneno: req.body.phoneno }), req.body.password, function (err, User) {
        // console.log(User);
        if (err) {
            console.log(err);
            return res.redirect('/register');
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

// USER-LOGIN ROUTE'S

app.get('/login', function (req, res) {
    res.render('user/login');
    
});
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}), function (req, res) {
});

//Logout ROUTE
app.get('/logout', function (req, res) {
    req.logOut();
    res.redirect('/');
    
})
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}


//About US 
app.get('/aboutus', function (req, res) {
    res.render('user/about-page');
});

app.get('/products', function (req, res) {
    items.find({}, function (err, findallProducts) {
        if (err) {
            console.log(err)
        } else {
            res.render('user/category-page(3-grid)', { showPrducts: findallProducts });
        }
    });
});

app.get('/products/:Category', function (req, res) {
    items.find({category : req.params.Category} , function (err, findallProducts) {
        if (err) {
            console.log(err)
        } else {
            res.render('user/category-page(3-grid)', { showPrducts: findallProducts });
        }
    });
});

app.get('/products/:id', function (req, res) {
    items.findById(req.params.id, function (err, findsingleProducts) {
        if (err) {
            console.log(err)
        } else {
            console.log(findsingleProducts)
            res.render('user/product-page(accordian)', { oneProduct: findsingleProducts });
            // res.render('product-list', {product : findallProducts})
        }
    });
});
app.get('/contact', function (req, res) {
    res.render('user/contact');
});
app.get('/faq', function (req, res) {
    faq.find({} , function(err , faq){
        if(err){
            console.log(err)
        }else{
            console.log(faq);
            res.render('user/faq' , {faq : faq});
        }
    })
});

app.get('/forgetpwd', function (req, res) {
    res.render('user/forget_pwd');
});

app.get('/cart', isLoggedIn , function (req, res) {
    
    if(!req.session.cart){
        return  res.render('user/cart', { products: null });
    }
    else{
        var cart = new Cart(req.session.cart);

        // console.log(req.session.cart.items[id]);
        // req.session.cart.items.forEach(function(item){
        //     console.log(item[id])
        // })
            
        // console.log(req.session.cart.items[id])
        res.render('user/cart', { products: cart.generateArray() , totalPrice : cart.totalPrice  });
        // console.log(products);
    }

    // user.findById(req.user._id).populate('Cart').exec(function (err, find) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log('find item is');
    //         console.log(find.cart.title);
    //         res.render('user/cart', { products: find });
    //     }
    // })
});

app.post('/cart/:id', isLoggedIn , function (req, res) {
    var ItemID = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {})

    items.findById(ItemID , function(err , product){
        if(err){
            console.log(err);
            return res.redirect('/products');
        }else{
            
            cart.add(product, product.id);
            req.session.cart = cart;
            res.redirect('/products');
        }
    })
    
})

app.get('/checkout', isLoggedIn ,function (req, res) {

    if(!req.session.cart){
        return  res.redirect('/cart');
    }
    else{
        var cart = new Cart(req.session.cart);
        // console.log(products);
        user.findById(req.user._id , function(err ,findUser){
            if(err){
                console.log(err);
            }else{
                res.render('user/checkout', { products: cart.generateArray() , totalPrice : cart.totalPrice, user: findUser  });
            }
        })
    }
   
}); 
app.get('/orderSuccess', isLoggedIn , function (req, res){
    var arr= []
    for(var ids in req.session.cart.items){
        arr.push(req.session.cart.items[ids]);
    } 
    var order = new Order({
       user : {
        username        : req.user.username,
        email           : req.user.email,
        address         : req.user.address,
        phoneno         : req.user.phoneno,
       },
       cart: {
           products : arr,
           totalPrice : req.session.cart.totalPrice,
           totalQty : req.session.cart.totalQty
       } 
    }); 



    order.save(function(err , saveOrder){
        if(err){
            console.log(err);
        }else{
            var cart = new Cart(req.session.cart);
            req.session.cart = {} ; 
            res.render('user/order-success'  , { user : req.user, products: cart.generateArray() , totalPrice : cart.totalPrice,  });
        //    console.log(saveOrder);
           
            
            var source = "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<style>" +
            "#customers {" +
              "font-family: Arial, Helvetica, sans-serif;" +
              "border-collapse: collapse;" +
              "width: 100%;" +
            "}" +
            "#customers td, #customers th {" +
              "border: 1px solid #ddd;" +
              "padding: 8px;" +
            "}" +
            "#customers tr:nth-child(even){background-color: #f2f2f2;}" +                    
            "#customers tr:hover {background-color: #ddd;}" +                    
            "#customers th {" +
              "padding-top: 12px;" +
              "padding-bottom: 12px;" +
              "text-align: left;" +
              "background-color: #805e3f;" +
              "color: white;" +
            "}" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<p>Dear Customer  <strong>" + req.user.username +  "</strong> Your order has been placed on order-no#" + saveOrder._id +"</p>" + 
            "<p>Just to let you know — we've received your order # 60dc8ff92367262b40687cfb , and it is now being processed:</p>" +
            "<p>Pay with cash upon delivery. The Products will be delivered withing 2-4 business days after confirmation call!</p>" +
            "<table id='customers'>" +
              "<tr>" +
                "<th>Product Name</th>" +
                "<th>Quantity</th>" +
                "<th>Price</th>" +
              "</tr>";

            saveOrder.cart.products.forEach(function(Item){
                source += "<tr>" +
                            "<td>" + Item['item']['title'] + "</td>" +
                            "<td>" + Item['qty'] + "</td>" +
                            "<td>" + Item['price'] + "</td>" +
                          "</tr>" 
            })

            source += "</table>" +
            "<h2>Total Price: " + saveOrder.cart.totalPrice + "</h2>"            
            "</body>" +
            "</html>";

                var transporter = nodemailer.createTransport({
                    host : 'smtp.gmail.com',
                    service: 'gmail',
                    auth: {
                    user: 'haidermannan.cs@gmail.com',
                    pass: 'hsk@4948'
                    }
                });
                
                var mailOptions = {
                    from: 'haidermannan.cs@gmail.com',
                    to: 'nomimujahid1144@gmail.com',
                    subject: 'Sending Email using Node.js',
                    text: 'That was easy!',
                    html: source
                };
                
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                    console.log(error);
                    } else {
                    console.log('Email sent: ' + info.response);
                    }
                });
            
        
        }
    })
    
});
app.get('/userprofile' , isLoggedIn ,  function(req,res){
    Order.find({} , function(err ,findorder){
        if(err){
            console.log(err);
        }else{
            user.findById(req.user._id, function(err , user){
                if(err){
                    console.log(err)
                }else{
                    console.log(user.username);
                    res.render('user/userprofile', {   order: findorder , user: user});
                }
            })
                
        }
    })
})

//======================
//ADMIN PANEL ROUTES
//======================

app.get('/admin', isadminLoggedIn , function (req, res) {
    
    Order.find({} , function(err ,orderUser){
        if(err){
            console.log(err);
        }else{
            // console.log(orderUser);
            res.render('admin/index' ,{orders : orderUser } );
        }
    });
    
});

app.get('/admin/register',  function (req, res) {
    res.render('admin/register');
    
});
app.post('/admin/register', function (req, res) {
    admin.register(new admin({ username: req.body.username , email: req.body.email }), req.body.password, function (err, admin) {
        if (err) {
            console.log(err);
            return res.redirect('/admin/register');
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/admin');
        });
    });
});

// ADMIN-LOGIN ROUTE'S

app.get('/admin/login',  function (req, res) {
    res.render('admin/login');
    
});

app.post('/admin/login', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/admin/login'
}), function (req, res) {
});

//ADMIN-Logout ROUTE
app.get('admin/logout', function (req, res) {
    req.logOut();
    res.redirect('admin/login');
    
})





app.get('/admin/order/:id',  function (req, res) {

    Order.findById( req.params.id , function(err ,findorder){
        if(err){
            console.log(err);
        }else{
            
            
            res.render('admin/order' , {orders : findorder  } );
        }
    });    
});

app.get('/admin/category', function (req, res) {
    res.render('admin/category');
});

app.get('/admin/product', function (req, res) {
    items.find({} , function (err, findallProducts) {
        if (err) {
            console.log(err)
        } else {
            // console.log(findallProducts.Image);
            res.render('admin/product-list', { products: findallProducts })
        }
    });
});

app.get('/admin/product/new' , function (req, res) {
    res.render('admin/product');
});

app.post('/admin/product', upload, function (req, res) {

    var obj = {
        title: req.body.Title,
        price: req.body.price,
        productCode: req.body.productcode,
        Image: req.file.filename,
        totalproducts: req.body.totalproducts,
        description: req.body.description,
        category: req.body.category,
    }
    items.create(obj, function (err, createitem) {

        if (err) {
            console.log(err)
            res.render('admin/product-list');
        } else {
            res.redirect('/admin/product');
        }
    });
});

app.get('/admin/product/:id/edit', function (req, res) {

    items.findById(req.params.id, function (err, editsingleProducts) {
        if (err) {
            console.log(err)
        } else {
            res.render('admin/edit', { editProduct: editsingleProducts });
            // res.render('product-list', {product : findallProducts})
        }
    });
});

app.put('/admin/product/:id', upload, function (req, res) {

    var obj = {
        title: req.body.Title,
        price: req.body.price,
        productCode: req.body.productcode,
        Image: req.file.filename,
        totalproducts: req.body.totalproducts,
        description: req.body.description,
    }
    items.findByIdAndUpdate(req.params.id, obj, function (err, updateProduct) {

        if (err) {
            res.redirect('/admin/product/:id/edit');
        } else {
            console.log(req.file.filename);
            console.log(updateProduct.Image);
            if(updateProduct.Image === req.file.filename){
                res.redirect('/admin/product');
            }else{
                pathToFile = 'public/assets/images/products/' + updateProduct.Image;
                fs.unlink(pathToFile, function (err, update) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(update);
                        res.redirect('/admin/product');
                    }
                });
            }
            
        }
    });
});

app.delete('/admin/product/:id', function (req, res) {

    items.findByIdAndRemove(req.params.id, function (err, dell) {
        // console.log(req.params.id);
        if (err) {
            console.log(err);
            res.redirect('/admin/product/');
        } else {
            // console.log(dell);
            // res.redirect('/admin/product/');
            pathToFile = 'public/assets/images/products/' + dell.Image;
            fs.unlink(pathToFile, function (err, delet) {
                if (err) {
                    console.log(err);
                } else {
                    // console.log(dell.Image);
                    res.redirect('/admin/product');
                }
            });
            // res.render('product-list', {product : findallProducts})
        }
    });
});

app.get('/admin/faq/new' , isadminLoggedIn , function(req,res){
    res.render('admin/faq')
})
app.post('/admin/faq' , function(req,res){
   var obj = {
       question : req.body.question,
       answer   : req.body.answer
   };
   faq.create(obj , function(err , faq){
       if(err){
           console.log(err);
       }else{
           res.redirect('/admin/faq/new')
       }
   })
})



function isadminLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('admin/login');
}

// app.listen(3000, function () {
//     console.log('server is connected');
// })
app.listen(process.env.PORT || 3000, function () {
    console.log('server is connected');
})
