/* Author: Igor Laborie
*/
var SearchComponents = {
	fable: {
		doSearch : function(search) {
			search.from= 0;
			search.size= 50;
			
			var url = "/jug/FABLE/_search";
			var rest = new RestServiceJs(url);
			rest.post(search, function (json) {
				var html = ich.esInfo(json);
				$("#fbl-result-info").html(html);
				$("#fbl-result-text").empty();

				var hits = json.hits;
				html = ich.esFable(hits);
				$("#fbl-result-docs").html(html);
				
				$("#fbl-result-docs ol li a").click(function () {
					var text = $(this).attr("data-content");
					$("#fbl-result-text").html('<pre>' + text + '</pre>');
				});
			});
		},
		searchAll: function() {
			var search =  {
				query : {
					match_all : {}
				}
			};
			SearchComponents.fable.doSearch(search);
		},
		search: function(term) {
			var search =  {
				query : {
					text : {
						_all : term
					}
				}
			};
			SearchComponents.fable.doSearch(search);
		},
		searchFuzzy: function(term) {
			var search =  {
				query : {
					fuzzy : {
						_all : {
							value : term,
							min_similarity : 0.7
						}
					}
				}
			};
			SearchComponents.fable.doSearch(search);
		},
		searchPhonetic: function(term) {
			var search =  {
				query : {
					bool : {
						should : {
							field : { "title.soundex" : term }
						},
						must : {
							field : { "lines.soundex" : term }
						}
					}
				}
			};
			SearchComponents.fable.doSearch(search);
		}
	},
	toulouse: {
		doSearch: function(uri ,s) {
			var isEmballage = $("#tls-basic-emballage").is(':checked');
			var isVerre = $("#tls-basic-verre").is(':checked');
			var isMetro = $("#tls-basic-metro").is(':checked');
			var isTramway = $("#tls-basic-tramway").is(':checked');
			var isVelo = $("#tls-basic-velo").is(':checked');
			// Build Url
			var url = "/jug/";
			
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
				$("#tls-result-facet").empty();

				var html = ich.esInfo(json);
				$("#tls-result-info").html(html);

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
				$("#tls-result-docs").html(html);
			});
		},
		searchAll: function() {
			// Search
			var search =  {
				from: 0,
				size: 50
			};
			SearchComponents.es.doSearch("_search",search);
		},
		search: function(q) {
			// Search
			var search =  {
				from: 0,
				size: 50
			};
			search.q = q;
			SearchComponents.es.doSearch("_search",search);
		},
		searchFacet: function(q, filter) {
			// Search
			var search =  {
				from: 0,
				size: 50,
				facets : {
					commune : { terms : {field : "Commune" }}
			    }
			};
			if (q) {
				search.query = { query_string : {query : q} };
			} else {
				search.query = { match_all : {}};
			}
			// Search
			var url = "/jug/VERRE,EMBALLAGE,METRO,TRAMWAY,VELO/_search?";
			var rest = new RestServiceJs(url);
			rest.post(search, function (json) {
				var html = ich.esFacets(json.facets);
				$("#tls-result-facet").html(html);

				html = ich.esInfo(json);
				$("#tls-result-info").html(html);

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
				$("#tls-result-docs").html(html);
			});
			
		},
		searchGeo: function() {
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
		
		// Clean Search
		$("#tls-result-facet").empty();
		$("#tls-result-docs").empty();
		$("#fbl-result-info").empty();
		$("#fbl-result-text").empty();
	});
	// Click on active link
	$("#topBar li.active a").click();
	
	// Bind Toulouse search
	$("#tls-basic form button").click(function(event) {
		var q = $("#tls-basic-q").val();
		if (q) {
			SearchComponents.toulouse.search(q);
		} else {
			SearchComponents.toulouse.searchAll();
		}
		// Cancel event
		event.preventDefault();
		return false;
	});
	$("#tls-facet form button").click(function(event) {
		var q = $("#tls-facet-q").val();
		SearchComponents.toulouse.searchFacet(q);
		// Cancel event
		event.preventDefault();
		return false;
	});
	
	// Bind Fable search
	$("#fbl-search form button").click(function(event) {
		var q = $("#fbl-query").val();
		if (q) {
			if ($("#fbl-fuzzy").is(':checked')) {
				SearchComponents.fable.searchFuzzy(q);
			} else if ($("#fbl-phonetic").is(':checked')) {
				SearchComponents.fable.searchPhonetic(q);
			} else {
				SearchComponents.fable.search(q);
			}
		} else {
			SearchComponents.fable.searchAll();
		}
		// Cancel event
		event.preventDefault();
		return false;
	});
	
});



// REST
function RestServiceJs(newurl) {
	this.myurl = newurl;

	this.post = function(model, callback) {
		$.ajax({
			type : 'POST',
			url : this.myurl,
			data :  JSON.stringify(model),
			dataType: 'json',
			jsonp: 'callback',
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

