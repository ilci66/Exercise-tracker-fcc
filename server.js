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

const userSchema = new mongoose.Schema({
  username: String,
  duration: Number,
  description: String,
  date: Date
})

const User = mongoose.model('User', userSchema)

const responseObject = {};

app.post("/api/users", bodyParser.urlencoded({ extended: false }), (req, res) => {
  const nameInput = req.body.username
  //res.json(nameInput)
  User.findOne({username: nameInput})
    .exec((error, data) => {
      if(!error && data == undefined){
        User.findOneAndUpdate(
          {username: nameInput},
          {username: nameInput},
          {new:true, upsert:true},
          (error, newData) => {
            //res.json(newData.username)
            responseObject["username"] = newData["username"]
            responseObject["_id"] = newData["_id"]
            res.json(responseObject)
          })
        //res.json("null")
      }if(!error && data != undefined){
        res.json("Username already taken")
      }
    })
})
const testId = "609e403909e599313df7a31b"

app.post("/api/users/:userId/exercises", bodyParser.urlencoded({ extended: false }), (req, res) => {
  const idInput = req.params.userId
  //const id = req["body"]["_id"]
  const descInput = req["body"]["description"]
  const duraInput = req["body"]["duration"]
  const dateInput = req["body"]["date"]

  console.log(duraInput, descInput, idInput)
  User.findOne({_id: idInput}, (error, data) => {
    if(!error && data == undefined) {
      console.log("Unknown userId")
    }if(!error){
      User.findOneAndUpdate(
        {_id: idInput},
        {_id: idInput, description: descInput, duration: duraInput, date: dateInput},
        {new:true, upsert:true},
        (error, newData) => {
//trying to figure out how to include date 
          responseObject["_id"] = newData["_id"]
          responseObject["username"] = newData["username"]
          responseObject["description"] = newData["description"]
          responseObject["duration"] = newData["duration"]
          res.json(responseObject)
        })
    }
  })
})