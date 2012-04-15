package org.ilaborie.jug.index.es.data;

import java.util.List;

import org.ilaborie.jug.index.es.data.loader.ILoader;
import org.ilaborie.jug.index.es.data.loader.fable.FablesLoader;
import org.ilaborie.jug.index.es.data.loader.toulouse.EmballageDataLoader;
import org.ilaborie.jug.index.es.data.loader.toulouse.MetroDataLoader;
import org.ilaborie.jug.index.es.data.loader.toulouse.TramwayDataLoader;
import org.ilaborie.jug.index.es.data.loader.toulouse.VeloDataLoader;
import org.ilaborie.jug.index.es.data.loader.toulouse.VerreDataLoader;

import com.google.common.collect.Lists;

/**
 * The Class Main.
 */
public class LoadAll {

	/**
	 * The main method.
	 * 
	 * @param args
	 *            the arguments
	 */
	public static void main(String[] args) {

		// Loaders
		List<ILoader> loaders = Lists.newArrayList();
		loaders.add(new FablesLoader());
		loaders.add(new EmballageDataLoader());
		loaders.add(new MetroDataLoader());
		loaders.add(new TramwayDataLoader());
		loaders.add(new VeloDataLoader());
		loaders.add(new VerreDataLoader());

		Loaders lds = new Loaders(loaders);

		lds.load();

	}

}
