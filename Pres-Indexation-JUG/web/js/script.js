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
						_all : {
							query : term,
							analyzer : "francais"
						}
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
		lastFacetQuery : null,
		doSearch: function(search) {
			// Build Url
			var url = "/jug/";
			
			// 
			var type = [];
			if ($("#tls-basic-verre").is(':checked')) {
				type.push("VERRE");
			}
			if ($("#tls-basic-emballage").is(':checked')) {
				type.push("EMBALLAGE");
			}
			if ($("#tls-basic-metro").is(':checked')) {
				type.push("METRO");
			}
			if ($("#tls-basic-tramway").is(':checked')) {
				type.push("TRAMWAY");
			}
			if ($("#tls-basic-velo").is(':checked')) {
				type.push("VELO");
			}
			
			if (type.length>0) {
				url += type.join(",");	
			} else {
				url += "_all";
			}
			url += "/_search"
			
			// add default term
			search.from= 0;
			search.size= 50;

			// Search
			var rest = new RestServiceJs(url);
			rest.post(search, function (json) {
				var html;
				// Result
				html = ich.esInfo(json);
				$("#tls-result-info").html(html);

				// Facet
				if (json.facets) {
					// Hash
					var facets = json.facets;
					if (facets.commune) {
						var tmp;
						for (var i=0; i< facets.commune.terms.length;i++) {
					        tmp = facets.commune.terms[i];
					        tmp.hash = hashCode(tmp.term);
						}
					
						html = ich.esFacets(facets);
						$("#tls-result-facet").html(html);
						$("#tls-result-facet input[type=checkbox]").click(SearchComponents.toulouse.doFilterFacet);
					
						// Check filtered facet
						if (search.filter && search.filter.term && search.filter.term.commune) {
					        var communes = search.filter.term.commune;
					        for (var i=0; i<communes.length;i++) {
					        	$("#facet-"+hashCode(communes[i])).attr("checked","checked");
					        }
						} else {
					        $("#facet-ALL").attr("checked","checked");
						}
					} else if (facets.distance) {
						var range;
						for (var i=0; i<facets.distance.ranges.length;i++) {
							range = facets.distance.ranges[i];
							if (range.to && range.from) {
								range.label = "[ "+range.from+", " + range.to+" ]";
							} else if (range.to) {
								range.label = "[ 0 , " + range.to+" ]";
							} else if (range.from) {
								range.label = "[ "+range.from+", ∞ ]";
							}
						}
						html = ich.esGeoFacets(facets);
						$("#tls-result-facet").html(html);
						$("#tls-result-facet input[type=radio]").click(SearchComponents.toulouse.doFilterGeoFacet);
						
						// Check filtered Facet
						if (search.filter && search.filter.geo_distance_range) {
							var value = "" + search.filter.geo_distance_range.from +"," + search.filter.geo_distance_range.to;
							$("input[type=radio][name=tls-facet-distance-range]").each(function(idx, elt){
								if (value == $(elt).attr("value")) {
									$(elt).attr("checked","checked");	
								}
							});
						}
					}
				}

				// Hits
				var hits = json.hits;
				// Create link
				var lon;
				var lat;
				for (var i=0; i<hits.hits.length; i++) {
					lon = hits.hits[i]['_source'].wgs84.lat;
					lat = hits.hits[i]['_source'].wgs84.lon;
					hits.hits[i]._source.link =  getOsmLinks(lon, lat);
				}
				html = ich.esDoc(hits);
				$("#tls-result-docs").html(html);

				// Links
				$("#tls-result-docs ol li a").click(function (event) {
					var lnk = $(this).attr("href");
					$("#tls-result-carto iframe").attr("src",lnk);
					
					// Cancel event
					event.preventDefault();
					return false;
				});
			});
		},
		searchAll: function() {
			var search =  {
				query : {
					match_all : {}
				}
			};
			SearchComponents.toulouse.doSearch(search);
		},
		search: function(q) {
			var search =  {
				query : {
					query_string : { query : q }
				}
			};
			SearchComponents.toulouse.doSearch(search);
		},
		searchFacet: function(q) {
			// Search
			var search =  {
				from: 0,
				size: 50,
				facets : {
					commune : { 
						terms : {
							field : "commune",
							all_terms : true
						},
					}
			    }
			};
			if (q) {
				search.query = { query_string : {query : q} };
			} else {
				search.query = { match_all : {}};
			}
			// Store query
			SearchComponents.toulouse.lastFacetQuery = search;
			// Search
			SearchComponents.toulouse.doSearch(search);
		},
		doFilterFacet : function() {
			var search = SearchComponents.toulouse.lastFacetQuery;
			// Initialize filter
			search.filter = { 
				term : {
					commune : []
				}
			};
			// Check
			var current = $(this).attr("id");
			if (current == "facet-ALL") {
				if($("#facet-ALL").is(":checked")) {
					$("#tls-facet-commune input[type=checkbox]").removeAttr("checked");
					$("#facet-ALL").attr("checked","checked");
					search.filter = {match_all: {}};
				}
			} else {
				$("#facet-ALL").removeAttr("checked");
				$("#tls-facet-commune input[type=checkbox]").each( function() {
					var commune = $(this).val();
					if ($(this).is(":checked")) {
						search.filter.term.commune.push(commune);
					}
				});
			}
			// Store query
			SearchComponents.toulouse.lastFacetQuery = search;
			// Search
			SearchComponents.toulouse.doSearch(search);
		},
		searchGeo: function(q) {
			// Search
			var search =  {
				from: 0,
				size: 50,
				sort : [ {
					_geo_distance : {
						wgs84: {},
						order : "asc",
						unit : "km"
					}
				}],
				facets : {
					distance : {
						geo_distance :  {
							wgs84 : {},
							ranges : [ {
									from: 0,
									to: 0.25
								} , {
									from: 0.25,
									to: 0.5
								} , {
									from: 0.5,
									to: 1
								} , {
									from: 1,
									to : 2
								} , {
									from: 2,
									to : 5
								} , {
									from : 5,
									to : 10
								}
							]
						}
					}
			    }
			};
			
			// Geoloc
			var lon = 43.60908985;
			var lat = 1.44803784;
			search.sort[0]._geo_distance.wgs84.lon = lon;
			search.sort[0]._geo_distance.wgs84.lat = lat;
			search.facets.distance.geo_distance.wgs84.lon = lon;
			search.facets.distance.geo_distance.wgs84.lat = lat;
			
			// Query
			if (q) {
				search.query = { query_string : {query : q} };
			} else {
				search.query = { match_all : {}};
			}
			// Store query
			SearchComponents.toulouse.lastFacetQuery = search;
			// Search
			SearchComponents.toulouse.doSearch(search);
		},
		doFilterGeoFacet : function() {
			var search = SearchComponents.toulouse.lastFacetQuery;
			// Initialize filter
			search.filter = { 
				geo_distance_range : { }
			};
			// Set point
			search.filter.geo_distance_range.wgs84 = search.facets.distance.geo_distance.wgs84
			
			// Check
			var value = $("input[type=radio][name=tls-facet-distance-range]:checked").attr("value");
			var range = value.split(',');
			search.filter.geo_distance_range.from = parseFloat(range[0]);
			search.filter.geo_distance_range.to = parseFloat(range[1]);
			
			// Store query
			SearchComponents.toulouse.lastFacetQuery = search;
			// Search
			SearchComponents.toulouse.doSearch(search);
		}
	}
};

$(function(){
	// Bind navigation
	$("#topBar a").click(function () {
		$("#topBar a").parent().removeClass("active");
		$(this).parent().addClass("active");

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
	$("#tls-search form button").click(function(event) {
		var q = $("#tls-query").val();
		if ($("#tls-facet-commune").is(":checked")) {
			SearchComponents.toulouse.searchFacet(q);
		} else if ($("#tls-facet-distance").is(":checked")) {
				SearchComponents.toulouse.searchGeo(q);
		} else if (q) {
			SearchComponents.toulouse.search(q);
		} else {
			SearchComponents.toulouse.searchAll();
		}
		// Cancel event
		event.preventDefault();
		return false;
	});
		
	// Bind Fable search
	$("#fbl-search form button").click(function(event) {
		var q = $("#fbl-query").val();
		if (!q) {
			SearchComponents.fable.searchAll();
		} else if ($("#fbl-fuzzy").is(':checked')) {
			SearchComponents.fable.searchFuzzy(q);
		} else if ($("#fbl-phonetic").is(':checked')) {
			SearchComponents.fable.searchPhonetic(q);
		} else {
			SearchComponents.fable.search(q);
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


var hashCode = function(s){
    var hash = 0;
    if (s.length == 0) return hash;
    for (i = 0; i < s.length; i++) {
        char = s.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

var getOsmLinks = function(lon,lat) {
	return "http://cartosm.eu/map?lon="+lon+"&lat="+lat+"&zoom=15&width=400&height=450&mark=true&nav=true&pan=true&zb=inout&style=default&icon=down"
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

