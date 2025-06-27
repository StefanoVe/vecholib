// import fs from 'fs'
// import path from 'path';

const buildPackageJson = async () => {
	const packageJson: Record<string, unknown> = await Bun.file(
		'package.json'
	).json();

	delete packageJson.scripts;
	delete packageJson.dependencies;
	delete packageJson.devDependencies;
	delete packageJson.bunup;
	delete packageJson.peerDependencies;

	// 	fs.readdirSync(dir).forEach(file => {
	//     const full = path.join(dir, file);
	//     const rel = path.join(prefix, file);
	//     if (fs.statSync(full).isDirectory()) {
	//       scan(full, rel);
	//     } else if (file.endsWith('.js') && !file.endsWith('.test.js')) {
	//       const subpath = '/' + rel.replace(/\.js$/, '');
	//       addExport(subpath);
	//     }
	//   });

	Bun.write('./dist/package.json', JSON.stringify(packageJson, null, 4));
};

buildPackageJson();
