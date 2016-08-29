var express = require('express');
var app = express();

var mongo = require('mongodb').MongoClient();

var nofavicon = require('express-no-favicons');
var port = process.env.PORT || 8080;

var request = require('request');
var util = require('util');

var FLICKR_API_KEY = process.env.FLICKR_API_KEY;
var FLICKR_SECRET_KEY = process.env.FLICKR_SECRET_KEY;
var FLICKR_ENDPOINT = 'https://api.flickr.com/services/rest/';

function flickrUrl(farmId, serverId, id, secret) {
	return 'https://farm' + farmId + '.staticflickr.com/' + serverId + '/' + id + '_' + secret + '.jpg';
}

app.use(nofavicon());

app.get('/api/imagesearch/:terms', function(req, res) {
	var searchTerms = req.params.terms;
	var offset = req.query.offset;

	var getUrl = FLICKR_ENDPOINT + '?method=flickr.photos.search&api_key=' + FLICKR_API_KEY + '&text=' + searchTerms + "&format=json" + "&nojsoncallback=1";

	var apiCall = request(getUrl, function(err, res, body) {
		if (err) throw err;
		var photos = JSON.parse(body);
		var deepPhotos = util.inspect(photos, {showHidden: false, depth: null});
		// ... for each photo in deepPhotos, get a bunch of its properties and assemble a response json.
		// flickrUrl() is good for getting the urls.
		console.log(deepPhotos);
	});
});

app.listen(port, function() {
	console.log('Express app listening on port ' + port);
});