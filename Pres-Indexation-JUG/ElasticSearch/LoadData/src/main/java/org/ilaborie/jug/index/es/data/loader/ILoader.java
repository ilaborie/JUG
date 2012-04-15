package org.ilaborie.jug.index.es.data.loader;

import java.io.IOException;

import org.elasticsearch.client.Client;

/**
 * The Interface ILoader.
 */
public interface ILoader {

	/**
	 * Load.
	 *
	 * @param client the client
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	void load(Client client) throws IOException;

	/**
	 * Checks for errors.
	 *
	 * @return true, if successful
	 */
	boolean hasErrors();

}
