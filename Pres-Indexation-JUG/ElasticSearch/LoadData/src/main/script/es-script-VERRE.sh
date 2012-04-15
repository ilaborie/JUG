
# Créer l'index VERRE avec mapping (index vide)
curl -XPUT 'localhost:9200/jug/VERRE/_mapping?pretty=true' -d '{
    "VERRE" : {
        "_all" : {"enabled" : true},
        "properties" : {
            "commune" : {
                "type" : "string",
                "analyzer" : "string_lowercase"
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

# Quel est le mapping de VERRE
curl -XGET 'localhost:9200/jug/VERRE/_mapping?pretty=1'

# Ajouter un document dans VERRE
curl -XPUT 'localhost:9200/jug/VERRE/6?pretty=1' -d '{
    "commune" : "Toulouse",
    "code_insee" : "31555",
    "adresse" : "MONUMENT AUX COMBATTANTS",
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
curl -XGET 'localhost:9200/jug/VERRE/_search?pretty=1&q=carnot'
