
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

# Quel est le mapping de FABLE
curl -XGET 'localhost:9200/jug/FABLE/_mapping?pretty=1'

# Analyser une chaîne

curl -XPOST 'localhost:9200/jug/_analyze?analyzer=whitespace&pretty=1' -d 'Maître Corbeau, sur un arbre perché, Tenait en son bec un fromage.'

curl -XPOST 'localhost:9200/jug/_analyze?analyzer=simple&pretty=1' -d 'Maître Corbeau, sur un arbre perché, Tenait en son bec un fromage.'

curl -XPOST 'localhost:9200/jug/_analyze?analyzer=standard&pretty=1' -d 'Maître Corbeau, sur un arbre perché, Tenait en son bec un fromage.'

curl -XPOST 'localhost:9200/jug/_analyze?analyzer=keyword&pretty=1' -d 'Maître Corbeau, sur un arbre perché, Tenait en son bec un fromage.'

curl -XPOST 'localhost:9200/jug/_analyze?analyzer=french&pretty=1' -d 'Maître Corbeau, sur un arbre perché, Tenait en son bec un fromage.'

curl -XPOST 'localhost:9200/jug/_analyze?analyzer=francais&pretty=1' -d 'Maître Corbeau, sur un arbre perché, Tenait en son bec un fromage.'

# Ajouter un document dans FABLE
curl -XPUT 'localhost:9200/jug/FABLE/1?pretty=1' -d '{
	"title" : "Le corbeau et le renard",
	"lines" : "Maître Corbeau, sur un arbre perché, Tenait en son bec un fromage."
}'

# Recherche simple
curl -XGET 'localhost:9200/jug/FABLE/_search?pretty=1&q=renard'

# Recherche sur un champ
curl -XGET 'localhost:9200/jug/FABLE/_search?pretty=1&q=title:fromage'
curl -XGET 'localhost:9200/jug/FABLE/_search?pretty=1&q=lines:fromage'

# Recherche phonétique
curl -XGET 'localhost:9200/jug/FABLE/_search?pretty=1&q=lines.ngram:Korbet'

# Recherche phonétique
curl -XGET 'localhost:9200/jug/FABLE/_search?pretty=1&q=lines.soundex:corbo'