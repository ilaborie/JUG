
# Créer l'index EMBALLAGE avec mapping (index vide)
curl -XPUT 'localhost:9200/jug/EMBALLAGE/_mapping?pretty=true' -d '{
    "EMBALLAGE" : {
        "_all" : {"enabled" : true},
        "properties" : {
            "commune" : {
                "type" : "string",
                "analyzer" : "simple"
            },
            "adresse" : {
                "type" : "multi_field",
                "fields" : {
                    "adresse" : {
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


# Quel est le mapping de EMBALLAGE
curl -XGET 'localhost:9200/jug/EMBALLAGE/_mapping?pretty=1'

# Ajouter un document dans EMBALLAGE
curl -XPUT 'localhost:9200/jug/EMBALLAGE/6?pretty=1' -d '{
    "commune" : "TOULOUSE",
    "insee" : "31555",
    "adresse" : "PLACE DU SALIN",
    "id" : "18"
    "type" : "DMT_EMBALLAGE"
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
curl -XGET 'localhost:9200/jug/EMBALLAGE/_search?pretty=1&q=salin'
