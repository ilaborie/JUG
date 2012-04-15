
# Créer l'index VELO avec mapping (index vide)
curl -XPUT 'localhost:9200/jug/VELO/_mapping?pretty=true' -d '{
    "VELO" : {
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
            "en_service" : {
                "type" : "boolean"
            },
            "m_en_S_16_nov_07" : {
                "type" : "boolean"
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

# Quel est le mapping de VELO
curl -XGET 'localhost:9200/jug/VELO/_mapping?pretty=1'

# Ajouter un document dans VELO
curl -XPUT 'localhost:9200/jug/VELO/6?pretty=1' -d '{
    "nom" : "MONUMENT AUX COMBATTANTS",
    "num_station" : 23,
    "nb_bornettes" : 24,
    "en_service" : true,
    "m_en_S_16_nov_07" : true,
    "street" : "BD LAZARE CARNOT",
    "mot_Directeur" : "CARNOT (BD LAZARE CARNOT)",
    "no" : "6",
    "nrivoli" : "3105555132",
    "commune" : "Toulouse",
    "code_insee" : "31555",
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
curl -XGET 'localhost:9200/jug/VELO/_search?pretty=1&q=monument'
