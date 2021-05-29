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
var PathsObject = {};
var BackupsObject = {};
var ValidationFunctionsObject = {
	'source-object': null
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
	var file_path = '';
	//var file_string = '';
	var schema_json = {};
	var ajv = new AJV();
	//Parametre checks
	if( typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is not ?Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	try{
		file_path = Path.join( 'Resources', 'schema', 'source-object.schema.json' );
	} catch(error){
		return_error = new Error(`Path.join threw an error: ${error}`);
		throw return_error;
	}
	/*try{
		file_string = FileSystem.readFileSync( file_path, 'utf8' );
	} catch(error){
		return_error = new Error(`FileSystem.readFileSync threw an error: ${error}`);
		throw return_error;
	}*/
	try{
		schema_json = require( file_path );
	} catch(error){
		return_error = new Error(`require threw an error: ${error}`);
		throw return_error;
	}
	try{
		ValidationFunctionsObject['source-object'] = ajv.compile( schema_json );
	} catch(error){
		return_error = new Error(`ajv.compile threw an error: ${error}`);
		throw return_error;
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
### setSourcePathsObject
> Sets the object for the `Paths.json` file containing all of the source entries.

Parametres:
| name | type | description |
| --- | --- | --- |
| paths_object | {Object} | The object to be used as the `Paths` object.  |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
function setSourcePathsObject( paths_object ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'setSourcePathsObject';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	//Parametre checks
	if( typeof(paths_object) !== 'object' ){
		return_error = new TypeError('Param "paths_object" is not Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	PathsObject = paths_object;
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
### sha256BufferFromFilePath
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
	var _return;
	var return_error;
	const FUNCTION_NAME = 'sha256BufferFromFilePath';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
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
			try{
				file_handle.read( read_buffer, 0, (file_stats.size - offset), offset );
			} catch(error)/* istanbul ignore next */{
				return_error = new Error(`file_handle.read threw an error: ${error}`);
				throw return_error;
			}
			try{
				new_buffer = Buffer.from( read_buffer.buffer, 0, (file_stats.size - offset) );
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
| 'ERR_INVALID_ARG_VALUE' | {Error} | Thrown if the given `identifier` cannot be found in the `PathsObject`. |

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
	if( PathsObject.sources[indentifier] != undefined ){
		_return = PathsObject.sources[identifier];
	} else{
		sources_array = Object.values( PathsObject.sources );
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
		PathsObject.sources[source_object.name] = source_object;
	} else{
		return_error = new Error('Param "source_object" is not a valid `SourceObject`');
		return_error.code = 'ERR_INVALID_ARG_VALUE';
		throw return_error;
	}
}
/**
### createBackup
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

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
function createBackup( identifier, path = 'data', message = '', options = {} ){
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

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}

//# Exports and Execution
if(require.main === module){
} else{
	exports.setLogger = setLogger;
	exports.setConfigObject = setConfigObject;
	exports.setEnvironmentPaths = setEnvironmentPaths;
	exports.setSourcePathsObject = setSourcePathsObject;
	exports.setBackupsObject = setBackupsObject;
	exports.sha256BufferFromFilePath = sha256BufferFromFilePath;
	exports.getSourceObject = getSourceObject;
	exports.setSourceObject = setSourceObject;
}
