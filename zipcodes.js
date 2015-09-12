var request = require('request');
var parse = require('csv-parse');

function Zipcodes(cache)
{
	this.cache = cache;
	this.options = {headers: {'User-Agent': 'ZIPCODES'}};
}



Zipcodes.prototype.cachePeople = function(callback)
{
	var that = this;

	request('http://api.statbank.dk/v1/data/FOLK1/CSV?valuePresentation=Code&OMR%C3%85DE=*', that.options, function(error, response, result)
	{
		if((response.statusCode == 200 ? true : false) === true)
		{
			parse(result, {delimiter: ';', skip_empty_lines: true}, function(err, output)
			{
				if(!err)
				{
					output.map(function(item, index)
					{
						if(index > 0)
							that.cache.set('p_' + parseInt(item[0]), parseInt(item[2]));
					});

					// E.T phone home when done caching
					callback();
				}
			});
		}
	});
}

Zipcodes.prototype.cacheZipcodes = function(callback)
{
	var that = this;

	request('http://dawa.aws.dk/postnumre', that.options, function(error, response, result)
	{
		if((response.statusCode == 200 ? true : false) === true)
		{
			var result = JSON.parse(result);

			result.map(function(item, index)
			{
				that.cache.set('z_' + parseInt(item.nr), item);
			});

			// E.T phone home when done caching
			callback();
		}
	});
}



Zipcodes.prototype.lookup = function(zipcode, callback)
{
	var that = this,
	zipcode = parseInt(zipcode);

	try
	{

		that.cache.get('z_' + zipcode, function(err, value)
		{
			value = value['z_' + zipcode];

			if(value.kommuner !== undefined && value.kommuner !== null)
			{
				value.kommuner.map(function(item)
				{
					that.cache.get('p_' + parseInt(item.kode), function(err, value)
					{
						item.people = value['p_' + parseInt(item.kode)];
					});
				})

				callback([value]);
			}
		});

	} catch (e) {

		callback
		({
			code: 400,
			msg: 'Invalid request'
		});

	}
}

module.exports = Zipcodes;