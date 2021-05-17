const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

//.env doesn't work very well on replit tried many times
//change password later
const uri = 'mongodb+srv://ilker:123asd123@learningmongodb.duuyu.mongodb.net/database3?retryWrites=true&w=majority';

mongoose.connect(uri, {useFindAndModify: false,
 useNewUrlParser: true, useUnifiedTopology: true})

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

const sessionSchema = new mongoose.Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: String
})

//I could also use unique:true in options but went this way instead
const userSchema = new mongoose.Schema({
  username: {type: String, required:true},
  log:[sessionSchema]
})

const User = mongoose.model("User", userSchema)
const Session = mongoose.model("Session", sessionSchema)

// testId = "60a0f74bf6275c047c0e7d2d"

//this is the part I handled creating a user 
const responseObject = {}
app.post("/api/users",  bodyParser.urlencoded({ extended: false }), (req, res) => {
  const usernameInput = req.body.username
  //console.log(username)
  User.findOne({username:usernameInput}, (error, data) => {
    if(!error && data != undefined) {
      res.json("Username already taken")
      return
    } else if (!error) {
      const newUser = new User({username: usernameInput}).save((error, savedData) => {
        responseObject["username"] = savedData["username"]
        responseObject["_id"] = savedData["_id"]
        res.json(responseObject);
      })
    }
  })
})

//handling get request for all users
app.get("/api/users", (req, res) => {
  User.find({}, (error, allUsers) => {
    res.json(allUsers)
  })
})

//handling sessions here
app.post("/api/users/:_id/exercises", bodyParser.urlencoded({ extended: false }), (req, res) => {
  const id = req["params"]["_id"]
  const newSession = new Session({
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
  })

//if date's not given take now in the asked format, apparently ISO
  if(newSession.date === ""){
    newSession.date = new Date().toISOString().substring(0,10)
  }
  
  //I could also use findOneAndUpdate too but mongoose suggests 
  //I use id for this query  
  User.findByIdAndUpdate(id, 
  {$push:{log: newSession}}, 
  {new: true},
  (error, data) => {
//kept getting an "_id" not defined error but somehow fixed it
    //console.log(newSession)
    if(!error){
      responseObject["_id"] = id
      responseObject["username"] = data["username"]
//I keep getting invalid date error, gonna use date of newSession
      responseObject["date"] = new Date(newSession.date).toDateString()
      responseObject["duration"] = newSession["duration"]
      responseObject["description"] = newSession["description"]
      res.json(responseObject)
    }
  })
  //res.json(responseObject)
})


let resForGet = {}
//test first ID = 60a105ab70fa8306cbdff639
//handle the get request on /api/users/:_id/logs

app.get("/api/users/:_id/logs", (req, res) => {
  const idInput = req["params"]["_id"]
  User.findOne({_id: idInput}, (error, data) => {
    if(error){ console.log("ran into an error")}
    if(!error){
      const {limit, from, to} = req.query
      console.log(limit, from, to)

      resForGet["_id"] = data["_id"]
      resForGet["username"] = data["username"]
      resForGet["count"] = data["log"].length

//handle the limit, took a while to figure out 

    //I can do it better
    // if(from && to){
    //   //resForGet.log = data.
    // }else if(from && !to) {
    //   console.log("there's a form")
    //   //resForGet.log = data.elemMatch({"log":{$gte:from}})
    // }else if(to && !from) {
    //   console.log(new Date(to).toISOString())
    //   //resForGet.log = data.elemMatch({"log":{$gte:to}})
    //   console.log(
    //     new Date(to) <= new Date(data.log[0].date)
    //   )
    // }

      if(from && to){
        resForGet.log = data.log.filter(session => new Date(from) <= new Date(session.date) <= new Date(to))
      }if(from && !to) {
        console.log("from")
        resForGet.log = data.log.filter(session => new Date(from) <= new Date(session.date))
      }if(to && !from) {
        console.log("to")
        resForGet.log = data.log.filter(session => new Date(session.date) <= new Date(to))
        console.log(resForGet.log)
      }

      if(limit) {
        resForGet["log"] = data["log"].slice(0,limit)
      }
      if(!limit && !to && !from) {
        resForGet.log = data.log
      }
      res.json(resForGet)
    }
  })
})