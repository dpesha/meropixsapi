
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , path = require("path")
  , mongoose = require('mongoose');

var app = module.exports = express.createServer();
var auth = express.basicAuth('meropixsapi','12345');

// Database
mongoose.connect('mongodb://localhost/meropixsdb');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Schema
var Schema = mongoose.Schema;  

var User = new Schema({  
    name: { type: String, required: true },  
    address: { type: String, required: true }    
});

var UserModel = mongoose.model('User', User);

// CRUD

// READ
app.get('/api/users', function (req, res){
  
  if(req.query['name'] && req.query['address']){
      var user;
      console.log("GET: ");
      console.log(req.query);
      user = new UserModel({
      name: req.query['name'],
      address: req.query['address'],
    });
    user.save(function (err) {
      if (!err) {
        return console.log("created");
      } else {
        return console.log(err);
      }
    });
  }
  return UserModel.find(function (err, users) {
    if (!err) {
      return res.send(users);
    } else {
      return console.log(err);
    }
  });
});

// CREATE
app.post('/api/users', auth, function (req, res){
  var user;
  console.log("POST: ");
  console.log(req.body);
  user = new UserModel({
    name: req.body.name,
    address: req.body.address,
  });
  user.save(function (err) {
    if (!err) {
      return console.log("created");
    } else {
      return console.log(err);
    }
  });
  return res.send(user);
});

// READ SINGLE 
app.get('/api/users/:id', function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    if (!err) {
      return res.send(user);
    } else {
      return console.log(err);
    }
  });
});

// UPDATE
app.put('/api/users/:id', function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    user.name = req.body.name;
    user.address = req.body.address;    
    return user.save(function (err) {
      if (!err) {
        console.log("updated");
      } else {
        console.log(err);
      }
      return res.send(user);
    });
  });
});

// DELETE
app.delete('/api/users/:id', function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    return user.remove(function (err) {
      if (!err) {
        console.log("removed");
        return res.send('');
      } else {
        console.log(err);
      }
    });
  });
});


// Routes

app.get('/', routes.index);

app.get('/api', function(req,res){
  res.send("Mero Pixs API is running");
});


app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
