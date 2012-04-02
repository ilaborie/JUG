package org.ilaborie.jug.index.es.data;

public enum Type {
	VERRE, EMBALLAGE;

	public String getFile() {
		switch (this) {
		case VERRE:
			return "/Recup_Verre.csv";
		case EMBALLAGE:
			return "/Recup_Emballage.csv";
		default:
			throw new RuntimeException("WTF !");
		}
	}
}
