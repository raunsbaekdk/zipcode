var express = require('express');
var app = express();
app.disable('etag');
app.disable('x-powered-by');


// Cache
var NodeCache = require("node-cache");
var myCache = new NodeCache({stdTTL: 86400, checkperiod: 21600});


// Create zipcodes instance
var Zipcodes = require('./zipcodes.js');
var zipcodes = new Zipcodes(myCache);





app.get('/', function(req, res)
{
	res.set('Content-Type', 'application/json');

	var zipcode = parseInt(req.query.nr);

	zipcodes.lookup(zipcode, function(result)
	{
		res.send(result);
	});
});





app.listen((process.env.PORT || 60604), function ()
{
	zipcodes.cachePeople(function()
	{
		console.log('Caching people done ' + new Date());
	});

	zipcodes.cacheZipcodes(function()
	{
		console.log('Caching zipcodes done ' + new Date());
	});
});