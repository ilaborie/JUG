package org.ilaborie.jug.index.es.data;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

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
			List<? extends DataLoader> loaders = Arrays.asList(
					new DataLoader(Type.VERRE),
					new DataLoader(Type.EMBALLAGE));

			for (DataLoader loader : loaders) {
				loader.setClient(client);
				loader.load();
			}
		} catch (IOException e) {
			log.error(":'((", e);
		} finally {
			client.close();
			node.stop();
		}
	}
}
