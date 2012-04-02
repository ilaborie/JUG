package org.ilaborie.jug.index.es.data;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;

import org.elasticsearch.action.bulk.BulkRequestBuilder;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.index.IndexRequestBuilder;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.common.xcontent.XContentFactory;

import com.google.common.base.Charsets;
import com.google.common.base.Splitter;
import com.google.common.collect.Lists;
import com.google.common.hash.Hashing;
import com.google.common.io.CharStreams;
import com.google.common.io.InputSupplier;

/**
 * The Class DataLoader.
 * 
 */
public class DataLoader {

	/** The client. */
	private Client client;

	/** The bulk request. */
	private BulkRequestBuilder bulkRequest;

	/** The type. */
	private final Type type;

	/**
	 * Instantiates a new data loader.
	 * 
	 * @param type
	 *            the type
	 */
	public DataLoader(Type type) {
		super();
		this.type = type;
	}

	/**
	 * Load.
	 * 
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 */
	public void load() throws IOException {
		this.bulkRequest = this.client.prepareBulk();

		InputSupplier<InputStreamReader> supplier = CharStreams
				.newReaderSupplier(new InputSupplier<InputStream>() {
					@Override
					public InputStream getInput() throws IOException {
						return getClass().getResourceAsStream(type.getFile());
					}
				}, Charsets.UTF_8);

		List<String> lines = CharStreams.readLines(supplier);
		for (String line : lines) {
			this.bulkRequest.add(this.processLine(line));
		}

		BulkResponse bulkResponse = bulkRequest.execute().actionGet();
		if (bulkResponse.hasFailures()) {
			throw new RuntimeException("Ooops !"
					+ bulkResponse.buildFailureMessage());
		}
	}

	/**
	 * Process line.
	 * 
	 * @param line
	 *            the line
	 * @return the index request builder
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 */
	public IndexRequestBuilder processLine(String line) throws IOException {
		String id = Hashing.sha1().hashString(line).toString();
		XContentBuilder source = this.getSource(line);
		IndexRequestBuilder reqBuilder = this.client.prepareIndex(
				IndexProperties.ES_INDEX, this.type.name(), id)
				.setSource(source);

		return reqBuilder;
	}

	/**
	 * Gets the source.
	 * 
	 * @param line
	 *            the line
	 * @return the source
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 */
	public XContentBuilder getSource(String line) throws IOException {
		List<String> attrs = Lists.newArrayList(Splitter.on(';').trimResults()
				.split(line));

		return XContentFactory.jsonBuilder().startObject()
				.field("Commune", attrs.get(0))
				.field("Code_Com", attrs.get(1))
				.field("Adresse", attrs.get(2))
				.field("ID2", attrs.get(3))
				.startObject("CC43")
				.field("X", attrs.get(4))
				.field("Y", attrs.get(5))
				.endObject()
				.startObject("WGS84")
				.field("X", attrs.get(6))
				.field("Y", attrs.get(7))
				.endObject()
				.endObject();
	}

	/**
	 * Gets the client.
	 * 
	 * @return the client
	 */
	public Client getClient() {
		return client;
	}

	/**
	 * Sets the client.
	 * 
	 * @param client
	 *            the new client
	 */
	public void setClient(Client client) {
		this.client = client;
	}

}
