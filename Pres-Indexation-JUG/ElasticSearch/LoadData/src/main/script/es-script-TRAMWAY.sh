# Créer l'index TRAMWAY avec mapping (index vide)
curl -XPUT 'localhost:9200/jug/TRAMWAY/_mapping?pretty=true' -d '{
    "TRAMWAY" : {
        "_all" : {"enabled" : true},
        "properties" : {
            "nom" : {
                "type" : "multi_field",
                "fields" : {
                    "nom" : {
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

# Quel est le mapping de TRAMWAY
curl -XGET 'localhost:9200/jug/TRAMWAY/_mapping?pretty=1'

# Ajouter un document dans TRAMWAY
curl -XPUT 'localhost:9200/jug/TRAMWAY/6?pretty=1' -d '{
    "id" : "1",
    "nom" : "ARENES",
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
curl -XGET 'localhost:9200/jug/TRAMWAY/_search?pretty=1&q=arenes'
