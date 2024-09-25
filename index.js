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
let url_list = [];

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
      if (error !== null) {
       res.json({'error':'invalid url'})
      } else {
        let obj = url_list.find(x => x.original_url === req.body.url)
        // if link does exist in list, show relevant JSON obj:
        if (obj) {
          console.log(`${obj.original_url}:${obj.short_url} found`)
          res.json(obj)
        // else add it to list and show JSON obj
        } else {
          url_list.push({'original_url':req.body.url,'short_url':url_list.length+1})
          console.log(`${req.body.url} added to list`)
          res.json(url_list[url_list.length-1])
        } 
      }
    });
  } else {
    res.json({'error': 'invalid url'})
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
