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
public class MetroDataLoader extends CsvDataLoader {

	/**
	 * Instantiates a new data loader.
	 *
	 */
	public MetroDataLoader() {
		super(Type.METRO);
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
		return  XContentFactory.jsonBuilder().startObject()
				.field("nom", attrs.get(0))
				.field("ligne", attrs.get(1))
				.field("etat", attrs.get(2))
				.startObject("cc43")
					.field("lat", this.getDouble(attrs.get(3)))
					.field("lon", this.getDouble(attrs.get(4)))
				.endObject()
				.startObject("wgs84")
					.field("lat", this.getDouble(attrs.get(5)))
					.field("lon", this.getDouble(attrs.get(6)))
				.endObject();
	}
}
