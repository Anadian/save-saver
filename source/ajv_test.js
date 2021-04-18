#!/usr/local/bin/node
'use strict';
/**
# [ajv_test.js](source/ajv_test.js)
> Tests if AJV will work for this project.

Internal module name: `AJVTest`

Author: Anadian

Code license: MIT
```
	Copyright 2020 Anadian
	Permission is hereby granted, free of charge, to any person obtaining a copy of this 
software and associated documentation files (the "Software"), to deal in the Software 
without restriction, including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to 
permit persons to whom the Software is furnished to do so, subject to the following 
conditions:
	The above copyright notice and this permission notice shall be included in all copies 
or substantial portions of the Software.
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
Documentation License: [![Creative Commons License](https://i.creativecommons.org/l/by-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-sa/4.0/)
> The source-code comments and documentation are written in [GitHub Flavored Markdown](https://github.github.com/gfm/).

> The type notation used in this documentation is based off of the [Google Closure type system](https://github.com/google/closure-compiler/wiki/Types-in-the-Closure-Type-System).

> The status and feature lifecycle keywords used in this documentation are based off of my own standard [defined here](https://github.com/Anadian/FeatureLifeCycleStateStandard).
*/

//#Dependencies
	//##Internal
	//##Standard
	const FileSystem = require('fs');
	//##External
	const AJV = require('ajv');
	const HJSON = require('hjson');
//#Constants
const FILENAME = 'ajv_test.js';
const MODULE_NAME = 'AJVTest';
var PACKAGE_JSON = {};
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'ajv-test';
} else{
	PROCESS_NAME = process.argv0;
}
//##Errors

//#Global Variables
/* istanbul ignore next */

//#Functions
//#Exports and Execution
if(require.main === module){
	var _return = [1,null];
	var return_error = null;
	const FUNCTION_NAME = 'MainExecutionFunction';
	//##Dependencies
		//###Internal
		//###Standard
		//###External
		//const EnvPaths = require('env-paths');
	//Constants
	//const EnvironmentPaths = EnvPaths( PROCESS_NAME );
	//Variables
	var function_return = [1,null];
	//Config
	//Main
	var ajv = new AJV();
	var hjson_string = FileSystem.readFileSync( 'source/schema/new-source.schema.hjson', 'utf8' );
	var schema_object = HJSON.parse( hjson_string );
	delete schema_object['$schema'];
	var validate_function = ajv.compile( schema_object );
	console.log( validate_function( {
		name: 'Non $afe (cahracters%)',
		alias: [],
		paths: []
	} ) );
	console.log( validate_function( {
		name: 'urlsafe',
		alias: true,
		paths: []
	} ) );
	console.log( validate_function( {
		name: 'success',
		alias: [ 'good' ],
		paths: {
			data: {
				include: 'glob*',
				exclude: 'notglob'
			}
		}
	} ) );
} else{
}
