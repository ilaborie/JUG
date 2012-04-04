package org.ilaborie.jug.index.es.data;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.List;
import java.util.Locale;

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

// TODO: Auto-generated Javadoc
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
				}, Charsets.ISO_8859_1);

		List<String> lines = CharStreams.readLines(supplier);
		for (String line : lines.subList(1, lines.size() - 1)) {
			try {
				this.bulkRequest.add(this.processLine(line));
			} catch (ParseException e) {
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
	public IndexRequestBuilder processLine(String line) throws IOException,
			ParseException {
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
	 * @throws ParseException
	 */
	public XContentBuilder getSource(String line) throws IOException,
			ParseException {
		List<String> attrs = Lists.newArrayList(Splitter.on(';').trimResults()
				.split(line));
		switch (this.type) {
		case VERRE:
			return getVerreSource(attrs);
		case EMBALLAGE:
			return getEmballageSource(attrs);
		case METRO:
			return getMetroSource(attrs);
		case TRAMWAY:
			return getTramwaySource(attrs);
		case VELO:
			return getVeloSource(attrs);
		default:
			return null;
		}
	}

	/**
	 * Gets the metro source.
	 * 
	 * @param attrs
	 *            the attrs
	 * @return the metro source
	 * @throws NumberFormatException
	 *             the number format exception
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 * @throws ParseException
	 *             the parse exception
	 */
	private XContentBuilder getMetroSource(List<String> attrs)
			throws NumberFormatException, IOException, ParseException {
		return XContentFactory.jsonBuilder().startObject()
				.field("nom", attrs.get(0).toLowerCase())
				.field("ligne", attrs.get(1))
				.field("Etat", attrs.get(2))
				.startObject("CC43")
				.field("X", this.getDouble(attrs.get(3)))
				.field("Y", this.getDouble(attrs.get(4)))
				.endObject()
				.startObject("WGS84")
				.field("X", attrs.get(5))
				.field("Y", attrs.get(6))
				.endObject()
				.endObject();
	}

	/**
	 * Gets the tramway source.
	 * 
	 * @param attrs
	 *            the attrs
	 * @return the tramway source
	 * @throws NumberFormatException
	 *             the number format exception
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 * @throws ParseException
	 *             the parse exception
	 */
	private XContentBuilder getTramwaySource(List<String> attrs)
			throws NumberFormatException, IOException, ParseException {
		return XContentFactory.jsonBuilder().startObject()
				.field("ID", attrs.get(0))
				.field("nom", attrs.get(1).toLowerCase())
				.startObject("CC43")
				.field("X", this.getDouble(attrs.get(2)))
				.field("Y", this.getDouble(attrs.get(3)))
				.endObject()
				.startObject("WGS84")
				.field("X", attrs.get(4))
				.field("Y", attrs.get(5))
				.endObject()
				.endObject();
	}

	/**
	 * Gets the velo source.
	 * 
	 * @param attrs
	 *            the attrs
	 * @return the velo source
	 * @throws NumberFormatException
	 *             the number format exception
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 * @throws ParseException
	 *             the parse exception
	 */
	private XContentBuilder getVeloSource(List<String> attrs)
			throws NumberFormatException, IOException, ParseException {
		return XContentFactory.jsonBuilder().startObject()
				.field("nom", attrs.get(0).toLowerCase())
				.field("num_station", Integer.valueOf(attrs.get(1)))
				.field("nb_bornettes", Integer.valueOf(attrs.get(2)))
				.field("En_service", this.getBoolean(attrs.get(3)))
				.field("M_en_S_16_nov_07", this.getBoolean(attrs.get(4)))
				.field("street", attrs.get(5).toLowerCase())
				.field("Mot_Directeur", attrs.get(6))
				.field("No", attrs.get(7))
				.field("Nrivoli", attrs.get(8))
				.field("Commune", attrs.get(9).toLowerCase())
				.field("code_insee", attrs.get(10))
				.startObject("CC43")
				.field("X", this.getDouble(attrs.get(11)))
				.field("Y", this.getDouble(attrs.get(12)))
				.endObject()
				.startObject("WGS84")
				.field("X", attrs.get(13))
				.field("Y", attrs.get(14))
				.endObject()
				.endObject();
	}

	/**
	 * Gets the verre source.
	 * 
	 * @param attrs
	 *            the attrs
	 * @return the verre source
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 * @throws ParseException
	 *             the parse exception
	 */
	private XContentBuilder getVerreSource(List<String> attrs)
			throws IOException, ParseException {
		return XContentFactory.jsonBuilder().startObject()
				.field("Commune", attrs.get(0).toLowerCase())
				.field("Code_Com", attrs.get(1))
				.field("Adresse", attrs.get(2).toLowerCase())
				.field("ID2", attrs.get(3))
				.startObject("CC43")
				.field("X", this.getDouble(attrs.get(4)))
				.field("Y", this.getDouble(attrs.get(5)))
				.endObject()
				.startObject("WGS84")
				.field("X", attrs.get(6))
				.field("Y", attrs.get(7))
				.endObject()
				.endObject();
	}

	/**
	 * Gets the emballage source.
	 * 
	 * @param attrs
	 *            the attrs
	 * @return the emballage source
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 * @throws ParseException
	 *             the parse exception
	 */
	private XContentBuilder getEmballageSource(List<String> attrs)
			throws IOException, ParseException {
		return XContentFactory.jsonBuilder().startObject()
				.field("Commune", attrs.get(0).toLowerCase())
				.field("Code_Com", attrs.get(1))
				.field("Adresse", attrs.get(2).toLowerCase())
				.field("ID", attrs.get(3))
				.field("DMT_TYPE", attrs.get(4))
				.startObject("CC43")
				.field("X", this.getDouble(attrs.get(5)))
				.field("Y", this.getDouble(attrs.get(6)))
				.endObject()
				.startObject("WGS84")
				.field("X", attrs.get(7))
				.field("Y", attrs.get(8))
				.endObject()
				.endObject();
	}

	/**
	 * Gets the double.
	 * 
	 * @param string
	 *            the string
	 * @return the double
	 * @throws ParseException
	 *             the parse exception
	 */
	private Double getDouble(String string) throws ParseException {
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
	private Boolean getBoolean(String string) {
		return "1".equals(string) ? Boolean.TRUE : Boolean.FALSE;
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
