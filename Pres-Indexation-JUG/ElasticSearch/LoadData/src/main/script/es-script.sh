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

# Créer l'index FABLE avec mapping (index vide)
curl -XPUT 'localhost:9200/jug/FABLE/_mapping?pretty=true' -d '{
    "FABLE" : {
        "_all" : {"enabled" : true},
        "properties" : {
            "title" : {
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
            "lines" : {
                "type" : "multi_field",
                "fields" : {
                    "lines" : {
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
            }
        }
    }
}'

# Créer l'index EMBALLAGE avec mapping (index vide)
curl -XPUT 'localhost:9200/jug/EMBALLAGE/_mapping?pretty=true' -d '{
    "EMBALLAGE" : {
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

