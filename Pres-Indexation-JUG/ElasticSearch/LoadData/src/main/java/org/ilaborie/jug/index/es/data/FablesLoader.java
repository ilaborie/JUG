package org.ilaborie.jug.index.es.data;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.net.URL;
import java.text.ParseException;
import java.util.zip.Adler32;

import org.elasticsearch.action.bulk.BulkRequestBuilder;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.index.IndexRequestBuilder;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.common.xcontent.XContentFactory;

import com.google.common.io.ByteProcessor;
import com.google.common.io.Files;

/**
 * The Class DataLoader.
 * 
 */
public class FablesLoader {

	/** The client. */
	private final Client client;

	/** The bulk request. */
	private BulkRequestBuilder bulkRequest;

	/**
	 * Instantiates a new data loader.
	 * 
	 * @param client2
	 * 
	 * @param type
	 *            the type
	 */
	public FablesLoader(Client client) {
		super();
		this.client = client;
	}

	/**
	 * Load.
	 * 
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 */
	public void load() throws IOException {
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
				e.printStackTrace();
			}
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
	 * @throws ParseException
	 */
	public IndexRequestBuilder processFile(File txtFable) throws IOException {
		long checksum = Files.getChecksum(txtFable, new Adler32());
		String id = String.valueOf(checksum);

		XContentBuilder source = this.getSource(txtFable);
		IndexRequestBuilder reqBuilder = this.client.prepareIndex(
				IndexProperties.ES_INDEX, "FABLE", id)
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
	 * @throws ParseException
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
