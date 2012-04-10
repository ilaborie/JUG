Presentation Indexation JUG
===========================

Date de la présentation : 26 Mai 2012
[Toulouse JUG]()


Lucene
------

ElasticSearch
-------------

<http://www.elasticsearch.org/>

[Github](https://github.com/elasticsearch)

[Presentation](http://www.infoq.com/presentations/ElasticSearch)

[Pour ma recherche, MySQL ou ElasticSearch ?](http://www.cestpasdur.com/2012/04/01/elasticsearch-vs-mysql-recherche)

[ElasticSearch, interview with Shay Banon](http://www.touilleur-express.fr/2011/04/12/elasticsearch-interview-with-shay-banon/)

If this is your first install, automatically load ElasticSearch on login with:

    mkdir -p ~/Library/LaunchAgents
    ln -nfs /usr/local/Cellar/elasticsearch/0.19.2/homebrew.mxcl.elasticsearch.plist ~/Library/LaunchAgents/
    launchctl load -wF ~/Library/LaunchAgents/homebrew.mxcl.elasticsearch.plist

If this is an upgrade and you already have the homebrew.mxcl.elasticsearch.plist loaded:

    launchctl unload -w ~/Library/LaunchAgents/homebrew.mxcl.elasticsearch.plist
    ln -nfs /usr/local/Cellar/elasticsearch/0.19.2/homebrew.mxcl.elasticsearch.plist ~/Library/LaunchAgents/
    launchctl load -wF ~/Library/LaunchAgents/homebrew.mxcl.elasticsearch.plist

To stop the ElasticSearch daemon:

    launchctl unload -wF ~/Library/LaunchAgents/homebrew.mxcl.elasticsearch.plist

To start ElasticSearch manually:

    elasticsearch -f -D es.config=/usr/local/Cellar/elasticsearch/0.19.2/config/elasticsearch.yml

See the 'elasticsearch.yml' file for configuration options.

You'll find the ElasticSearch log here:

    open /usr/local/var/log/elasticsearch/elasticsearch_igor.log

The folder with cluster data is here:

    open /usr/local/var/elasticsearch/elasticsearch_igor/

You should see ElasticSearch running:

    open http://localhost:9200/

SolR
----

[La recherche Full Text avec Solr](http://g-rossolini.developpez.com/tutoriels/solr/?page=introduction)


Website
-------
[Initializr](http://www.initializr.com/)

=> Highlight


Data
----
[GrandToulouseData](http://data.grandtoulouse.fr/)

* Supprimer la permière ligne
* Capitalize des adresses, des villes
* Format for float
* Encoding (madrid)
