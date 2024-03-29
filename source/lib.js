#!/usr/local/bin/node
'use strict';
/**
# [lib.js](source/lib.js)
> Implements the back-end of `save-saver`.

Internal module name: `SaveSaver`

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
	//## Standard
	const FileSystem = require('fs');
	const Path = require('path');
	const Cryptography = require('crypto');
	//## External
	const ParseJSON = require('parse-json');
	const MakeDir = require('make-dir');
	const CPFile = require('cp-file'); 
	const NanoID = require('nanoid');
	const Globby = require('globby');
	const AJV = require('ajv');
//# Constants
const FILENAME = 'lib.js';
const MODULE_NAME = 'SaveSaver';
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
var SourcesObject = {};
var BackupsObject = {};
var ValidationFunctionsObject = {
	'source-object': null,
	'sources-json': null,
	'backup-object': null,
	'backups-json': null
};
/**
## Functions
*/
/**
### loadSchemaFunctions
> Loads the schema files, compiles them into to validation functions, and stores them in a global object.

Parametres:
| name | type | description |
| --- | --- | --- |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
function loadSchemaFunctions( options = {} ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'loadSchemaFunctions';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var schema_functions_array = [];
	var file_path = '';
	var schema_string = '';
	var schema_json = {};
	var ajv = new AJV();
	//Parametre checks
	if( typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is not ?Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	schema_functions_array = Object.keys(ValidationFunctionsObject);
	for( const name of schema_functions_array ){
		try{
			file_path = Path.join( 'Resources', 'schema', name+'.schema.json' );
		} catch(error){
			return_error = new Error(`Path.join threw an error: ${error}`);
			throw return_error;
		}
		try{
			schema_string = FileSystem.readFileSync( file_path, 'utf8' );
		} catch(error){
			return_error = new Error(`FileSystem.readFileSync threw an error: ${error}`);
			throw return_error;
		}
		try{
			schema_json = ParseJSON( schema_string );
		} catch(error){
			return_error = new Error(`ParseJSON threw an error: ${error}`);
			throw return_error;
		}
		try{
			ValidationFunctionsObject[name] = ajv.compile( schema_json );
		} catch(error){
			return_error = new Error(`ajv.compile threw an error: ${error}`);
			throw return_error;
		}
	}
}
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
/**
### setSourcesObject
> Sets the object for the `Paths.json` file containing all of the source entries.

Parametres:
| name | type | description |
| --- | --- | --- |
| sources_object | {Object} | The object to be used as the `Sources` object.  |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
function setSourcesObject( sources_object ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'setSourcesObject';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	//Parametre checks
	if( typeof(sources_object) !== 'object' ){
		return_error = new TypeError('Param "sources_object" is not Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	SourcesObject = sources_object;
}
/**
### setBackupsObject
> Sets the object to be used as the `Backups.json` object.

Parametres:
| name | type | description |
| --- | --- | --- |
| backups_object | {Object} | The object to be used.  |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
function setBackupsObject( backups_object ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'setBackupsObject';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	//Parametre checks
	if( typeof(backups_object) !== 'object' ){
		return_error = new TypeError('Param "backups_object" is not Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	BackupsObject = backups_object;
}
/**
### base64URLStringFromBuffer
> Encodes the given Buffer as a URL-safe base64 string.

Parametres:
| name | type | description |
| --- | --- | --- |
| input_buffer | {Buffer} | A NodeJS Buffer containing the data to be encoded.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {string} | A URL-safe base64-encoded string for the data. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
function base64URLStringFromBuffer( input_buffer, options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'base64URLStringFromBuffer';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	//Parametre checks
	if( Buffer.isBuffer(input_buffer) === false ){
		return_error = new TypeError('Param "input_buffer" is not Buffer.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is not ?Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	_return = input_buffer.toString('base64').replace( /\+/g, '-' ).replace( /\//g, '_' );

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}
/**
### sha256BufferFromFilePath (Async)
> Returns a Buffer containing the SHA256 digest of the file at the given path.

Parametres:
| name | type | description |
| --- | --- | --- |
| file_path | {string} | A string containing the path to the file.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {Promise} | A Promise resolving to a NodeJS Buffer of the sha256 hash of the file. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
async function sha256BufferFromFilePath( file_path, options = {} ){
	var arguments_array = Array.from(arguments);
	var _return = null;
	var return_error;
	const FUNCTION_NAME = 'sha256BufferFromFilePath';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//console.log(`${FUNCTION_NAME} received: ${file_path}`);
	//Variables
	var file_handle = null;
	var file_stats = {};
	var read_buffer = null;
	var new_buffer = null;
	var offset = 0;
	var hash = null; 
	var done = false;
	//var buffer_size = 4096; //1 KiB; will be overridden to the `blksize` of the file.
	//var file_size = 0;
	//Parametre checks
	if( typeof(file_path) !== 'string' ){
		return_error = new TypeError('Param "file_path" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is not ?Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	try{
		hash = Cryptography.createHash( 'sha256' );
	} catch(error)/* istanbul ignore next */{
		return_error = new Error(`Cryptography.createHash threw an error: ${error}`);
		throw return_error;
	}
	try{
		file_handle = await FileSystem.promises.open( file_path );
	} catch(error)/* istanbul ignore next */{
		return_error = new Error(`await FileSystem.promises.open threw an error: ${error}`);
		throw return_error;
	}
	try{
		file_stats = await file_handle.stat();
	} catch(error)/* istanbul ignore next */{
		return_error = new Error(`await file_handle.stat threw an error: ${error}`);
		throw return_error;
	}
	try{
		read_buffer = Buffer.alloc( file_stats.blksize );
	} catch(error)/* istanbul ignore next */{
		return_error = new Error(`Buffer.alloc threw an error: ${error}`);
		throw return_error;
	}
	while( !done ){
		if( (offset + file_stats.blksize) < file_stats.size ){
			try{
				file_handle.read( read_buffer, 0, file_stats.blksize, offset );

			} catch(error)/* istanbul ignore next */{
				return_error = new Error(`file_handle.read threw an error: ${error}`);
				throw return_error;
			}
			try{
				hash.update( read_buffer );
			} catch(error)/* istanbul ignore next */{
				return_error = new Error(`hash.update threw an error: ${error}`);
				throw return_error;
			}
			offset += read_buffer.length;
		} else if( offset < file_stats.size ){
			console.log('Hello');
			try{
				file_handle.read( read_buffer, 0, (file_stats.size - offset), offset );
			} catch(error)/* istanbul ignore next */{
				return_error = new Error(`file_handle.read threw an error: ${error}`);
				throw return_error;
			}
			try{
				new_buffer = Buffer.from( read_buffer.buffer, 0, (file_stats.size - offset) );
				console.log(`${new_buffer.toString('hex')}`);
			} catch(error)/* istanbul ignore next */{
				return_error = new Error(`Buffer.from threw an error: ${error}`);
				throw return_error;
			}
			try{
				hash.update( new_buffer );
			} catch(error)/* istanbul ignore next */{
				return_error = new Error(`hash.update threw an error: ${error}`);
				throw return_error;
			}
			offset += new_buffer.length;
		} else{
			try{
				_return = hash.digest();
			} catch(error)/* istanbul ignore next */{
				return_error = new Error(`hash.digest threw an error: ${error}`);
				throw return_error;
			}
			done = true;
		}
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	console.log(`${FUNCTION_NAME} returned: ${_return.toString('hex')} from ${JSON.stringify(file_stats)}`);
	return _return;
}
/**
### listSources
> Returns an object of all the sources matching the given filters.

Parametres:
| name | type | description |
| --- | --- | --- |
| filters | {object} | An object representing the combined filters. The property `include` will be used as an array of `RegExp`s of which a sources must match all of them to be included. The property `exclude` will be used as an array of `RegExp`s of which a source must not match any of them to be included. Excluding regexes take priority so a source included by the `inlcude` property can still be excluded by a regex in the `exclude` array.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {Object} | A `sources-list` object. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
function listSources( filters, options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'listSources';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var reduced_sources_array = [];
	var include_regexps_array = [];
	var exclude_regexps_array = [];
	var for_loop_errors = [];
	//Parametre checks
	if( typeof(filters) !== 'object' ){
		return_error = new TypeError('Param "filters" is not object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is not ?Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( filters.include != null && Array.isArray(filters.include) === true ){
		for( var i = 0; i < filters.include.length; i++ ){
			try{
				var element = filters.include[i];
				if( RegExp.prototype.isPrototypeOf(element) === true ){
					include_regexps_array.push( element );
				} else if( typeof(element) === 'string' ){
					try{
						var new_regex = RegExp(element);
					} catch(error){
						return_error = new Error(`RegExp threw an error: ${error}`);
						throw return_error;
					}
					include_regexps_array.push( new_regex );
				} else{
					return_error = new Error(`"element" type is not a RegExp nor a string.`);
					throw return_error;
				}
			} catch(error){
				return_error = new Error(`For loop index ${i} in "include": ${error}`);
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
				for_loop_errors.push(return_error);
			}
		}
	}
	if( filters.exclude != null && Array.isArray(filters.exclude) === true ){
		for( var i = 0; i < filters.exclude.length; i++ ){
			try{
				var element = filters.exclude[i];
				if( RegExp.prototype.isPrototypeOf(element) === true ){
					exclude_regexps_array.push( element );
				} else if( typeof(element) === 'string' ){
					try{
						var new_regex = RegExp(element);
					} catch(error){
						return_error = new Error(`RegExp threw an error: ${error}`);
						throw return_error;
					}
					exclude_regexps_array.push( new_regex );
				} else{
					return_error = new Error(`"element" type is not a RegExp nor a string.`);
					throw return_error;
				}
			} catch(error){
				return_error = new Error(`For loop index ${i} in "exclude": ${error}`);
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
				for_loop_errors.push(return_error);
			}
		}
	}
	if( for_loop_errors === [] ){
		for( const source of SourcesObject.sources ){
			var function_return = include_regexps_array.every( (regex) => {
				return source.name.match( regex );
			} );
			if( function_return === true ){
				function_return = exclude_regexps_array.some( (regex) => {
					return source.name.match( regex );
				} );
				if( function_return === false ){
					reduced_sources_array.push( source );
				}
			}
		}
		_return = reduced_sources_array;
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}
/**
### getSourceObject
> Gets the source object via its name or an alias.

Parametres:
| name | type | description |
| --- | --- | --- |
| identifier | {String} | The name or alias to lookup the source record for.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {Object} | The source object. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |
| 'ERR_INVALID_ARG_VALUE' | {Error} | Thrown if the given `identifier` cannot be found in the `SourcesObject`. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
function getSourceObject( identifier, options = {} ){
	var arguments_array = Array.from(arguments);
	var _return = null;
	var return_error;
	const FUNCTION_NAME = 'getSourceObject';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var sources_array = [];
	//Parametre checks
	if( typeof(identifier) !== 'string' ){
		return_error = new TypeError('Param "identifier" is not String.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is not ?Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( SourcesObject.sources[indentifier] != undefined ){
		_return = SourcesObject.sources[identifier];
	} else{
		sources_array = Object.values( SourcesObject.sources );
		for( var i = 0; i < sources_array.length; i++ ){
			if( Array.isArray(sources_array[i].aliases) === true && sources_array[i].aliases != null ){
				for( var j = 0; j < sources_array[i].aliases.length; j++ ){
					if( identifier === sources_array[i].aliases[j] ){
						_return = sources_array[i];
						j = sources_array[i].aliases.length;
						i = sources_array.length;
					}
				}
			}
		}
		if( _return == null ){
			return_error = new Error(`No source could be found with the identifier (${indentifier}) as its name or an alias.`);
			return_error.code = 'ERR_INVALID_ARG_VALUE';
			throw return_error;
		}
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}
/**
### setSourceObject
> Sets the value for the given source object. If the name property already exists, then the record will be overwritten.

Parametres:
| name | type | description |
| --- | --- | --- |
| source_object | {Object} | The source object to add or update. Must be a valid [`SourceObject`](./Resources/schema/source-object.schema.json).  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |
| 'ERR_INVALID_ARG_VALUE' | {Error} | Thrown if the given argument isn't a valid `SourceObject`. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
function setSourceObject( source_object, options = {} ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'setSourceObject';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	//Parametre checks
	if( typeof(source_object) !== 'object' ){
		return_error = new TypeError('Param "source_object" is not Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is not ?Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( ValidationFunctionsObject['source-object']( source_object ) === true ){
		SourcesObject.sources[source_object.name] = source_object;
	} else{
		return_error = new Error('Param "source_object" is not a valid `SourceObject`');
		return_error.code = 'ERR_INVALID_ARG_VALUE';
		throw return_error;
	}
}
/**
### createBackup (Async)
> Creates a new backup with a given source identifier, either a `name` or an `alias`, a path subsection, and an optional message.

Parametres:
| name | type | description |
| --- | --- | --- |
| identifier | {string} | The identifier for the source to backup.  |
| path | {string} | The path subsection to backup. \[default: data\] |
| message | {string} |  \[default: ''\] |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {Object} | The freshly created `BackupObject`. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |
| 'ERR_INVALID_ARG_VALUE' | {Error} | Thrown if the identifier is null or doesn't match a valid source. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
async function createBackup( identifier, path = 'data', message = '', options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'createBackup';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var datetime = new Date();
	var backup_object = {
		uid: NanoID.nanoid(),
		date: datetime.toISOString(),
		message: '',
		source: '',
		subpath: '',
		files: {}
	};
	var source_object = {};
	var paths_object = {};
	var normalised_path = '';
	var include_paths = [];
	var base_destination_path = '';
	//var exclude_paths = [];
	//Parametre checks
	if( typeof(identifier) !== 'string' ){
		return_error = new TypeError('Param "identifier" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(path) !== 'string' ){
		return_error = new TypeError('Param "path" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(message) !== 'string' ){
		return_error = new TypeError('Param "message" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is not ?Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( identifier != null ){
		try{
			source_object = getSourceObject( identifier, options );
		} catch(error){
			return_error = new Error(`getSourceObject threw an error: ${error}`);
			throw return_error;
		}
		if( ValidationFunctionsObject['source-object']( source_object ) === true ){
			if( source_object.paths[path] != undefined && typeof(source_object.paths[path]) === 'object' ){
				paths_object = source_object.paths[path];
				backup_object.source = source_object.name;
				backup_object.subpath = path;
				backup_object.message = message;
				try{
					base_destination_path = Path.join( EnvironmentPaths.data, 'BACKUPS', source_object.name, path, backup_object.uid );
				} catch(error){
					return_error = new Error(`Path.join threw an error: ${error}`);
					throw return_error;
				}
				for( var include_path of paths_object.include ){
					try{
						normalised_path = Path.posix.normalize( include_path );
						include_paths.push( normalised_path );
					} catch(error){
						return_error = new Error(`For path: "${include_path}" Path.posix.normalize threw an error: ${error}`);
						//throw return_error;
					}
				}
				for( var exclude_path of paths_object.exclude ){
					try{
						normalised_path = Path.posix.normalize( exclude_path );
						include_paths.push( '!' + normalised_path );
					} catch(error){
						return_error = new Error(`For path: "${exclude_path}" Path.posix.normalize threw an error: ${error}`);
						//throw return_error;
					}
				}
				for await (matched_path of Globby.stream( include_paths, { onlyFiles: true, absolute: true } )){
					var sha256_buffer_promise = null;
					sha256_buffer_promise = sha256BufferFromFilePath( matched_path );
					sha256_buffer_promise.then( (sha256_buffer) => {
						var base64_string = '';
						var destination_path = '';
						var cp_file_promise = null;
						try{
							base64_string = base64URLStringFromBuffer( sha256_buffer );
						} catch(error){
							return_error = new Error(`base64URLStringFromBuffer threw an error: ${error}`);
							throw return_error;
						}
						try{
							destination_path = Path.join( base_destination_path, base64_string );
						} catch(error){
							return_error = new Error(`Path.join threw an error: ${error}`);
							throw return_error;
						}
						cp_file_promise = CPFile( matched_path, destination_path );
						cp_file_promise.then( () => {
							backup_object.files[base64_string] = matched_path;
						}, (error) => /* istanbul ignore next */ {
							return_error = new Error(`Failed to copy "${matched_path}" to "${destination_path}"; CPFile threw an error: ${error}`);
							Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
							throw return_error;
						} );
					}, (error) => /* istanbul ignore next */ {
						return_error = new Error(`sha256BufferFromFilePath threw an error: ${error}`);
						Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
						throw return_error;
					} );
				} //for of
				BackupsObject[identifier][path].push( backup_object );
			} else{
				return_error = new Error(`No recognised path subsection "${path}" in the source object: ${source_object}`);
				throw return_error;
			}
		} else{
			return_error = new Error(`Obtained SourceObject is not valid: ${source_object}`);
			return_error.code = 'ERR_INVALID_ARG_VALUE';
			throw return_error;
		}
	} else{
		return_error = new Error('Param "identifier" is null.');
		return_error.code = 'ERR_INVALID_ARG_VALUE';
		throw return_error;
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}

//# Exports and Execution
if(require.main === module){
	( async () => {
		var sha256_buffer = await sha256BufferFromFilePath( 'test/input/a' );
		var base64url_string = base64URLStringFromBuffer( sha256_buffer );
		console.log(`test/input/a: ${base64url_string}`);
		sha256_buffer = await sha256BufferFromFilePath( 'test/input/b/c' );
		base64url_string = base64URLStringFromBuffer( sha256_buffer );
		console.log(`test/input/b/c: ${base64url_string}`);
		sha256_buffer = await sha256BufferFromFilePath( 'test/input/b/d' );
		base64url_string = base64URLStringFromBuffer( sha256_buffer );
		console.log(`test/input/b/d: ${base64url_string}`);
	} )();
} else{
	exports.loadSchemaFunctions = loadSchemaFunctions;
	exports.setLogger = setLogger;
	exports.setConfigObject = setConfigObject;
	exports.setEnvironmentPaths = setEnvironmentPaths;
	exports.setSourcesObject = setSourcesObject;
	exports.setBackupsObject = setBackupsObject;
	exports.sha256BufferFromFilePath = sha256BufferFromFilePath;
	exports.getSourceObject = getSourceObject;
	exports.setSourceObject = setSourceObject;
	exports.listSources = listSources;
}
