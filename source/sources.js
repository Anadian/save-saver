#!/usr/local/bin/node
'use strict';
/**
# [sources.js](source/sources.js)
> A class representing the `Sources.json` index file in memory.

Internal module name: `SaveSaver_Sources`

Author: Anadian

Code license: MIT
```
	Copyright 2021 Anadian
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

//# Dependencies
	//## Internal
	const Source = require('./source.js');
	//## Standard
	const FileSystem = require('fs');
	//## External
//# Constants
const FILENAME = 'sources.js';
const MODULE_NAME = 'SaveSaver_Sources';
var PACKAGE_JSON = {};
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'save-saver';
} else{
	PROCESS_NAME = process.argv0;
}
//## Errors

//# Global Variables
/* istanbul ignore next */
var Logger = { 
	log: () => {
		return null;
	}
};
var ConfigObject = {};
var EnvironmentPaths = {};
/**
## Functions
*/
/**
### setLogger
> Allows this module's functions to log to the given logger object.

Parametres:
| name | type | description |
| --- | --- | --- |
| logger | {?object} | The logger to be used for logging or `null` to disable logging. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if `logger` is neither an object nor `null` |

History:
| version | change |
| --- | --- |
| 0.0.0 | Introduced |
*/
function setLogger( logger ){
	var return_error = null;
	//const FUNCTION_NAME = 'setLogger';
	//Variables
	//Parametre checks
	/* istanbul ignore else */
	if( typeof(logger) === 'object' ){
		/* istanbul ignore next */
		if( logger === null ){
			logger = { 
				log: () => {
					return null;
				}
			};
		}
	} else{
		return_error = new TypeError('Param "logger" is not an object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	Logger = logger;
	//Return
}
/**
### setConfigObject
> Sets the config object for the module to the given object or `null` for the default options.

Parametres:
| name | type | description |
| --- | --- | --- |
| config_object | {?Object} | An object containing the configuration properties or `null` to use the default values for all options.  |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

History:
| version | change |
| --- | --- |
| 0.0.0 | Introduced |
*/
function setConfigObject( config_object ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'setConfigObject';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	//Parametre checks
	if( typeof(config_object) !== 'object' ){
		return_error = new TypeError('Param "config_object" is not an object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( config_object != null ){
		ConfigObject = config_object;
	} else{
		//default
		ConfigObject = {};
	}
}
/**
### setEnvironmentPaths
> Sets the environment paths (standard directories for data, config, et cetera) for this module to use.

Parametres:
| name | type | description |
| --- | --- | --- |
| environment_paths | {Object} | An object, such as the one returned by [env-paths](https://github.com/sindresorhus/env-paths), with the paths for the properties: `data`, `config`, `log`, `cache`, and `temp`.  |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |
| 'ERR_INVALID_ARG_VALUE' | {Error} | Thrown if `environment_paths` is `null`. |

History:
| version | change |
| --- | --- |
| 0.0.0 | Introduced |
*/
function setEnvironmentPaths( environment_paths ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'setEnvironmentPaths';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	//Parametre checks
	if( typeof(environment_paths) !== 'object' ){
		return_error = new TypeError('Param "environment_paths" is not an object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( environment_paths != null ){
		EnvironmentPaths = environment_paths;
	} else{
		return_error = new Error('Param `environment_paths` is `null`.');
		return_error.code = 'ERR_INVALID_ARG_VALUE';
		throw return_error;
	}
}

function Sources( file_path ){
	this.file_path = '';
	this.last_write = '';
	this.sources = {};
	return ( async ( file_path ) => { 
		var access_promise = null;
		access_promise = FileSystem.promises.access( file_path, ( FileSystem.constants.R_OK | FileSystem.constants.W_OK ) );
		access_promise.then( 
			() => {
				var _return = null;
				var object_promise = null;
				var eol_fix_function = data_string => { return data_string.replace( /\r\n/g, '\n' ); };
				var parse_json_function = json_string => {
					var _return = null;
					var return_error = null;
					try{
						_return = ParseJSON( json_string, null, null );
					} catch(error){
						return_error = new Error(`ParseJSON threw an error: ${error}`);
						throw return_error;
					}
					return _return;
				};
				try{
					object_promise = FileSystem.promises.readFile( file_path, 'utf8' ).then( eol_fix_function ).then( parse_json_function );
				} catch(error){
					return_error = new Error(`FileSystem.promises.readFile threw an error: ${error}`);
					throw return_error;
				}
				object_promise.then( (read_object) => {
					var return_error = null;
					if( SourcesJSONValidationFunction( read_object ) === true ){
						this.file_path = file_path;
						this.last_write = read_object.last_write;
						try{ 
							Object.keys( read_object.sources ).forEach( ( item, index ) => {
								var return_error = null;
								var source_object = {};
								try{
									source_object = new Source( read_source );
									this.sources[source_object.name] = source_object;
								} catch(error){
									return_error = new Error(`Attempting to create a new source for the object at index ${index} of "read_object.sources" threw an error: ${error}`);
									throw return_error; //possibly recover.
								} 
							} );
						} catch(error){
							return_error = new Error(`An unexpected error occurred while attempting to add the sources from the "read_object": ${error}`);
							throw return_error;
						}
					} else{
						return_error = new Error('Param "read_object" is not a valid `sources-json` object.');
						return_error.code = 'ERR_INVALID_ARG_VALUE';
						throw return_error;
					}
					//All good!?
					return this;
				},
				(error) => {
					return_error = new Error(`'object_promise' resolved with an error: ${error}`);
					throw return_error;
				} ); //object_promise.then
				return object_promise;
			},
			(error) => {
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: `FileSystem.access threw an error: ${error}`});
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: '`Sources.json` does not exist; attempting to create one.'});
				object_promise = Promise.resolve( {} );
			} );
		return access_promise;
	} ); //grouping
} //function Sources

//# Exports and Execution
if(require.main === module){
} else{
	exports.setLogger = setLogger;
	exports.setConfigObject = setConfigObject;
	exports.setEnvironmentPaths = setEnvironmnetPaths;
}
