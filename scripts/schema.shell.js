#!/usr/local/bin/node
//const FileSystem = require('fs');
const Sh = require('shelljs');
const Execa = require('execa');
const Path = require('path');

(async () => {
	var files = Sh.ls('source/schema/*');
	for( var file of files ){
		var basename = Path.basename(file, '.schema.hjson');
		var ret = await Execa.command(`npx hjson -j source/schema/${basename}.schema.hjson`, { stdio: 'pipe', silent: true });
		Sh.echo(ret);
		ret.stdio[1].to(`Resources/schema/${basename}.schema.json`);
	}
})()
