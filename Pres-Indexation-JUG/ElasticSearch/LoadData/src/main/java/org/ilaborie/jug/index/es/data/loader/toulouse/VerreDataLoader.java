package org.ilaborie.jug.index.es.data.loader.toulouse;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;

import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.common.xcontent.XContentFactory;
import org.ilaborie.jug.index.es.data.loader.CsvDataLoader;
import org.ilaborie.jug.index.es.data.loader.Type;

/**
 * The Class DataLoader.
 * 
 */
public class VerreDataLoader extends CsvDataLoader {

	/**
	 * Instantiates a new data loader.
	 *
	 */
	public VerreDataLoader() {
		super(Type.VERRE);
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
	@Override
	protected String getId(String line, List<String> attrs) {
		return attrs.get(3);
	}

	/**
	 * Gets the source.
	 * 
	 * @param line
	 *            the line
	 * @param attrs
	 *            the attrs
	 * @return the source
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 * @throws ParseException
	 *             the parse exception
	 */
	@Override
	protected XContentBuilder getSource(String line, List<String> attrs)
			throws IOException, ParseException {
		//Commune;Code_Com;Adresse;ID2;X_CC43;Y_CC43;X_WGS84;Y_WGS84
		return XContentFactory.jsonBuilder().startObject()
				.field("commune", attrs.get(0))
				.field("code_insee", attrs.get(1))
				.field("adresse", attrs.get(2))
				.field("id2", attrs.get(3))
				.startObject("cc43")
					.field("lat", this.getDouble(attrs.get(4)))
					.field("lon", this.getDouble(attrs.get(5)))
				.endObject()
				.startObject("wgs84")
					.field("lat", this.getDouble(attrs.get(6)))
					.field("lon", this.getDouble(attrs.get(7)))
				.endObject()
				.endObject();
	}

}
