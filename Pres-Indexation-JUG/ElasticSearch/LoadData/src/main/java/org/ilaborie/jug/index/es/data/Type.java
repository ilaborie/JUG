package org.ilaborie.jug.index.es.data;

public enum Type {
	VERRE, EMBALLAGE,
	VELO,TRAMWAY,METRO;

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
