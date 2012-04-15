
# Créer l'index METROavec mapping (index vide)
curl -XPUT 'localhost:9200/jug/METRO/_mapping?pretty=true' -d '{
    "METRO" : {
        "_all" : {"enabled" : true},
        "properties" : {
            "nom" : {
                "type" : "multi_field",
                "fields" : {
                    "title" : {
                         "type" : "string",
                         "analyzer" : "francais"
                     },
                     "ngram" : {
                         "type" : "string",
                         "analyzer" : "ngram"
                     },
                     "soundex" : {
                        "type" : "string",
                         "analyzer" : "soundex"
                     }
                }
            },
            "cc43" : {
                "type" : "geo_point"
             },
            "wgs84" : {
                "type" : "geo_point"
             }
        }
    }
}'

# Quel est le mapping de METRO
curl -XGET 'localhost:9200/jug/METRO/_mapping?pretty=1'

# Ajouter un document dans METRO
curl -XPUT 'localhost:9200/jug/METRO/6?pretty=1' -d '{
    "nom" : "GARE  CENTRALE",
    "ligne" : "C",
    "etat" : "Existant",
    "cc43" : {
        "lat" : 1575029.804,
        "lon" : 2267951.232
    },
    "wgs84" : {
        "lat" : 1.45208030,
        "lon" : 60130697
    }
}'

# Recherche simple
curl -XGET 'localhost:9200/jug/METRO/_search?pretty=1&q=gare'
