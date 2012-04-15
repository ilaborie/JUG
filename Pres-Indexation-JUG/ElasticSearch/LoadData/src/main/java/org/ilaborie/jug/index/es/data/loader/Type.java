package org.ilaborie.jug.index.es.data.loader;

/**
 * The Enum Type.
 */
public enum Type {

	/** The VERRE. */
	VERRE,
	/** The EMBALLAGE. */
	EMBALLAGE,
	/** The VELO. */
	VELO,
	/** The TRAMWAY. */
	TRAMWAY,
	/** The METRO. */
	METRO;

	/**
	 * Gets the file.
	 * 
	 * @return the file
	 */
	public String getFile() {
		switch (this) {
		case VERRE:
			return "/Recup_Verre.csv";
		case EMBALLAGE:
			return "/Recup_Emballage.csv";
		case METRO:
			return "/Metro_Station.csv";
		case TRAMWAY:
			return "/Tramway_Stations.csv";
		case VELO:
			return "/Velo_Toulouse.csv";
		default:
			throw new RuntimeException("WTF !");
		}
	}
}
