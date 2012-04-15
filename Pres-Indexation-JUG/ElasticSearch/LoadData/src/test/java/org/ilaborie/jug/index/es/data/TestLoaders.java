package org.ilaborie.jug.index.es.data;

import junit.framework.Assert;

import org.ilaborie.jug.index.es.data.loader.ILoader;
import org.ilaborie.jug.index.es.data.loader.fable.FablesLoader;
import org.ilaborie.jug.index.es.data.loader.toulouse.EmballageDataLoader;
import org.ilaborie.jug.index.es.data.loader.toulouse.MetroDataLoader;
import org.ilaborie.jug.index.es.data.loader.toulouse.TramwayDataLoader;
import org.ilaborie.jug.index.es.data.loader.toulouse.VeloDataLoader;
import org.ilaborie.jug.index.es.data.loader.toulouse.VerreDataLoader;
import org.junit.Test;

/**
 * The Class TestVerre.
 */
public class TestLoaders {

	/**
	 * Test load verre.
	 * 
	 * @throws Exception
	 *             the exception
	 */
	@Test
	public void testLoadVerre() throws Exception {
		ILoader loader = new VerreDataLoader();
		Loaders loaders = new Loaders(loader);

		loaders.load();
		Assert.assertFalse(loaders.hasErrors());
	}

	/**
	 * Test load velo.
	 * 
	 * @throws Exception
	 *             the exception
	 */
	@Test
	public void testLoadVelo() throws Exception {
		ILoader loader = new VeloDataLoader();
		Loaders loaders = new Loaders(loader);

		loaders.load();
	}

	/**
	 * Test load tramway.
	 * 
	 * @throws Exception
	 *             the exception
	 */
	@Test
	public void testLoadTramway() throws Exception {
		ILoader loader = new TramwayDataLoader();
		Loaders loaders = new Loaders(loader);

		loaders.load();
		Assert.assertFalse(loaders.hasErrors());
	}

	/**
	 * Test load metro.
	 * 
	 * @throws Exception
	 *             the exception
	 */
	@Test
	public void testLoadMetro() throws Exception {
		ILoader loader = new MetroDataLoader();
		Loaders loaders = new Loaders(loader);

		loaders.load();
		Assert.assertFalse(loaders.hasErrors());
	}

	/**
	 * Test load emballage.
	 * 
	 * @throws Exception
	 *             the exception
	 */
	@Test
	public void testLoadEmballage() throws Exception {
		ILoader loader = new EmballageDataLoader();
		Loaders loaders = new Loaders(loader);

		loaders.load();
		Assert.assertFalse(loaders.hasErrors());
	}

	/**
	 * Test load fables.
	 * 
	 * @throws Exception
	 *             the exception
	 */
	@Test
	public void testLoadFables() throws Exception {
		ILoader loader = new FablesLoader();
		Loaders loaders = new Loaders(loader);

		loaders.load();
		Assert.assertFalse(loaders.hasErrors());
	}

}
