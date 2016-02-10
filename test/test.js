var server = require('../server/server.js');
var fs = require('fs');
var path = require('path');
var supertest = require('supertest');
var mocha = require('mocha');
var querystring = require('querystring');

var request = supertest.agent(server);

var token;

describe("server", function(){
  describe('GET /', function(){
    it("should return index.html", function(done){
      request
        .get('/')
        .expect(200, done);
    });
  });
});

describe("sign up and log in", function(){
  describe('POST', function() {
    it("should sign up a new user", function(done) {
      request
        .post('/signup')
        .send(querystring.stringify({'email':'test1@test1.com','full_name':'John Smith','password':'test123','monthly_limit':1000, 'savings_goal':200,'total_savings':5000}))
        .expect(201, function(err){
          if(err) {
            console.log('error signing up new user');
          }
          done(err);
        });
    });

    it("should log in an existing user", function(done) {
      request
        .post('/login')
        .send(querystring.stringify({'email':'test6@test6.com','password':'test'}))
        .expect(201, function(err){
          if(err) {
            console.log('error logging in an existing user');
          }
          done(err);
        });
      });
  });
});


describe("endpoints should be protected", function(){
  describe('GET', function() {
    it("should return 401 when no user logged in and getting expenses", function(done) {
      request
        .get('/expenses/7')
        .expect('Content-Type', "text/plain; charset=utf-8")
        .expect(401, function(err){
          if (err) {
            console.log('error in get expenese test');
          }
          done(err);
        });
    });
  });

  describe('POST', function() {
    it("should return 401 when no user loggin in and posting an expense", function(done) {
      request
        .post('/expenses')
        .send(querystring.stringify({'name':'something','amount':'10','category':'household','spent_date':'2016-02-09 12:02:10'}))
        .expect(401, function(err){
          if (err) {
            console.log('error in post expenese test');
          }
          done(err);
        });
    });
  });
});

describe("goals", function(){
  describe('POST', function(token, done) {
    it("should add a new goal", function(done) {
      request
        .post('/signup')
        .send(querystring.stringify({'email':'test2@test2.com','full_name':'John Smith','password':'test123','monthly_limit':1000, 'savings_goal':200,'total_savings':5000}))
        .expect(200, function(err, res){
          token = res.header.token;
           request
            .post('/goals')
            .set('x-access-token', token)
            .send(querystring.stringify({'name':'New Ferrari','amount':500000,'category':'Transportation','notes':'Testarossa - black, preferably'}))
            .expect(201, function(err){
          if(err) {
            console.log('error adding a goal');
          }
          done(err);
        });
        });
    });
  });
});

describe("expenses", function(){
  describe('POST', function(token, done) {
    it("should add a new expense after signing up", function(done) {
      request
        .post('/signup')
        .send(querystring.stringify({'email':'test@test.com','full_name':'Test Test','password':'testtest','monthly_limit':2000, 'savings_goal':100,'total_savings':10000}))
        .expect(200, function(err, res){
          token = res.header.token;
           request
            .post('/expenses')
            .set('x-access-token', token)
            .send(querystring.stringify({'name':'testexpense','amount':'500','Category':'Rent','notes':'testnotes', 'spent_date':'2016-02-09 12:02:10'}))
            .expect(201, function(err){
          if(err) {
            console.log('error adding an expense');
          }
          done(err);
        });
      });
    });
  });
});

describe("twitter api", function(){
  describe('GET', function() {
    it("should return a stream of 100 tweets", function(done) {
      request
        .get('/learn')
        .expect('Content-Type', /json/)
        .expect(hasTweets)
        .end(done);
      function hasTweets(response) {
        if (response.body.statuses.length === 100) {
          return true;
        } else {
          throw new Error("100 tweets wasn't returned");
        }
      }
    });
  });
});
