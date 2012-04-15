package org.ilaborie.jug.index.es.data.loader;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import org.elasticsearch.action.bulk.BulkRequestBuilder;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.index.IndexRequestBuilder;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.ilaborie.jug.index.es.data.IndexProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
public abstract class CsvDataLoader implements ILoader {

	/** The Constant log. */
	private final Logger log;

	/** The bulk request. */
	private BulkRequestBuilder bulkRequest;

	/** The type. */
	private final Type type;

	/** The client. */
	private Client client;
	
	/** The has errors. */
	private boolean hasErrors;

	/**
	 * Instantiates a new data loader.
	 *
	 * @param type the type
	 */
	public CsvDataLoader(Type type) {
		super();
		this.type = type;
		this.log = LoggerFactory.getLogger("LoadData." + type.name());
	}
	
	/* (non-Javadoc)
	 * @see org.ilaborie.jug.index.es.data.loader.ILoader#hasErrors()
	 */
	@Override
	public boolean hasErrors() {
		return this.hasErrors;
	}

	/**
	 * Load.
	 *
	 * @param client the client
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public void load(Client client) throws IOException {
		this.client = client;
		this.bulkRequest = client.prepareBulk();

		InputSupplier<InputStreamReader> supplier = CharStreams
				.newReaderSupplier(new InputSupplier<InputStream>() {
					@Override
					public InputStream getInput() throws IOException {
						return getClass().getResourceAsStream(type.getFile());
					}
				}, Charsets.ISO_8859_1);

		List<String> lines = CharStreams.readLines(supplier);
		for (String line : lines.subList(1, lines.size() - 1)) {
			try {
				this.bulkRequest.add(this.processLine(line));
			} catch (ParseException e) {
				log.warn("Aïe !", e);
				this.hasErrors = true;
			}
		}

		BulkResponse bulkResponse = bulkRequest.execute().actionGet();
		if (bulkResponse.hasFailures()) {
			log.error("Ooops, {}", bulkResponse.buildFailureMessage());
			this.hasErrors = true;
		} else {
			log.info("Loading {} done.", this);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return this.type.toString();
	}

	/**
	 * Process line.
	 *
	 * @param line the line
	 * @return the index request builder
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws ParseException the parse exception
	 */
	public IndexRequestBuilder processLine(String line) throws IOException,
			ParseException {
		log.debug("Process line {}", line);
		List<String> attrs = Lists.newArrayList(Splitter.on(';').trimResults()
				.split(line));
		String id = this.getId(line, attrs);
		XContentBuilder source = this.getSource(line, attrs);
		IndexRequestBuilder reqBuilder = this.client.prepareIndex(
				IndexProperties.ES_INDEX, this.type.name(), id)
				.setSource(source);

		return reqBuilder;
	}

	/**
	 * Gets the id.
	 * 
	 * @param line
	 *            the line
	 * @param attrs
	 *            the attrs
	 * @return the id
	 */
	protected String getId(String line, List<String> attrs) {
		return Hashing.sha1().hashString(line).toString();
	}

	/**
	 * Gets the source.
	 *
	 * @param line the line
	 * @param attrs the attrs
	 * @return the source
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws ParseException the parse exception
	 */
	protected abstract XContentBuilder getSource(String line, List<String> attrs)
			throws IOException,
			ParseException;

	/**
	 * Gets the double.
	 * 
	 * @param string
	 *            the string
	 * @return the double
	 * @throws ParseException
	 *             the parse exception
	 */
	protected Double getDouble(String string) throws ParseException {
		DecimalFormatSymbols symbol = DecimalFormatSymbols
				.getInstance(Locale.FRANCE);
		NumberFormat format = new DecimalFormat("#.#", symbol);
		return format.parse(string).doubleValue();
	}

	/**
	 * Gets the boolean.
	 * 
	 * @param string
	 *            the string
	 * @return the boolean
	 */
	protected Boolean getBoolean(String string) {
		List<String> trueString = Arrays.asList("O", "1", "true");
		return trueString.contains(string) ? Boolean.TRUE : Boolean.FALSE;
	}

}
