package org.ilaborie.jug.index.es.data;

import java.io.IOException;

import org.elasticsearch.client.Client;
import org.elasticsearch.node.Node;
import org.elasticsearch.node.NodeBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Main {

	private static final Logger log = LoggerFactory.getLogger("LoadData");

	public static void main(String[] args) {

		// Create node
		log.info("Create node");
		Node node = NodeBuilder.nodeBuilder()
				.clusterName("elasticsearch_igor")
				.client(true)
				.build();

		// Start the node
		log.info("Start node");
		node.start();

		// Get client
		log.info("Get client");
		Client client = node.client();

		try {
			// Open Data Toulouse
			DataLoader loader;
			for (Type type : Type.values()) {
				loader = new DataLoader(client, type);
				loader.load();
			}
			
			FablesLoader fablesLoader = new FablesLoader(client);
			fablesLoader.load();

		} catch (IOException e) {
			log.error(":'((", e);
		} finally {
			client.close();
			node.stop();
		}
	}
}
