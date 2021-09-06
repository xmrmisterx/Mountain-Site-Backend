var express = require('express');
const https = require('https');
var CORS = require('cors');
const crypto = require('crypto');
const axios = require('axios');

var app = express();
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
      // console.log("GET image response: " + response);
      let image_name = response.data.claims.P18[0].mainsnak.datavalue.value;
      // console.log("image name inside GET request:", image_name);

      // replace spaces in image name with underscores

      let processed_image_name = "";

      for (let i=0; i <image_name.length; i++) {
        curr_letter = image_name[i];
        if (curr_letter == " "){
          curr_letter = "_";
        }
        processed_image_name += curr_letter;
        // console.log("curr letter: " + curr_letter, " and processed image name so far: " + processed_image_name);
      }

      // get md5 hash string from processed image name

      let hash_str = crypto.createHash('md5').update(processed_image_name).digest('hex');
      // console.log("hash_str: " + hash_str);

      // create image url from hash string and image name

      // "a" is the first character of the hash string

      let a = hash_str.charAt(0);

      // "b" is the second character of the hast string

      let b = hash_str.charAt(1);

      // create image url in this format: https://upload.wikimedia.org/wikipedia/commons/a/ab/image_name

      img_url = "https://commons.wikimedia.org/w/thumb.php?width=400&f=" + processed_image_name;
      // let big_img_url = "https://upload.wikimedia.org/wikipedia/commons/" + a + "/" + a + b + "/" + processed_image_name;

      // console.log("img url inside getImageName function: " + img_url);
      // console.log("img url inside getImageName function: " + img_url + " and big pic url: " + big_img_url);

    } catch (error) {
      console.log(error.response);
    }

    // console.log("image url outside of its GET request:", img_url);

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

// lol, so we tried HTTP request and it didn't work, but we changed it to not parse the data, and now it works, so I guess that's good.
// Ok, we finally get the image url to send back in res. but is that where we want to send it?

// Yeah, that looks to be ok. Now what, we have our microservice up, apparently. Now we need to get our code to call it. We're gonna have
// to go to sleep but yeah, tomorrow, we need to finish this up.

// We need to call... Ok, so we realized we don't need that router thing anyway. Anyways, this seems to be working. Now, we need to call
// our microservice from the mountain pages, then we need to set up our forever on our node (maybe not though, just locally for now since
// the TAs won't visit). We definitely need to 
// a) move our website stuff into the public html folder (get the permissions, chd 4555 or something?) (move the csv table image via github
// as well?)
// b) do status update #4
// c) make video
// d) commit code to github and get screenshot
// e) create a release and get screenshot

// Ok, so we got the CORS error again, and tinkered for an hr 15 mins before fixing it. First, we required cors, then we had to app.use
// cors. It still wasn't working, so on a whim, we looked at the file in the public html, and it didn't use the proxy, so we removed it,
// and it finally worked that way jesus. Our image url was in the responsetext of req. 

// Ok, now we need to make sure all the pages work, then move it to the public html folder and test there. Alright, so, to turn on 
// forever, we needed to download the node module, which we forgot how to do, so we just put our index file into the database folder
// that had the workout log assignment. Then, to start forever, we typed "./node_modules/forever/bin/forever start index.js 5125",
// where "index.js" is the file name and "5125" is the port number. We can also access the forever list with:
// ""./node_modules/forever/bin/forever list".

// Ok, so it seems everything is working now. We need to move our pic to the download page, so let's do that. Ok, so we've moved 
// everything into the public html folder, gave it access, turned on our forever server. Now, we just need to:

// c) make video
// d) commit code to github and get screenshot
// e) create a release and get screenshot

// Interesting, so we update this index.js code in this database file, then try to open up our website, and the mountains aren't loading.
// We check our forever list, and it looks like it's still running. I guess we'll stop it and rerun it since it probably can't save when
// in the forever process? Ok, so that did work. We were able to stop our only forever process with "./node_modules/forever/bin/forever
// stopall" then restart it with "./node_modules/forever/bin/forever start index.js 5125", and our code works now. We want to remove the
// console.log actually, since that was only for testing purposes, and it's actually not even coming up since we ran the forever on it.

// Ok, so we get "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Wonder_Lake_and_Denali.jpg/300px-Wonder_Lake_and_Denali.jpg"
// when we use the API for Denali, now let's see what we get for Kilimanjaro. Ok, so we get this:
// "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Tanzania_relief_location_map.svg/300px-Tanzania_relief_location_map.svg.png"

// Ok, so we're Googling, and another page says we can use a different method to get the correct image. First, we get the image name:
// "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&sites=enwiki&props=claims&titles=[query string]". Ok, so for the
// test call for "Jimi Hendrix" we get a huge file with a bunch of dictionaries. He says we need to find "claims" somewhere in the object
// and the image name file:

// {
//   ...
//   "claims":{
//       ...
//       "P18":[{
//           "mainsnak":{
//               "datavalue":{
//                   "value":"Jimi Hendrix 1967.png",
//               },
//           },
//       }],
//       ...
//   }
// }

// Ok, so we think we figured it out, and the process is actually pretty complicated lol. We'll need to find the image name inside our
// query string object that is returned from the wikidata api (so we need to figure out this super convoluted dict structure). Once we
// have the image name, we can put that name into the MD5 hash thing that we bookmarked, which will gave us the MD5 hash of the name
// string. After we get that hash string, the source for the image can be calculated in this format:
// "https://upload.wikimedia.org/wikipedia/commons/a/ab/img_name.ext", where "a" is the first character in the hash string, "b" is the
// second character in the hash string, and "img_name.ext" is the image name. Let's try this for Kilimanjaro and Denali? We aren't sure
// about the dictionary structure, but if we "Ctrl + F" for "P18" it's very close to that spot. Ok, so for Denali, we get this name...
// "Wonder Lake and Denali.jpg". It says the spaces have to be replaced by underscores, so let's do that (we'll need to program that
// as well), so now it's "Wonder_Lake_and_Denali.jpg". Ok, so hashing it gives "91342de580fc4bfbd7290d777ce9debb", which means its
// address is "https://upload.wikimedia.org/wikipedia/commons/9/91/Wonder_Lake_and_Denali.jpg". Alright, that worked, now let's try
// Mount Kilimanjaro. The image name is get is "Mt. Kilimanjaro 12.2006.JPG", which with underscores is "Mt._Kilimanjaro_12.2006.JPG", 
// then that MD5 hash is "6b2357ea2168e4664374c074735881d4" which means its url is:
// "https://upload.wikimedia.org/wikipedia/commons/6/6b/Mt._Kilimanjaro_12.2006.JPG"

// *** Wow, that did work. So now we just have to code our API to do this. I think the main thing is, extracting the image name from the
// giant dictionary object, then writing the program to convert that into underscores version, somehow get its MD5 hash (maybe an API?),
// and finally concatenating the image url from all the pieces.

// *** Actually, the initial dictionary is way too complicated to use. We can actually do the first api call to get the initial giant
// dictionary (e.g. https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&sites=enwiki&props=claims&titles=Jimi_Hendrix),
// then get the Wiki item number by calling "JSON.entities" (we want the value associated with the "entities" key). Then, with the
// Wiki item number, we can use "https://www.wikidata.org/w/api.php?action=wbgetclaims&property=P18&entity=[item number]&format=json"
// to get the JSON, and the image name should be found by calling "JSON.claims.P18[0].mainsnak.datavalue.value".

// Wow, we spent an hour, but can't get the item number. We googled and found some other way, doing this:
// https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&titles=[query string]&format=json
// so let's try that and see how we would extract.

// Oh god, after googling for another hour, I think we got it? We want to use this api call:
// "https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&titles=[query string]&format=json" but use the json format 2 vers:
// "https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&titles=Denali&format=json&formatversion=2"
// which gives us this JSON file:
// {"batchcomplete":true,"query":{"pages":[{"pageid":207247,"ns":0,"title":"Denali","pageprops":{"defaultsort":"Denali",
// "page_image_free":"Wonder_Lake_and_Denali.jpg","wikibase-shortdesc":"Highest mountain in North America","wikibase_item":"Q130018"}}]}}
// , which means we should be able to access the info by doing "JSON.query.pages.pageprops.wikibase_item". Ugh, it actually turned out to
// be "JSON.query.pages[0].pageprops.wikibase_item", but we finally got the item number. 

// Now, let's try to finish the rest of this. We can use "https://www.wikidata.org/w/api.php?action=wbgetclaims&property=P18&entity=
// [item number]&format=json" to get the JSON, and the image name should be found by calling "JSON.claims.P18[0].mainsnak.datavalue.
// value". Ugh, so our function is undefined bc we need an async function. Let's look at our old database code and see what that looks
// like? Holy shit, this is a huge headache. We aren't able to pass any of this data around bc of these annoying async functions. I 
// guess we can put it inside one huge function, but that's callback hell lol.

// Ok, we read some more and it says to try this:

// Let your function accept a callback. In the example code foo can be made to accept a callback. We'll be telling our code how to 
// react when foo completes.

// So:

// var result = foo();
// // Code that depends on `result` goes here
// Becomes:

// foo(function(result) {
//     // Code that depends on `result`
// });

// Let's work on this a bit, but if this doesn't work, we'll just go with what we have. This has been a huge headache omg.

// Ok, so we're thinking. Can we make this work without the async awaits? Maybe if we did it all in the use route, we don't need to use
// async await? How did we set the image to a URL and have the variable save in the previous working version? Ok, so if we use the 
// variables inside of the get item number function, we can access them, so we can keep accessing stuff until we get to where we want to
// get, which is the source URL, then I guess we can just set the src property to that URL and not worrying about returning it? Actually,
// once we have the URL, we want to "res.send(img_url);", which sends it back to the client requesting.

// So, if we put all of this inside the use route function, then we don't have to deal with it all? Ok, so let's implement a MD5 hash on
// the image name now, then create the image url from the hash.

// Interesting, so we're googling around for MD5 hash functions, and one post says it's built into node.js like this:

// const crypto = require('crypto')
// crypto.createHash('md5').update('hello world').digest('hex')

// Ok, so surprisingly we actually got a hash string. We thought we'd need to download crypto or something, but it just works, which is
// great. However, we get this str "15fa2c985b48bfaffa6c8b033825c247", which is wrong, and we realize we need to format the string to
// have "_" in place of the spaces, so let's create a function for that, or just do it there? we probably have to just do it there lol.
// Lol, we kept getting the same wrong hash output bc the name didn't have the underscores, and it turns out that spaces are not "" but
// " ", we actually was checking for the wrong thing and didn't replace the spaces with underscores, but once we fixed that, it did work.

// Alright, so we have our hex str now, so we want to create the image url from the hash string, by setting it to this url:
// "https://upload.wikimedia.org/wikipedia/commons/a/ab/img_name.ext", where "a" is the first character in the hash string, "b" is the
// second character in the hash string, and "img_name.ext" is the image name

// Ok, so we're able to extract the name and all but.. we're getting this error "TypeError: Cannot read property 'wikibase_item' of 
// undefined". We've already read the parsed JSON to get the wikibase item, but now it's saing the parson JSON is undefined, so I think
// this has to do with async functions, again, ugh. Ok, so how are we going to fix this? Can we put our requests outside of the call?
// Instead of chaining the calls, can be do it once each is complete?

// Hmmm, so we go back to that async thread, and it talks about having a variable save the response in the ajax call:

// "Another approach to return a value from an asynchronous function, is to pass in an object that will store the result from the 
// asynchronous function.

// Here is an example of the same:

// var async = require("async");

// // This wires up result back to the caller
// var result = {};
// var asyncTasks = [];
// asyncTasks.push(function(_callback){
//     // some asynchronous operation
//     $.ajax({
//         url: '...',
//         success: function(response) {
//             result.response = response;
//             _callback();
//         }
//     });
// });

// async.parallel(asyncTasks, function(){
//     // result is available after performing asynchronous operation
//     console.log(result)
//     console.log('Done');
// });

// I am using the result object to store the value during the asynchronous operation. This allows the result be available even after the 
// asynchronous job."

// Wait a minute, having the variable outside is not useful, bc we need to call res.send, which is inside the async function. Wait, so the
// problem is outside of the ajax, so why don't we find the item number inside the other ajax? Lol, we can't because we need that item
// number for the ajax call lol. Ok, so we are using the item number variable, which is just a property of the parsed JSON, so let's
// just call parsed json directly? What will happen then? We get the same error. The problem is that... bc it's async... the code is
// running before getting the values, which which why it can't reference the values, but then it is able to do it in the time the error
// comes out i think. So, in async, the further parts of the code are run, and when we are setting variables, it obviously won't have
// anything but undefined bc it's not done getting the request yet. What if we change the calls to sync?

// Lol, so we read some more, and find this way to morph a function. This one seems like it could work, because it has parameters for
// the function. So here is the original code:

// function sync_call(input) {
//   var value;

//   // Assume the async call always succeed
//   async_call(input, function(result) {value = result;} );

//   return value;
// }

// and here is the async workaround:

// function f(input, callback) {
//   var value;

//   // Assume the async call always succeed
//   async_call(input, function(result) { callback(result) };

// }

// Can we get our code from the first way to the second way? Alright, so we need to test our current code for the 7 PM meeting, seeing
// as we can't implement this just yet.

// Ok, so we were thinking, back to the setting the global variables to the properties that we want, why don't we do that for each
// ajax request and see if that works. Lol, that definitely doesn't work. We can't set the global variables inside these async calls
// apparently.

// Ok, so let's go back to our old database and make sure it's working for the meeting..

// We can try using axios to do HTTP requests? That's what Alice was using and it could resolve some of our issues maybe? Lol.

// Ok, so the axios request is working fine and well, but it doesn't work outside of it, so I guess we need the async version right,
// which is this.

// async function makeGetRequest() {

//   let res = await axios.get('http://webcode.me');

//   let data = res.data;
//   console.log(data);
// }

// makeGetRequest();

// So, let's try to incorporate this. Hmm.. that didn't work very well, still the same problem I think. Let's try it with this response
// part of the code.

// axios.get('/user?ID=12345')
//   .then(function (response) {
//     // handle success
//     console.log(response);
//   })
//   .catch(function (error) {
//     // handle error
//     console.log(error);
//   })
//   .then(function () {
//     // always executed
//   });

// So this is another way to do those requests but... it doesn't solve our Ajax problems lol. Why is this is hard lmao. We're following
// this Mozilla guide, and we're putting the async awaits inside the get request, but it doesn't seem to be working. Hmmm. we read 
// something while Googling about the 'require https' we are using that says it can't do async awaits? Is that why we can't get things
// to work, but it says we can do it in other things, including axios? Here is the axios async format:

// (async () => {
//   try {
//     const response = await axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
//     console.log(response.data.url);
//     console.log(response.data.explanation);
//   } catch (error) {
//     console.log(error.response.body);
//   }
// })();

// Ok, it seems we are getting somewhere with axios, its async awaits format, and having a global parameter to take the item number and
// image url, as outside the get request, we are able to see the updated item numbers and image URLs after setting them inside the axios
// request. Ok, now, let's call the second GET request and set the image url and see if it sticks outside, then simply return the image
// url in res.send? or is it different? how do we send a response in axios lol?

// *** After we finally get this new scraping method down, let's try to host our server code somewhere besides flip, since it requieres
// logging into the Cisco AnyConnect. Then, we'll want to update our website with top nav bar for the second mountains and link their
// hmtl pages, update the active nav status to each new mountain, and finally implement the GET request to Alice's service when the
// download button is clicked.

// Hmmm... looking at the code, this isn't exactly outside of the call, but outside of just the async part of the code? Let's see what
// happens when we call the other get request. I mean, it is outside the GET request, which I think is what we want.

// Yes! That finally worked. However, we are noticing our pics are giant, so we need to resize it. How do we do that? Well, in the thread
// for the image, it says we can visit a different website to get resized pics, the url being:

// https://commons.wikimedia.org/w/thumb.php?width=500&f=Junior-Jaguar-Belize-Zoo.jpg

// With the last part being the name of the image, so that's interesting. It means we don't need the hash, or maybe this doesn't work
// all the time. Let's try it with the Denali and Mt Kilimanjaro image names that we have. So, the format is:

// https://commons.wikimedia.org/w/thumb.php?width=300&f=[image name]

// and we want to change it to 300 pixels, so let's try it. Denali would be:
// https://commons.wikimedia.org/w/thumb.php?width=300&f=Wonder_Lake_and_Denali.jpg
// and Mt Kilimanjaro would be: https://commons.wikimedia.org/w/thumb.php?width=300&f=Mt._Kilimanjaro_12.2006.JPG

// Good, both of those worked, now let's put that into our code and see if we can get all the mountains as a start. Well, that's very
// interesting, we don't even need to calculate all that other stuff, as long as we have the image name, it works. However, vinson 
// massif is showing the space view and not the main picture, lmao, wtf.

// *** Interesting, so we update this index.js code in this database file, then try to open up our website, and the mountains aren't loading.
// We check our forever list, and it looks like it's still running. I guess we'll stop it and rerun it since it probably can't save when
// in the forever process? Ok, so that did work. We were able to stop our only forever process with "./node_modules/forever/bin/forever
// stopall" then restart it with "./node_modules/forever/bin/forever start index.js 5125", and our code works now. We want to remove the
// console.log actually, since that was only for testing purposes, and it's actually not even coming up since we ran the forever on it.
// Note we want to install forever if not installed like this "npm install forever".

// ok, so now we're trying to use Alice's csv file thing. With 1 mountain and continent it worked, like this:
// 'http://flip1.engr.oregonstate.edu:8523/csvmaker?j=[{"continent":"North America","mountain":"Denali"}]' , however, when we try to do
// 'http://flip1.engr.oregonstate.edu:8523/csvmaker?j=[{%22continent%22:%22North%20America%22,%22mountain%22:%22Denali%22,%22continent%22:%22Africa%22,%22mountain%22:%22Kilimanjaro%22}]'
// with those "%22" being quotation marks, we get this error. Actually, the reason we are getting an error is because after we type into
// the search bar, it converts the quotation marks into some weird quotation marks (they look like more flambouyant quotation marks), 
// but it does still work. In that one, there is only 1 continent and 1 mountain, Africa and Kilimanjaro. We can do 2 things here. First,
// we create separate objects for each mountain continent pair (each pair surrounded by curly brackets), or we can try a dictionary of
// of continents and a dictionary of mountains? Honestly not sure about this method now that I type it out, but let's try the first way
// first. Ok, so here is the version with each key value pair its own object:
// http://flip1.engr.oregonstate.edu:8523/csvmaker?j=[{%22continent%22:%22NorthAmerica%22,%22mountain%22:%22Denali%22}{%22continent%22:%22Africa%22,%22mountain%22:%22Kilimanjaro%22}]
// Initially that gave us an error, so looking back at her example, we see that there is a comma between each object. When we add the comma...
// http://flip1.engr.oregonstate.edu:8523/csvmaker?j=[{%22continent%22:%22NorthAmerica%22,%22mountain%22:%22Denali%22},{%22continent%22:%22Africa%22,%22mountain%22:%22Kilimanjaro%22}]

// We get the continent and mountains as headers, which is great. Ok, so it looks kinda bad, so let's reformat it so that continent and
// and mountains are caps locked so those categories look more like table headers. Ok, so let's go into our download page and create this
// object, then we'll make a download button that onclick calls the GET request. Hmmm we could also get the page to call the request on
// load, but no, I don't think so. That's not the functionality that we want, especially when we said in the HW 4 document how we ask the
// user twice before downloading.

// Ok, so we made our object, and it downloads fine, although there is a weird character on the "-" between Argentina-Chile. However, it's
// not downloading from the GET request we have at the start, so we need to create a download button with an onclick that triggers that.

// Alright, so here's the way to add an event listener to an document object: "document.getElementById("myBtn").addEventListener("click",
// displayDate);". So, we want to create a function that will call the request, then put it there. But first, we need a download button.
// So here's one way to make a button with a form:

{/* <form method="get" action="file.doc">
   <button type="submit">Download!</button>
</form> */}

// let's try this and see what happens. Hmm.. that didn't work. We found a way to do it by creating the form button and using javascript
// to control the button. Actually, so here's an easier to create a button apparently: "<button>Click Me!</button>". Yeah, that worked.
// I don't know why W3Schools example is so complicated. We just use the button html tag and put the text inside, so easy. Next, and this
// is from the Mozilla example, we want to locate the button, create a function, and attach the function to the button click.

// const btn = document.querySelector('button');

// function sendData( data ) {
//   // function code
// }

// btn.addEventListener( 'click', function() {
//   sendData( {test:'ok'} );
// } )

// I think we did it correctly but... nothing is being downloaded. So, we see that in the response.text we are getting the info back,but
// how do we trigger a download. Ok, so we're Googling and found some way to make the response downloadable, like this...

// //         // Trick for making downloadable link

// a = document.createElement('a');
// a.href = window.URL.createObjectURL(xhttp.response);
// // Give filename you wish to download
// a.download = "test-file.xls";
// a.style.display = 'none';
// document.body.appendChild(a);
// a.click();

// Hmm.. that didn't work though. Let's try the other way that seems to do the same thing.

// var anchor = angular.element('<a/>');
// anchor.attr({
//     href: 'data:attachment/csv;charset=utf-8,' + encodeURI(data),
//     target: '_blank',
//     download: 'filename.csv'
// })[0].click();

// Wow, that finally worked. We had to use methods from both ways, but yeah, that worked.

// Now we're trying to align the title. We keep changing it and it's not changing anything, then we realized we were targeting the
// title above the page, not the title we want. The title we want is in H1 ugh. Ok, we finally adjust it the way we like it.

// Now, it looks like to set the background image we want to do "document.body.style.backgroundImage = "url('img_tree.png')";". So, let's
// get a image and try to set it, like the big Kilimanjaro image I guess.

// Hmmm.. this CSS3 trick works, but now our hyperlinks are hard to see. And in CSS, we can't make the images random? Ok, so we solved
// it by making all text white. Alright, now we need 2 different CSS files. One for the other pages, and one for the home page, since
// we don't want the other pages to have backgrounds of mountains.

//*** One thing to note about committing to git. "git add --all" in the main folder will add all the files, "git commit -m '[message]'"
// will commit the files, and "git push -u origin main" pushes it to the main branch.

//*** For CSS, to select an element simply "[ele name] {[set properties]}", to select children of element do "[ele name] > [child ele]"
// to select from id, do "#[id] {}", and to select class do ".[class name] {}"

//*** To call forever, do "./node_modules/forever/bin/forever [command]", with the commands we're using being "stopall" to stop forever
// , "start index.js 5125" to start file name and port, and "list" to get the list of forever processes ; "Ctrl L" to clear terminal

// Figure out why we are getting "undefined" and that "favicom" for the return value and query str. What happens if we set the "query"
// string variable outside the get route, does that change anything? Google axios and check the ".then" format and see if that changes
// anything in our code. Put the server code on heroku so that people can visit it and not have to log into cisco anyconnect. also,
// what if we return out of the function after sending the img url, does that change anything?

// So when we do it from the browser, we are getting these weird favicon.ico query strings, and also this undefined thing as well. it
// seems like the function is running twice, not sure why it sends console.logs the query string twice. ok, so what happens if we change
// the query str to an outer variable, does that change anything? Actually, we didn't do a let on it, so let's put a let before the
// variable and see if anything happens. That didn't do anything. What about defining it as a const? Interesting, defining it as let,
// const, or even setting the variable outside, doesn't change this weird favicon query str we get when we do it the get request from
// the browser.

// Let's google this? Hmmm apparently it's some weird request that gets send by the browser automatically, to find an image for the
// website? or some pic? it's not bc of somehow us coding it badly lol? Yeah, the calls from the web pages themselves don't do this.

// Let's get this server code on heroku next. We're reading mroe about this favicon.ico thing, and I think it's the little small image
// that is to the left of the top of the page. Could be something to talk about in interviews. We never knew this was even a thing, but
// yeah, it keeps showing up, bc the website is automatically querying it from the flip page. I guess we don't see if bc, either the
// webr.oregonstate.edu page has an image, or that page doesn't request one, but it's funny, we thought there was something wrong with
// the code.

// *** We can log into heroku with "heroku login -i", username is our email and pw is school password.

// Ok, so we didn't follow the beginning of the tutorial. We needed to write a "Procfile", which looks like it just gives the command to
// run what file, and put a start key value pair in our package json. There was also a mention of routing the index.html file for the
// home page, but let's see what happens when we try to call "heroku local web" now. Lol, that actually worked, so that was great.
// However, it says there's not route for the first page, which obv there isn't. Hmmmm.. we just want this to be the server, so we don't
// want a route? No, we do, actually let teh code run, and test it with the get requests. Ok, good, it looks like the server is up. Looks
// like we set it up fine. Now, let's go to the engr website and see if it works. It didnt' work. Now that we think about it. It's obvious
// why? It's on local host first of all, so we need an actual site, then we need to change our code to call from that site.

// Let's first get this from localhost to an actual website. Ok, so we follow the steps, but there were a few problems (not suprised lol
// ). first off, the instructions say to do "git push [app name] master" but we had to use "git push [app name] main" for it to actually
// work. However, it says package.json on in our main file, so we move it from the microservices folder to the public html folder. First
// time we recommit, it says the same thing, andwe realized we didn't save the file. Second time it still doesn't work, and we realized
// we needed to add and commmit it. Third time it doesn't work (same package.json error), we had to google it and see that, no, it's
// still not being recognized. We had to specifically 'git add ../package.json' and not "git add ." to add all, bc it by default doesn't
// add it, but then we also have to commit it, which we forgot to do lol, so we finally commit it then run "git push [appname] main", and
// it finally said it deployed successfully. Now, let's see if it works now.

// Lol, now we are getting a "application error". To get error logs for the app "heroku logs --tail --app [app name]"

// Ok, so currently we were able to push it to the local host, but when we try to set up our server code with heroku, then try to call
// get request from browser, we get "Error: The requested API endpoint was not found. Are you using the right HTTP verb (i.e. `GET` vs.
// `POST`), and did you specify your intended version with the `Accept` header?" and when we try to call the api from the kilimanjaro
// .html page we get "Resource requests whose URLs contained both removed whitespace (`\n`, `\r`, `\t`) characters and less-than 
// characters (`<`) are blocked. Please remove newlines and encode less-than characters from places like element attribute values in 
// order to load these resources. See https://www.chromestatus.com/feature/5735596811091968 for more details."

// Ok, so after a week off, we feel a little more refreshed and motivated. The day after having these issues, we had some ideas. One
// mainly is to see what files are in this "app". I mean, before, on the local host, it was working, and I think there were only like 4
// files, so maybe that's the issue? We just want the dbcons.js, package.json, procfile, and our index.js for the server code right? 
// Let's google and see how we can see the files in our app. Ok, so first we have to log in, so "heroku login -i" and put in our email
// and password, then we do "heroku run bash -a [APPNAME]" where appname is the name of our heroku app, then we can just "ls" to see its
// files. Hmmm... I guess we can delete this, but maybe we want this app as the main website instead? Let's move the code to our database
// folder and make a new app?

// Ok, so we're planning to create a heroku app just with the database code... How do we create a new git and new heroku app again? Hmm
// we are getting stuck. The running the node code from flip1 is working, but "heroku local web" is not for some reason. We're now unsure
// if we want to separate these files. It seems like we can set an "app.use" to render the home page, then have that page handle GET
// requests and be the public html too? Let's put a app.use to refer to our index.html and see what happens? I mean, the issue is, right
// now, that our GET requests are not working. So we need to get GET requests working on a non flip URL so that we don't need to connect
// to the flip VPN.

// ***Hmm after printing the error log, it seems like it can't find index.js, so we moved the file to public html. Now how do  we update
// the app. In order to update our app, we used the command line "git push https://git.heroku.com/salty-plains-18308.git main", but we
// are still getting the rejection ugh. Interesting, so I think we added the index.js file, but now we are getting this error
// "Error R10 (Boot timeout) -> Web process failed to bind to $PORT within 60 seconds of launch". Ugh, we still get an application error.
// Should we be trying locally first? Using the "local.env.PORT || port" code, we are getting a port in use error wtf. Wow, so we can't
// run this code when doing "heroku local web", but it actually works when we deploy it, wtf? I just did it on a whim, but it works,
// so random. You'd think it wouldn't work bc it said port 5000 in use or something when trying to do the local host version, but when
// pushed, it does work, jesus christ (this means we can't really test the working version in local host).

// Ok, now let's finally test our page at the engr website and see if it gets the mt kilimanjaro image. It was taking forever, so we 
// thought it didn't work, but it did, yes! Finally. Now, we want to update all the pages to send an HTTP request to the heroku app and
// not flip 1.

// Alright, so we fixed all the mountain pages to call from the heroku server, and they all work. Then we had to change the download page,
// since we are no longer using Alice's csv downloader. It seems like everything works now, which is good.

