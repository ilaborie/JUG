/* Author: Igor Laborie
*/
var SearchComponents = {
	solr: {
		searchAll: function() {
		},
		search: function() {
		},
		searchGeo: function() {
		},
		searchSpelling: function() {
		},
		searchFuzzy: function() {
		}
	},
	es: {
		doSearch: function(uri ,s) {
			var isEmballage = $("#es-basic-emballage").is(':checked');
			var isVerre = $("#es-basic-verre").is(':checked');
			var isMetro = $("#es-basic-metro").is(':checked');
			var isTramway = $("#es-basic-tramway").is(':checked');
			var isVelo = $("#es-basic-velo").is(':checked');
			// Build Url
			var url = "http://localhost:9200/jug/";
			
			var type = [];
			if (isVerre) {
				type.push("VERRE");
			}
			if (isEmballage) {
				type.push("EMBALLAGE");
			}
			if (isMetro) {
				type.push("METRO");
			}
			if (isTramway) {
				type.push("TRAMWAY");
			}
			if (isVelo) {
				type.push("VELO");
			}
			url += type.join(",");
			url += "/_search"
			url += "?";
			for (prop in s) {
				url += prop;
				url += "=";
				url += s[prop];
				url += "&";
			}
			// Search
			var rest = new RestServiceJs(url);
			rest.findAll(function (json) {
				$("#es-result-facet").empty();

				var html = ich.esInfo(json);
				$("#es-result-info").html(html);

				var hits = json.hits;
				// Create link
				var lon;
				var lat;
				for (var i=0; i<hits.hits.length; i++) {
					lon = hits.hits[i]['_source'].WGS84.X;
					lat = hits.hits[i]['_source'].WGS84.Y;
					hits.hits[i]._source.link =  getOsmLinks(lon, lat);
				}
				html = ich.esDoc(hits);
				$("#es-result-docs").html(html);
			});
		},
		searchAll: function() {
			// Search
			var search =  {
				form: 0,
				size: 50
			};
			SearchComponents.es.doSearch("_search",search);
		},
		search: function(q) {
			// Search
			var search =  {
				form: 0,
				size: 50
			};
			search.q = q;
			SearchComponents.es.doSearch("_search",search);
		},
		searchGeo: function() {
		},
		searchSpelling: function() {
		},
		searchFuzzy: function() {
		}
	}
};

$(function(){
	// Bind navigation
	$("#topBar a").click(function () {
		$("#topBar a").removeClass("active");
		$(this).addClass("active");

		$("#Contents .container").addClass("hidden");		
		var name = $(this).attr("href");
		$(name + "-search").removeClass("hidden");
	});
	// Click on active link
	$("#topBar li.active a").click();
	
	// Bind ElasticSearch
	$("#es-basic form").submit(function() {
		var q = $("#es-basic-q").val();
		if (q) {
			SearchComponents.es.search(q);
		} else {
			SearchComponents.es.searchAll();
		}
	});
	
	
});



// REST
function RestServiceJs(newurl) {
	this.myurl = newurl;

	this.post = function(model, callback) {
		$.ajax({
			type : 'POST',
			jsonp: 'callback',
			dataType: 'jsonp',
			url : this.myurl,
			data : JSON.stringify(model), // '{"name":"' + model.name + '"}',
			dataType : 'text',
			processData : false,
			contentType : 'application/json',
			success : callback,
			error : doOnRestError,
			timeout : 60000
		});
	};

	this.put = function(model, callback) {
		$.ajax({
			type : 'PUT',
			jsonp: 'callback',
			dataType: 'jsonp',
			url : this.myurl,
			data : JSON.stringify(model), // '{"name":"' + model.name + '"}',
			dataType : 'text',
			processData : false,
			contentType : 'application/json',
			success : callback,
			error : doOnRestError,
			timeout : 60000
		});
	};

	this.find = function(id, callback) {
		$.ajax({
			type : 'GET',
			jsonp: 'callback',
			dataType: 'jsonp',
			url : this.myurl + '/' + id,
			contentType : 'application/json',
			success : callback,
			error : doOnRestError,
			timeout : 60000
		});
	};

	this.findAll = function(callback) {
		$.ajax({
			type : 'GET',
			jsonp: 'callback',
			dataType: 'jsonp',
			url : this.myurl,
			contentType : 'application/json',
			success : callback,
			error : doOnRestError,
			timeout : 60000
		});
	};

	this.remove = function(id, callback) {
		$.ajax({
			type : 'DELETE',
			jsonp: 'callback',
			dataType: 'jsonp',
			url : this.myurl + '/' + id,
			contentType : 'application/json',
			success : callback,
			error : doOnRestError,
			timeout : 60000
		});
	};

	this.loadTmpl = function(turl, callback) {
		$.ajax({
			url : turl,
			jsonp: 'callback',
			dataType: 'jsonp',
			success : callback,
			error : doOnRestError,
			timeout : 60000
		});
	}
};

var getOsmLinks = function(lon,lat) {
	return "http://cartosm.eu/map?lon="+lon+"&lat="+lat+"&zoom=15&width=400&height=350&mark=true&nav=true&pan=true&zb=inout&style=default&icon=down"
};

var doOnRestError = function(req, status, ex) {
	var msg;
	if (status) {
		msg = status;
	} else {
		msg = "Error";
	}
	if (req && req.responseText) {
		msg += ": ";
		try {
			msg += JSON.parse(req.responseText).message;
		} catch (e) {
			msg += req.responseText;
		}
	}
	if (ex) {
		msg += "\n" + ex;
	}
	// error in Dialog
	var div = $(".modal.fade.in div.zone-notify");
	div.empty();

	var data = {};
	data.kind = "error";
	data.title = "Ooops !";
	data.message = msg;

	var html = ich.notify(data);
	div.append(html);

	// Animate
	div.fadeIn().delay(4000).fadeOut('slow');
	
};

