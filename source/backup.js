#!/usr/local/bin/node
'use strict';
/**
# [backup.js](source/backup.js)
> The class definition for a single `backup-object`.

Internal module name: `SaveSaver_Backup`

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
	//## External
	const MakeDir = require('make-dir');
	const CPFile = require('cp-file');
	const EnvPaths = require('env-paths');
//# Constants
const FILENAME = 'backup.js';
const MODULE_NAME = 'SaveSaver_Backup';
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
const DefaultLogger = { 
	log: () => {
		return null;
	}
};
var Logger = DefaultLogger;
const DefaultEnvironmentPaths = EnvPaths( PROCESS_NAME );
var EnvironmentPaths = DefaultEnvironmentPaths;
const DefaultConfigObject = {
	validation_function: () => {
		return true;
	},
	backups_path: Path.join( EnvironmentPaths.data, 'Backups' )
};
var ConfigObject = DefaultConfigObject
/**
## Functions
*/
/**
### init
> A function to initialise or reset this whole module instance. If only one argument is passed, it is assumed to be a single "options" object with each of the following parametres as properties; for example: 

```js
{
	logger: <logger object>,
	environment_paths: <envpaths object>,
	config: <configuration object>
}
```

Parametres:
| name | type | description |
| --- | --- | --- |
| logger | {Object} | The [`winston`-style](https://github.com/winstonjs/winston) logger object to use in this module. \[default: {}\] |
| environment_paths | {Object} | The [`env-paths`-style](https://github.com/sindresorhus/env-paths) object to use as the default base for paths. \[default: {}\] |
| config | {Object} | An object containing any specific config overrides \(see [config section](#Config)\) for this module. \[default: {}\] |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
function init( logger = {}, environment_paths = {}, config = {} ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'init';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	//Parametre checks
	if( typeof(logger) !== 'object' ){
		return_error = new TypeError('Param "logger" is not Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(environment_paths) !== 'object' ){
		return_error = new TypeError('Param "environment_paths" is not Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(config) !== 'object' ){
		return_error = new TypeError('Param "config" is not Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( logger != {} ){
		try{
			setLogger( logger );
		} catch(error){
			return_error = new Error(`setLogger threw an error: ${error}`);
			throw return_error;
		}
	}
	if(  environment_paths != {} ){
		try{
			setEnvironmentPaths( environment_paths );
		} catch(error){
			return_error = new Error(`setEnvironmentPaths threw an error: ${error}`);
			throw return_error;
		}
	}
	if( config != {} ){
		try{
			setConfigObject( config );
		} catch(error){
			return_error = new Error(`setConfigObject threw an error: ${error}`);
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
	if( typeof(logger) !== 'object' ){
		return_error = new TypeError('Param "logger" is not an object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( logger != null ){
		Logger = logger;
	} else{
		Logger = DefaultLogger;
	}
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
		ConfigObject = DefaultConfigObject;
	}
}
/**
### setEnvironmentPaths
> Sets the environment paths (standard directories for data, config, et cetera) for this module to use.

Parametres:
| name | type | description |
| --- | --- | --- |
| environment_paths | {Object} | An object, such as the one returned by [`env-paths`](https://github.com/sindresorhus/env-paths), with the paths for the properties: `data`, `config`, `log`, `cache`, and `temp`.  |

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
		EnvironmentPaths = DefaultEnvironmentPaths;
	}
}

function Backup( backup_object ){
	this.uid = '';
	this.date = '';
	this.message = '';
	this.source = '';
	this.subpath = '';
	this.files = {};
}
//Dynamic Methods
Backup.prototype.fromObject = function( backup_object, options = { validation_function: () => { return true } } ){
	var return_error = null;
	var validation_function;
	if( typeof(backup_object) !== 'object' || backup_object == null ){
		return_error = new Error('Param "backup_object" is either `null` or not an object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( options.validation_function != null ){
		validation_function = options.validation_function;
	} else{
		validation_function = ConfigObject.validation_function;
	}
	if( validation_function( backup_object ) === true ){
		this.uid = backup_object.uid;
		this.date = backup_object.date;
		this.message = backup_object.message;
		this.source = backup_object.source;
		this.subpath = backup_object.subpath;
		this.files = backup_object.files;
	} else{
		return_error = new Error('Param "backup_object" is not a valid `backup-object`.');
		return_error.code = 'ERR_INVALID_ARG_VALUE';
		throw return_error;
	}
}
Backup.prototype.backup = async function( options = { output_path: './test/output/', error_handler: null } ){
	const FUNCTION_NAME = 'Backup.prototype.backup';
	var return_error = null;
	var directory_path = '';
	try{
		directory_path = Path.join( options.output_path, this.source );
	} catch(error){
		return_error = new Error(`Path.join threw an error: ${error}`);
		throw return_error;
	}
	var makedir_promise = MakeDir( directory_path );
	var return_promise = makedir_promise.then(
		(path) => {
			var keys = Object.keys( this.files );
			var target_path = '';
			var cpfile_promises = [];
			var cpfile_promise = null;
			var source_path = '';
			for( var key of keys ){
				try{
					target_path = Path.join( path, key );
				} catch(error){
					return_error = new Error(`Path.join threw an error: ${error}`);
					throw return_error;
				}
				if( typeof(this.files[key]) === 'string' ){
					source_path = this.files[key];
				} else if( Array.isArray(this.files[key]) === true ){
					source_path = this.files[key][0];
				} else /* istanbul ignore next */{
					//error
				}
				cpfile_promise = CPFile( source_path, target_path, { overwrite: false } ).then( 
					() => {
						Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: `File: '${this.files[key]}' copied to: '${target_path}' successfully.`});
					},
					(error) => {
						return_error = new Error(`CPFile threw an error: ${error}`);
						Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
					}
				);
				cpfile_promises.push( cpfile_promise );
			}
			return Promise.all(cpfile_promises);
		},
		(error) => {
			return_error = new Error(`MakeDir threw an error: ${error}`);
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
		}
	);
	return return_promise;
}
/**
### Backup.prototype.restore
> Restores the backup.

Parametres:
| name | type | description |
| --- | --- | --- |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Returns:
| type | description |
| --- | --- |
| {Promise} | A promise that is the combined result (`Promise.all()`) of all of the invoke CPFile promises. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
Backup.prototype.restore = async function( options = {} ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'Backup.prototype.restore';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var backups_path = ConfigObject.backups_path;
	var files_directory = '';
	var keys = [];
	var source_path = '';
	var cpfile_promise = null;
	var cpfile_promises = [];
	//Parametre checks
	if( typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is not ?Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( typeof(options.backups_path) === 'string' && options.backups_path != null ){
		backups_path = options.backups_path;
	}
	try{
		files_directory = Path.join( backups_path, this.source );
	} catch(error){
		return_error = new Error(`Path.join threw an error: ${error}`);
		throw return_error;
	}
	keys = Object.keys(this.files);
	for( var key of keys ){
		try{
			source_path = Path.join( files_directory, key );
		} catch(error){
			return_error = new Error(`Path.join threw an error: ${error}`);
			throw return_error;
		}
		if( Array.isArray(this.files[key]) === true ){
			for( var destination_path of this.files[key] ){
				cpfile_promise = CPFile( source_path, destination_path );
				cpfile_promises.push( cpfile_promise );
			}
		} else if( typeof(this.files[key]) === 'string' ){
			cpfile_promise = CPFile( source_path, this.files[key] );
			cpfile_promises.push( cpfile_promise );
		}
	}
	//Return
	return Promise.all( cpfile_promises );
}

//# Exports and Execution
if(require.main === module){
	//Inline test
	( async () => {
		var new_backup = new Backup();
		new_backup.fromObject( { 
			uid: '012345678901234567890',
			date: '2000-12-30T23:59:59.999Z',
			message: 'Test Backup.',
			source: 'whatever',
			subpath: 'q',
			files: {
				'Q1WkaxnTSNwvV8BG-O9j1FOOu5NgAPPJ7pVKJ0YN2GU=': [
					'./test/input/a',
					'./test/input/b/c',
					'./test/input/b/d'
				]
			}
		} );
		await new_backup.backup();
		await new_backup.restore( { backups_path: './test/output' } );
	} )();
} else{
	exports.setLogger = setLogger;
	exports.setConfigObject = setConfigObject;
	exports.setEnvironmentPaths = setEnvironmnetPaths;
}
