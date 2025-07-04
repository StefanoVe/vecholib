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
	delete mainPkgParsed.dependencies;

	mainPkgParsed.peerDependencies = {
		...mainPkgParsed.dependencies,
		...angularPkgParsed.dependencies,
	};

	mainPkgParsed.exports ={
		"./functions": {
			"default": "./functions/index.js",
			"types": "./functions/index.d.ts"
		},
		"./backend": {
			"default": "./backend/index.js",
			"types": "./backend/index.d.ts"
		},
		"./angular/modules": {
			"import": "./angular/modules/fesm2022/modules.mjs",
			"types": "./angular/modules/index.d.ts"
		},
		"./angular/directives": {
			"import": "./angular/directives/fesm2022/directives.mjs",
			"types": "./angular/directives/index.d.ts"
		},
		"./angular/components": {
			"import": "./angular/components/fesm2022/components.mjs",
			"types": "./angular/components/index.d.ts"
		}
	},
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
