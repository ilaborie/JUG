package org.ilaborie.jug.index.es.data;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import org.elasticsearch.client.Client;
import org.elasticsearch.node.Node;
import org.elasticsearch.node.NodeBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Function;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

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

			List<DataLoader> loaders = Lists.newArrayList();
			for (Type type : Type.values()) {
				loaders.add(new DataLoader(type));
			}

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
