package org.ilaborie.jug.index.es.data;

import java.util.Collection;
import java.util.List;

import org.elasticsearch.client.Client;
import org.elasticsearch.node.Node;
import org.elasticsearch.node.NodeBuilder;
import org.ilaborie.jug.index.es.data.loader.ILoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.collect.Lists;

/**
 * The Class Loaders.
 */
public class Loaders {

	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger("LoadData");

	/** The loaders. */
	private final List<ILoader> loaders;

	/** The has errors. */
	private boolean hasErrors;

	/**
	 * Instantiates a new loaders.
	 * 
	 * @param loaders
	 *            the loaders
	 */
	public Loaders(Collection<ILoader> loaders) {
		super();
		this.loaders = Lists.newArrayList(loaders);
	}

	/**
	 * Instantiates a new loaders.
	 * 
	 * @param loaders
	 *            the loaders
	 */
	public Loaders(ILoader... loaders) {
		this(Lists.newArrayList(loaders));
	}

	/**
	 * Load.
	 */
	public void load() {
		this.hasErrors = false;
		// Create node
		log.info("Create node");
		Node node = NodeBuilder.nodeBuilder()
				.clusterName("elasticsearch_laborie")
				.client(true)
				.build();

		// Client
		log.info("Get clients");
		Client client = node.client();

		try {
			// Start the node
			log.info("Start node");
			node.start();

			// Load all
			for (ILoader loader : this.loaders) {
				loader.load(client);
				this.hasErrors |= loader.hasErrors();
			}
		} catch (Exception e) {
			log.error(":'((", e);
		} finally {
			client.close();
			node.stop();
		}
	}

	/**
	 * Checks for errors.
	 * 
	 * @return true, if successful
	 */
	public boolean hasErrors() {
		return this.hasErrors;
	}

}
