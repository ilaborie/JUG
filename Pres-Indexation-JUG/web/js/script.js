/* Author: Igor Laborie
*/
var SearchComponents = {
	fable: {
		scrollId : null,
		showFable : function () {
			var text = $(this).attr("data-content");
			$("#fbl-result-text").html($('<pre>').text(text));
		},
		doSearch : function(search) {
			search.from= 0;
			search.size= 50;
			
			SearchComponents.fable.scrollId = null;
			
			var url = "/jug/FABLE/_search?scroll=5m";
			var rest = new RestServiceJs(url);
			rest.post(search, function (json) {
				// Scroll ID
				SearchComponents.fable.scrollId = json._scroll_id;
				
				// Result
				var html = ich.esInfo(json);
				$("#fbl-result-info").html(html);
				$("#fbl-result-text").empty();

				var hits = json.hits;
				html = ich.esFable(hits);
				$("#fbl-result-docs ol").html(html);
				
				$("#fbl-result-docs ol li a").click(SearchComponents.fable.showFable);
				
				// Bind Fable scrolling
				$("#fbl-next").appear(SearchComponents.fable.scrollData);
			});
		},
		scrollData : function() {
			if (SearchComponents.fable.scrollId) {
				$("#fbl-next").addClass("loading");
				// send next request
				var url = "/_search/scroll?scroll=5m&scroll_id=" + SearchComponents.fable.scrollId;
				var rest = new RestServiceJs(url);
				rest.findAll(function (json) {
					// Remove waiting
					$("#fbl-next").removeClass("loading");
				
					// New Scroll ID
					if (json.hits.hits.length>0) {
						SearchComponents.fable.scrollId = json._scroll_id;	
			
						// Append result Result
						var html = ich.esInfo(json);
						$("#fbl-result-info").html(html);
						$("#fbl-result-text").empty();

						var hits = json.hits;
						html = ich.esFable(hits);
						$("#fbl-result-docs ol").append(html);
				
						// Handle click
						$("#fbl-result-docs ol li a").click(SearchComponents.fable.showFable);
						
						// Bind Fable scrolling
						$("#fbl-next").appear(SearchComponents.fable.scrollData);
					} else {
						SearchComponents.fable.scrollId = null;
					}
				});
			}
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
		scrollId : null,
		lastFacetQuery : null,
		lastSearch: null,
		doSearch: function(search) {
			// Scroll ID
			SearchComponents.toulouse.scrollId = null;
			
			// Build Url
			var url = "/jug/";
			
			// Determine type
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
			url += "/_search?scroll=5m";
			
			// add default term
			search.from= 0;
			search.size= 50;

			// Search
			SearchComponents.toulouse.lastSearch = search;
			var rest = new RestServiceJs(url);
			rest.post(search, function (json) {
				// Handle next Scroll ID
				SearchComponents.toulouse.scrollId = json._scroll_id;
				
				var html;
				// Result
				html = ich.esInfo(json);
				$("#tls-result-info").html(html);

				// Facet
				$("#tls-result-facet").empty();
				if (json.facets) {
					SearchComponents.toulouse.displayFacets(json.facets);
				}

				// Hits
				var hits = json.hits;
				SearchComponents.toulouse.fillHitsData(hits);

				html = ich.esDoc(hits);
				$("#tls-result-docs ol").html(html);

				// Links
				$("#tls-result-docs ol li a").click(SearchComponents.toulouse.showToulouseElement);
				
				// Bind Fable scrolling
				$("#tls-next").appear(SearchComponents.toulouse.scrollData);
			});
		},
		scrollData : function() {
			if (SearchComponents.toulouse.scrollId) {
				$("#tls-next").addClass("loading");
				// send next request
				var url = "/_search/scroll?scroll=5m&scroll_id=" + SearchComponents.toulouse.scrollId;
				var rest = new RestServiceJs(url);
				rest.findAll(function (json) {
					// Remove waiting
					$("#tls-next").removeClass("loading");

					if (json.hits.hits.length>0) {
						// Handle next Scroll ID
						SearchComponents.toulouse.scrollId = json._scroll_id;

						var html;
						// Result
						html = ich.esInfo(json);
						$("#tls-result-info").html(html);

						// Facet
						if (json.facets) {
							SearchComponents.toulouse.displayFacets(json.facets);
						}

						// Hits
						var hits = json.hits;
						SearchComponents.toulouse.fillHitsData(hits);
					
						html = ich.esDoc(hits);
						$("#tls-result-docs ol").append(html);

						// Links
						$("#tls-result-docs ol li a").click(SearchComponents.toulouse.showToulouseElement);
					
						// Re Bind Fable scrolling
						$("#tls-next").appear(SearchComponents.toulouse.scrollData);
					} else {
						SearchComponents.toulouse.scrollId = null;
					}
				});
			}
		},
		fillHitsData : function(hits) {
			// Create data
			$.each(hits.hits, function (index, hits){
				hits.link =  function () {
					return getOsmLinks(this._source.wgs84.lon, this._source.wgs84.lat);	
				};
				
				hits.text = function() {
					var txt;
					var src = this._source;
					if (this._type=="VERRE") {
						txt = src.adresse;
					} else if (this._type=="VELO") {
						txt = "[ "+src.nb_bornettes+"] " + src.nom + " - " + src.adresse;
					} else if (this._type=="METRO") {
						txt =  "["+src.ligne+"] "+ src.nom;
		     		} else if (this._type=="TRAMWAY") {
						txt = src.nom;
		     		} else if (this._type=="EMBALLAGE") {
						txt = "[ " + src.type + "] " + src.adresse
					}
					
					if (this._source.insee || this._source.commune) {
						txt += " - " + this._source.insee + " " + this._source.commune;
					}
					return txt;
				};
			});	
		},
		showToulouseElement : function(event) {
			var lnk = $(this).attr("href");
			$("#tls-result-carto iframe").attr("src",lnk);
			
			// Cancel event
			event.preventDefault();
			return false;
		},
		displayFacets : function(facets) {
			// commune
			if (facets.commune) {
				var search = SearchComponents.toulouse.lastSearch;
				$.each(facets.commune.terms, function (index, term){
					term.hash = hashCode(term.term);
				});
			
				html = ich.esFacets(facets);
				$("#tls-result-facet").html(html);
				$("#tls-result-facet input[type=checkbox]").click(SearchComponents.toulouse.doFilterFacet);
			
				// Check filtered facet
				if (search.filter && search.filter.term && search.filter.term.commune) {
			        var communes = search.filter.term.commune;
					$.each(search.filter.term.commune, function(index, commune){
						$("#facet-" + hashCode(commune)).attr("checked","checked");
					});
				} else {
			        $("#facet-ALL").attr("checked","checked");
				}
			} else if (facets.distance) {
				$.each(facets.distance.ranges, function(index, range) {
					if (range.to && range.from) {
						range.label = "[ "+range.from+", " + range.to+" ]";
					} else if (range.to) {
						range.label = "[ 0 , " + range.to+" ]";
					} else if (range.from) {
						range.label = "[ "+range.from+", ∞ ]";
					}	
				});

				html = ich.esGeoFacets(facets);
				$("#tls-result-facet").html(html);
				$("#tls-result-facet input[type=radio]").click(SearchComponents.toulouse.doFilterGeoFacet);
				
				// Check filtered Facet
				if (search && search.filter && search.filter.geo_distance_range) {
					var value = "" + search.filter.geo_distance_range.from +"," + search.filter.geo_distance_range.to;
					$("input[type=radio][name=tls-facet-distance-range]").each(function(idx, elt){
						if (value == $(elt).attr("value")) {
							$(elt).attr("checked","checked");	
						}
					});
				}
			}	
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
				$("#tls-facet-commune input[type=checkbox]:checked").each( function() {
					var commune = $(this).val();
					search.filter.term.commune.push(commune);
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
		$("#tls-result-docs ol").empty();
		$("#fbl-result-info").empty();
		$("#fbl-result-text").empty();
		
		// Focus
		$(""+name+"-query").focus();
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

