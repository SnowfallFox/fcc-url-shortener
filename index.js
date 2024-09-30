require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
//
const mongoose = require('mongoose');
const dns = require('dns');
const bodyParser = require('body-parser');
const { doesNotMatch } = require('assert');
const options = {
  all:true,
};
let url_list = [];

// regex pattern credit goes to user 'skaparate' on freeCodeCamp forums: https://forum.freecodecamp.org/t/url-shortener-microservice-submission-failing/491503
const query_regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gmi;

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

let URL = mongoose.model("URL", urlSchema);

let dbCount = 0;
let query = URL.find(); 
query.countDocuments(function (err, count) { 
    if (err) {
      console.log(err)
    } else {
      // console.log("Count is", count)
      dbCount = count;
    }
}); 

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

//
app.use(bodyParser.urlencoded({extended:false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//
// GET requests may not work correctly in some browsers due to security
app.get('/api/shorturl/:q', (req,res) => {
  URL.find({short_url:req.params.q}, (err,data) => {
    if (err) {
      console.log({'error':'invalid url'})
    } else {
      // console.log(data)
      res.redirect(data[0].original_url)
    }
  })
})

//
app.post('/api/shorturl', (req,res) => {
  // console.log(req.body.url)
  if (query_regex.test(req.body.url)) {
    // console.log('test passed')
    let query = req.body.url.replace(query_regex, "")
    if (query.slice(-1) == '/') {
      query = query.slice(0,-1)
    }
    dns.lookup(query, (error,addresses) => {
      if (error) {
        res.json({'error':'invalid url'})
      } else {
        // check db for link
        URL.find({original_url:req.body.url}, (err,data) => {
          if (err) {
            console.log(err)
          } else {
            console.log(data)
            // if submitted already, res.json with relevant link and short url
            if (data.length > 0) {
              res.json({'original_url':data[0].original_url, 'short_url':data[0].short_url})
            // if not submitted, submit link and short_url (dbCount+1) to db and log action to console
            } else {
              // res.json({'error':'no data'})
              let newURL = new URL({original_url:req.body.url,short_url:dbCount+1})
              newURL.save((err,data) => {
                if (err) return console.log(err);
              })
              console.log(`-- added {original_url:${req.body.url},short_url:${dbCount+1}} to db --`)
              // increment dbCount and log addition to console({orig:link, short:Number})
              dbCount = dbCount+1
              console.log(`-- dbCount now equals ${dbCount} --`)
              // res.json with searched link and short_url
              res.json({'original_url':req.body.url,'short_url':dbCount})
            }
          }
        })
      }
    });
  } else {
    res.json({'error': 'invalid url'})
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
