##################################
# Quelques commandes ElasticSearch
##################################

# Supprimer toutes les données
curl -XDELETE 'localhost:9200/jug?pretty=1'

# Créer un analyser (index vide)
curl -XPUT 'localhost:9200/jug?pretty=1' -d '{
    "settings" : {
        "index" : {
            "analysis" : {
                "analyzer" : {
                    "ngram" : {
                        "tokenizer" : "standard",
                        "filter" : ["standard", "lowercase", "stop", "ngram"]
                    },
                    "string_lowercase" : {
                        "tokenizer" : "keyword",
                        "filter" : ["lowercase"]
                    },
                    "soundex" : {
                        "tokenizer" : "whitespace",
                        "filter" : ["soundex"]
                    },
                    "francais" : {
                        "tokenizer" : "standard",
                        "filter" : ["lowercase", "asciifolding", "stop_fr", "elision", "snowball_fr"]
                    }
                },
                "filter" : {
                    "soundex" : {
                        "type" : "phonetic",
                        "encoder" : "double_metaphone"
                    },
                    "ngram" : {
                        "type" : "ngram",
                        "min_gram" : 2,
                        "max_gram" : 4
                    },
                    "stop_fr" : {
                        "type" : "stop",
                        "stopwords_path" : "stop_fr.txt"
                    },
                    "snowball_fr" : {
                        "type" : "snowball",
                        "language" : "French"
                    }
                }
            }
        }
    }
}'
