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

const userSchema = new mongoose.Schema({
  username: {type: String, required:true},
  logs:[sessionSchema]
})

const User = mongoose.model("User", userSchema)
const Session = mongoose.model("Session", sessionSchema)

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
  const newSession = new Session({
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
  })
  res.json(newSession)
  //console.log(req.body.description)
})