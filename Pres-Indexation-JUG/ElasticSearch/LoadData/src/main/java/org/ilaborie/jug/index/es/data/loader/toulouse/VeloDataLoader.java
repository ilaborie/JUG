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
public class VeloDataLoader extends CsvDataLoader {

	/**
	 * Instantiates a new data loader.
	 *
	 */
	public VeloDataLoader() {
		super(Type.VELO);
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
		return attrs.get(7);
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
		return XContentFactory.jsonBuilder().startObject()
				.field("nom", attrs.get(0))
				.field("id", attrs.get(1))
				.field("nb_bornettes", this.getInteger(attrs.get(2)))
				.field("en_service", this.getBoolean(attrs.get(3)))
				.field("m_en_S_16_nov_07", this.getBoolean(attrs.get(4)))
				.field("adresse", attrs.get(5))
				.field("mot_Directeur", attrs.get(6))
				.field("num", attrs.get(7))
				.field("nrivoli", attrs.get(8))
				.field("commune", attrs.get(9))
				.field("insee", attrs.get(10))
				.startObject("cc43")
					.field("lat", this.getDouble(attrs.get(11)))
					.field("lon", this.getDouble(attrs.get(12)))
				.endObject()
				.startObject("wgs84")
					.field("lat", this.getDouble(attrs.get(13)))
					.field("lon", this.getDouble(attrs.get(14)))
				.endObject()
				.endObject();
	}

}
