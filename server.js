var express = require('express');
var app = express();

var mongo = require('mongodb').MongoClient;

var nofavicon = require('express-no-favicons');
var port = process.env.PORT || 8080;

var request = require('request');
var util = require('util');
var urlencode = require('urlencode'); 

var mongoUri = process.env.MONGO_URI;
var FLICKR_API_KEY = process.env.FLICKR_API_KEY;
var FLICKR_SECRET_KEY = process.env.FLICKR_SECRET_KEY;
var FLICKR_ENDPOINT = 'https://api.flickr.com/services/rest/';

function flickrUrl(photo) {
	return 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg';
}

function flickrThumbnailUrl(photo) {
	return 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_t.jpg';
}

app.use(nofavicon());

app.get('/api/imagesearch/:terms', function(req, res) {
	var searchTerms = req.params.terms;
	var offset = req.query.offset || 1;

	var getUrl = FLICKR_ENDPOINT + '?method=flickr.photos.search&api_key=' + FLICKR_API_KEY + '&text=' + searchTerms + "&page=" + offset + "&format=json&nojsoncallback=1";

	var apiCall = request(getUrl, function(err, response, body) {
		if (err) throw err;
		var photos = JSON.parse(body).photos.photo;
		console.log(photos);
		var resultArr = [];
		photos.forEach(function(item) {
			var photoObj = {
				url: flickrUrl(item),
				snippet: item.title,
				thumbnail: flickrThumbnailUrl(item)
			}
			resultArr.push(photoObj);
		});

		res.send(resultArr);

		// Save the latest query to the "recent" collection.
		mongo.connect(mongoUri, function(err, db) {
			var collection = db.collection('recent');
			var doc = {
				// TODO: Not totally sure the urlencode is doing what I want it to.
				term: urlencode.decode(searchTerms),
				when: new Date().toISOString()
			};
			collection.insert(doc);
			console.log(doc);
		})
	});
});

app.get('/api/latest/imagesearch', function(req, res) {
	mongo.connect(mongoUri, function(err, db) {
		console.log("it's connecting");
		var collection = db.collection('recent');
		var cursor = collection.find({}, { _id: 0 });
		cursor.sort({when: -1});
		var result = [];
		cursor.each(function(err, doc) {
			if (err) throw err;
			if (doc == null ) {
				res.send(result);
				db.close();
			}
			if (doc != null) {
				result.push(doc);
				console.log(result);
			}
		});
	})
})

app.listen(port, function() {
	console.log('Express app listening on port ' + port);
});