var express = require('express');
const https = require('https');
var CORS = require('cors');
const crypto = require('crypto');
const axios = require('axios');

var app = express();

// set port for local testing

// app.set('port', 5125);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(CORS());

// set port for heroku

var port = process.env.PORT || 8080
app.set('port', port);

// set global variables

var item_number = 0;
var img_url = '';
var query_str = '';

// create function to ping server every 30 mins to prevent Heroku app from sleeping (every 5 minutes is 300000 ms)

setInterval(function() {
  https.get("https://warm-garden-39926.herokuapp.com");
  https.get("https://mighty-taiga-60726.herokuapp.com");
  https.get("https://dry-mesa-65447.herokuapp.com");
  https.get("https://cryptic-dusk-31004.herokuapp.com");
  https.get("https://arcane-wildwood-69561.herokuapp.com");
}, 1800000);

app.get('/:str', (req, res) => {

  // set query string

  query_str = req.params.str;

  (async () => {
    try {
      const response = await axios.get("https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&titles=" + query_str + "&format=json&formatversion=2");
      item_number = response.data.query.pages[0].pageprops.wikibase_item;

    } catch (error) {
      console.log(error.response);
    }

    try {
      const response = await axios.get("https://www.wikidata.org/w/api.php?action=wbgetclaims&property=P18&entity=" + item_number + "&format=json");
      let image_name = response.data.claims.P18[0].mainsnak.datavalue.value;

      // replace spaces in image name with underscores

      let processed_image_name = "";

      for (let i=0; i <image_name.length; i++) {
        curr_letter = image_name[i];
        if (curr_letter == " "){
          curr_letter = "_";
        }
        processed_image_name += curr_letter;
      }

      // get md5 hash string from processed image name

      let hash_str = crypto.createHash('md5').update(processed_image_name).digest('hex');

      // create image url from hash string and image name

      // "a" is the first character of the hash string

      let a = hash_str.charAt(0);

      // "b" is the second character of the hast string

      let b = hash_str.charAt(1);

      // create image url in this format: https://upload.wikimedia.org/wikipedia/commons/a/ab/image_name

      img_url = "https://commons.wikimedia.org/w/thumb.php?width=400&f=" + processed_image_name;
    } catch (error) {
      console.log(error.response);
    }

    // send image url after getting it

    res.send(img_url);
  })();
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

