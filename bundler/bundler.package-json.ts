// import fs from 'fs'
// import path from 'path';

const mainPkg = 'package.json';
const angularPkg = './src/angular/package.json';

const buildPackageJson = async () => {
	const mainPkgParsed = await Bun.file(mainPkg).json();

	const angularPkgParsed = await Bun.file(angularPkg).json();

	delete mainPkgParsed.scripts;
	delete mainPkgParsed.devDependencies;
	delete mainPkgParsed.bunup;
	delete mainPkgParsed.peerDependencies;

	mainPkgParsed.dependencies = {
		...mainPkgParsed.dependencies,
		...angularPkgParsed.dependencies,
	};
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

	Bun.write('./dist/package.json', JSON.stringify(mainPkgParsed, null, 4));
};

buildPackageJson();
