#!/usr/local/bin/node
//const FileSystem = require('fs');
const Sh = require('shelljs');
const Hjson = require('hjson');
const Path = require('path');

(async () => {
	var files = Sh.ls('source/schema/*');
	for( var file of files ){
		var basename = Path.basename(file, '.schema.hjson');
		var file_shellstring = Sh.cat(`source/schema/${basename}.schema.hjson`);
		var json_object = Hjson.parse(file_shellstring.toString());
		var json_string = JSON.stringify( json_object, null, '\t' );
		Sh.echo(json_string).to(`Resources/schema/${basename}.schema.json`);
	}
})()
