require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
//
const dns = require('dns');
const bodyParser = require('body-parser');
const options = {
  all:true,
};

//
const query_regex = /^(https?:\/\/)/gmi

// Basic Configuration
const port = process.env.PORT || 3000;

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
app.route('/api/shorturl').post((req,res) => {
  // console.log(req.body.url)
  if (query_regex.test(req.body.url)) {
    let query = req.body.url.replace(query_regex, "")
    dns.lookup(query, (error,addresses) => {
      console.log(`${req.body.url} = ${query} = error: ${error}, address: ${addresses}`)
      if (error !== null) {
       res.json({'error':'invalid url'})
      } else {
        res.json({'no':'error'})
      }
    });
  } else {
    res.json({'error': 'invalid url'})
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
