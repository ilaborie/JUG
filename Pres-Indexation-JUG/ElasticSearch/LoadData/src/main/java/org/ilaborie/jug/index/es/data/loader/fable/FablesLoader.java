package org.ilaborie.jug.index.es.data.loader.fable;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.net.URL;
import java.util.zip.Adler32;

import org.elasticsearch.action.bulk.BulkRequestBuilder;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.index.IndexRequestBuilder;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.common.xcontent.XContentFactory;
import org.ilaborie.jug.index.es.data.IndexProperties;
import org.ilaborie.jug.index.es.data.loader.ILoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.io.ByteProcessor;
import com.google.common.io.Files;

/**
 * The Class DataLoader.
 * 
 */
public class FablesLoader implements ILoader {

	/** The Constant log. */
	private final Logger log;

	/** The Constant TYPE_FABLE. */
	private static final String TYPE_FABLE = "FABLE";

	/** The client. */
	private Client client;

	/** The bulk request. */
	private BulkRequestBuilder bulkRequest;

	/** The has errors. */
	private boolean hasErrors;

	/**
	 * Instantiates a new data loader.
	 *
	 */
	public FablesLoader() {
		super();
		this.log = LoggerFactory.getLogger("LoadData." + TYPE_FABLE);
	}

	/*
	 * (non-Javadoc)
	 * 
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
		this.hasErrors = false;

		this.client = client;
		this.bulkRequest = this.client.prepareBulk();

		URL resource = getClass().getResource("/Fables");
		File file = new File(resource.getFile());
		FilenameFilter filter = new FilenameFilter() {
			@Override
			public boolean accept(File dir, String name) {
				return name.endsWith(".txt");
			}
		};
		for (File txt : file.listFiles(filter)) {
			try {
				this.bulkRequest.add(this.processFile(txt));
			} catch (IOException e) {
				log.warn("Aïe !", e);
				this.hasErrors = true;
			}
		}

		BulkResponse bulkResponse = bulkRequest.execute().actionGet();
		if (bulkResponse.hasFailures()) {
			this.hasErrors = true;
			log.error("Ooops, {}", bulkResponse.buildFailureMessage());
		}
	}

	/**
	 * Process line.
	 *
	 * @param txtFable the txt fable
	 * @return the index request builder
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public IndexRequestBuilder processFile(File txtFable) throws IOException {
		long checksum = Files.getChecksum(txtFable, new Adler32());
		String id = String.valueOf(checksum);

		XContentBuilder source = this.getSource(txtFable);
		IndexRequestBuilder reqBuilder = this.client.prepareIndex(
				IndexProperties.ES_INDEX, TYPE_FABLE, id)
				.setSource(source);

		return reqBuilder;
	}

	/**
	 * Gets the source.
	 *
	 * @param fable the fable
	 * @return the source
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public XContentBuilder getSource(File fable) throws IOException {
		ByteProcessor<String> processor = new ByteProcessor<String>() {
			private StringBuffer sb = new StringBuffer();

			@Override
			public boolean processBytes(byte[] buf, int off, int len)
					throws IOException {
				String read = new String(buf, off, len, "CP850");
				String valueISO = new String(read.getBytes("CP850"),
						"ISO-8859-1");
				sb.append(valueISO);
				return true;
			}

			@Override
			public String getResult() {
				return sb.toString();
			}
		};
		String readLines = Files.readBytes(fable, processor);
		String filename = fable.getName();
		String title = filename.substring(0,
				filename.length() - ".txt".length());
		return XContentFactory.jsonBuilder().startObject()
				.field("title", title)
				.field("lines", readLines)
				.endObject();
	}
}
