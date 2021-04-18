#!/usr/local/bin/node
'use strict';
/**
# [save-saver.js](source/save-saver.js)
> Simply backup and restore save data and configuration files for your games.

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

//#Dependencies
	//##Internal
	//##Standard
	const FileSystem = require('fs');
	const Path = require('path');
	//##External
	const MakeDir = require('make-dir');
	const HJSON = require('hjson');
	const ParseJSON = require('parse-json');
	const Inquirer = require('inquirer');
	const Globby = require('globby');
	const NanoID = require('nanoid');
	//const GetStream = require('get-stream');
//#Constants
const FILENAME = 'save-saver.js';
const MODULE_NAME = 'SaveSaver';
var PACKAGE_JSON = {};
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'save-saver';
} else{
	PROCESS_NAME = process.argv0;
}
const CLIDefinitions: [];
//##Errors

//#Global Variables
/* istanbul ignore next */
var Logger = { 
	log: () => {
		return null;
	}
};
var EnvironmentPaths = {};
var ConfigObject = {
	paths_object_path: '',
	backups_object_path: '',
	hash_function_string: 'sha256',
	compression_string: 'lz'
};
var PathsObject = {};
var BackupsObject = {};
//#Functions
/**
## Functions
*/
/**
### setLogger
> Allows this module's functions to log the given logger object.

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
		return_error = new TypeError('Param "config_object" is not ?Object.');
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
		return_error = new TypeError('Param "environment_paths" is not Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( environment_paths != null ){
		EnvironmentPaths = environmnet_paths;
	} else{
		return_error = new Error('Param `environment_paths` is `null`.');
		return_error.code = 'ERR_INVALID_ARG_VALUE';
		throw return_error;
	}
}
/**
### loadConfigFile (Private)
> Loads the config file. This function is private and should only be called once from the main execution block.

Parametres:
| name | type | description |
| --- | --- | --- |
| config_filepath | {?string} | Optionally specify a runtime-specific config file to load instead of the default. \[default: \] |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

History:
| version | change |
| --- | --- |
| 0.0.0 | Introduced |
*/
function loadConfigFile( config_filepath = '' ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'loadConfigFile';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var config_file_string = '';
	var config_file_path = '';
	var config_object = {};
	//Parametre checks
	if( typeof(config_filepath) !== 'string' ){
		return_error = new TypeError('Param "config_filepath" is not a string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( config_filepath !== '' ){
		try{
			config_file_string = FileSystem.readFileSync( config_flepath, 'utf8' ).replace( /\r\n/g, '\n' );
		} catch(error){
			return_error = new Error(`FileSystem.readFileSync threw an error: ${error}`);
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: return_error});
			throw return_error;
		}
	} else{
		try{
			config_file_path = Path.join( EnvironmentPaths.config, 'config.hjson' );
			try{
				config_file_string = FileSystem.readFileSync( config_file_path, 'utf8' );
			} catch(error){
				if( error instanceof SystemError && error.code === 'ENOENT' ){
					//Create a new config file.
					try{
						setConfigObject( null );
						try{
							config_file_string = JSON.stringify( ConfigObject, null, '\t' );
							try{
								MakeDir.sync( EnvironmentPaths.config );
								try{
									FileSystem.writeFileSync( config_file_path, config_file_string, 'utf8' );
								} catch(error)/* istanbul ignore next */{
									return_error = new Error(`FileSystem.writeFileSync threw an error: ${error}`);
									Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
									throw return_error;
								}
							} catch(error){
								return_error = new Error(`MakeDir.sync threw an error: ${error}`);
								Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
								throw return_error;
							}
						} catch(error)/* istanbul ignore next */{
							return_error = new Error(`JSON.stringify threw an error: ${error}`);
							Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
							throw return_error;
						}
					} catch(error)/* istanbul ignore next */{
						return_error = new Error(`setConfigObject threw an error: ${error}`);
						Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
						throw return_error;
					}
				} else/* istanbul ignore next */{
					return_error = new Error(`FileSystem.readFileSync threw an error: ${error}`);
					Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error)});
					throw return_error;
				}
			}
		} catch(error){
			return_error = new Error(`Path.join threw an error: ${error}`);
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
			throw return_error;
		}
	}
	try{
		config_object = HJSON.parse( config_file_string );
		try{
			setConfigObject( config_object );
		} catch(error){
			return_error = new Error(`setConfigObject threw an error: ${error}`);
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
			throw return_error;
		}
	} catch(error){
		return_error = new Error(`HJSON.parse threw an error: ${error}`);
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
		throw return_error;
	}
}
/**
### loadConfigObjectFromPath
> Loads the config object from the given path.

Parametres:
| name | type | description |
| --- | --- | --- |
| config_filepath | {String} | The path of the config file to load.  |
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
function loadConfigObjectFromPath( config_filepath, options = {} ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'loadConfigObjectFromPath';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var config_file_string = '';
	var parse_object = {};
	//Parametre checks
	if( typeof(config_filepath) !== 'string' ){
		return_error = new TypeError('Param "config_filepath" is not String.');
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
		config_file_string = FileSystem.readFileSync( config_filepath, 'utf8' ).replace( /\r\n/g, '\n' );
	} catch(error){
		return_error = new Error(`FileSystem.readFileSync threw an error: ${error}`);
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: return_error});
		if( (error instanceof SystemError) && (error.code === 'ENOENT') ){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: 'No config file found; attempting to create a new one.'});
		} else{
			return_error = new Error(`FileSystem.readFileSync threw an unrecoverable error: ${error}`);
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'crit', message: return_error});
			throw return_error;
		}
		//throw return_error;
	}
	if( config_file_string !== '' ){
		try{
			parsed_object = HJSON.parse( config_file_string );
		} catch(error){
			return_error = new Error(`HJSON.parse threw an error: ${error}`);
			throw return_error;
		}
	}
}
/**
### loadPersistentDataObjects_Async (private)
> Loads any existing data to the global `PathsObject` and `BackupsObject`. Not exported and should never be manually called.

Parametres:
| name | type | description |
| --- | --- | --- |
| data_path | {String} | The path to search for the `Paths.json` and `Backups.json` files in if not overridden by the runtime options.  |
| options | {?Object} | Additional run-time options. Paths can be overridden from command-line/config options. \[default: {}\] |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
async function loadPersistentDataObjects_Async( data_path, options = {} ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'loadPersistentDataObjects_Async';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var paths_object_path = '';
	var backups_object_path = '';
	//var paths_json_string_promise = null;
	//var backups_json_string_promise = null;
	var paths_object_promise = null;
	var backups_object_promise = null;
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
	//Parametre checks
	if( typeof(data_path) !== 'string' ){
		return_error = new TypeError('Param "data_path" is not String.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is not ?Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( options['override-paths-object-path'] != null ){
		paths_object_path = options['override-paths-object-path'];
	} else{
		try{
			paths_object_path = Path.join( EnvironmentPaths.data, 'Paths.json' );
		} catch(error){
			return_error = new Error(`Path.join threw an error: ${error}`);
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `${return_error}`});
			throw return_error;
		}
	}
	if( paths_object_path !== '' ){
		try{
			FileSystem.accessSync( paths_object_path );
			try{
				paths_object_promise = FileSystem.promises.readFile( paths_object_path, 'utf8' ).then( eol_fix_function ).then( parse_json_function );
			} catch(error){
				return_error = new Error(`FileSystem.promises.readFile threw an error: ${error}`);
				throw return_error;
			}
		} catch(error){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: `FileSystem.accessSync threw an error: ${error}`});
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: '`Paths.json` does not exist; attempting to create one.'});
			paths_object_promise = Promise.resolve( {} );
		}
	}
	if( options['override-backups-object-path'] != null ){
		backups_object_path = options['override-backups-object-path'];
	} else{
		try{
			backups_object_path = Path.join( EnvironmentPaths.data, 'Backups.json' );
		} catch(error){
			return_error = new Error(`Path.join threw an error: ${error}`);
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `${return_error}`});
			throw return_error;
		}
	}
	if( backups_object_path !== '' ){
		try{
			FileSystem.accessSync( backups_object_path );
			try{
				backups_object_promise = FileSystem.promises.readFile( backups_object_path, 'utf8' ).then( eol_fix_function ).then( parse_json_function );
			} catch(error){
				return_error = new Error(`FileSystem.promises.readFile threw an error: ${error}`);
				throw return_error;
			}
		} catch(error){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: `FileSystem.accessSync threw an error: ${error}`});
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: '`Backups.json` does not exist; attempting to create one.'});
			backups_object_promise = Promise.resolve( {} );
		}
	}

	try{
		PathsObject = await paths_object_promise;
	} catch(error){
		return_error = new Error(`await paths_object_promise threw an error: ${error}`);
		throw return_error;
	}
	try{
		BackupsObject = await backups_object_promise;
	} catch(error){
		return_error = new Error(`await backups_object_promise threw an error: ${error}`);
		throw return_error;
	}
}
/**
### main_Async (private)
> The main function when the script is run as an executable. Not exported and should never be manually called.

Parametres:
| name | type | description |
| --- | --- | --- |
| options | {?options} | An object representing the command-line options. \[default: {}\] |

Status:
| version | change |
| --- | --- |
| 0.0.1 | Introduced |
*/
/* istanbul ignore next */
async function main_Async( options = {} ){
	var arguments_array = Array.from(arguments);
	var return_error = null;
	const FUNCTION_NAME = 'main_Async';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var input_string = '';
	var output_string = '';
	//Parametre checks
	//Function
	try{
		await loadPersistentDataObjects_Async( EnvironmentPaths.data, options );
	} catch(error){
		return_error = new Error(`await loadPersistentDataObjects_Async threw an error: ${error}`);
		//throw return_error;
	}
	///Input
	/*if( options.stdin === true ){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: 'Reading input from STDIN.'});
		try{
			input_string = await GetStream( process.stdin, 'utf8' );
		} catch(error){
			return_error = new Error(`GetStream threw an error: ${error}`);
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
		}
	} else if( options.input != null ){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: 'Reading input from a file.'});
		if( typeof(options.input) === 'string' ){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `options.input: '${options.input}'`});
			try{
				input_string = FileSystem.readFileSync( options.input, 'utf8' );
			} catch(error){
				return_error = new Error(`FileSystem.readFileSync threw an error: ${error}`);
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
			}
		} else{
			return_error = new Error('"options.input" is not a string.');
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
		}
	} else{
		return_error = new Error('No input options specified.');
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
	}*/
	///Transform
	if( return_error === null ){
		if( input_string !== '' && typeof(input_string) === 'string' ){
		} else{
			return_error = new Error('input_string is either null or not a string.');
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
		}
	}
	///Output
	if( return_error === null ){
		if( output_string !== '' && typeof(output_string) === 'string' ){
			if( options.output != null && typeof(output_string) === 'string' ){
				try{
					FileSystem.writeFileSync( options.output, output_string, 'utf8' );
				} catch(error){
					return_error = new Error(`FileSystem.writeFileSync threw an error: ${error}`);
					Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
				}
			} else{
				if( options.stdout !== true ){
					Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: 'No output options specified; defaulting to STDOUT.'});
				}
				console.log(output_string);
			}
		} else{
			return_error = new Error('"output_string" is either null or not a string.');
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
		}
	}

	//Return
	if( return_error !== null ){
		process.exitCode = 1;
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'crit', message: return_error.message});
	}
}
//#Exports and Execution
if(require.main === module){
	var _return = [1,null];
	var return_error = null;
	const FUNCTION_NAME = 'MainExecutionFunction';
	//##Dependencies
		//###Internal
		//###Standard
		const Path = require('path');
		//###External
		const MakeDir = require('make-dir');
		const ApplicationLogWinstonInterface = require('application-log-winston-interface');
		const EnvPaths = require('env-paths');
		const HJSON = require('hjson');
		const CommandLineCommands = require('command-line-commands');
		const CommandLineArgs = require('command-line-args');
		const CommandLineUsage = require('command-line-usage');
	//Constants
	//EnvironmentPaths = EnvPaths( PROCESS_NAME );
	const CLIDefintions = [
		{ name: null, options: [
			//UI
			{ name: 'help', alias: 'h', type: Boolean, description: 'Writes this help text to STDOUT.' },
			{ name: 'noop', alias: 'n', type: Boolean, description: '[Reserved] Show what would be done without actually doing it.' },
			{ name: 'verbose', alias: 'v', type: Boolean, description: 'Verbose output to STDERR.' },
			{ name: 'version', alias: 'V', type: Boolean, description: 'Writes version information to STDOUT.' },
			{ name: 'no-quick-exit', alias: 'x', type: Boolean, description: 'Don\'t immediately exit after printing help, version, and/or config information.' },
			/*//Input
			{ name: 'stdin', alias: 'i', type: Boolean, description: 'Read input from STDIN.' },
			{ name: 'input', alias: 'I', type: String, description: 'The path to the file to read input from.' },
			//Output
			{ name: 'stdout', alias: 'o', type: Boolean, description: 'Write output to STDOUT.' },
			{ name: 'output', alias: 'O', type: String, description: 'The name of the file to write output to.' },
			{ name: 'pasteboard', alias: 'p', type: Boolean, description: '[Reserved] Copy output to pasteboard (clipboard).' },*/
			//Config
			{ name: 'config', alias: 'c', type: Boolean, description: 'Print search paths and configuration values to STDOUT.' },
			{ name: 'config-file', alias: 'C', type: String, description: '[Resevred] Use the given config file instead of the default.' },
			//Low-Level
			{ name: 'override-paths-object-path', type: String, description: 'Specify a path to read the PathsObject from instead of the default. Takes precedent over `override-data-directory-path`.' },
			{ name: 'override-backups-object-path', type: String, description: 'Specify a path to read the BackupsObject from instead of the default. Takes precedent over `override-data-directory-path`.' },
			{ name: 'override-data-directory-path', type: String, description: 'Specify a directory to search for the PathsObject and BackupsObject files instead of the default.' }
		] },
		{ name: 'help', description: 'Writes a helpful synopsis for the given subcommand to STDOUT.', synopsis: '$ save-saver help <subcommand>', options: null },
		{ name: 'add-source', description: 'Adds a new source to the `Paths.json` index file.', synopsis: '$ save-saver add-source (options)', options: [
			{ name: 'force', alias: 'f', type: Boolean, description: 'Do not ask for comfirmation in the new source would overwrite an existing one.' },
			{ name: 'edit', alias: 'e', type: Boolean, description: 'Edit the source record in $EDITOR.' },
			{ name: 'name', alias: 'N', type: String, defaultOption: true, description: 'The name of the source as it will appear in `Paths.json`.' },
			{ name: 'alias', alias: 'A', type: String, multiple: true, description: 'An alias which can also be used to refer to the source. Can be specified multiple times.' },
			{ name: 'config', alias: 'C', type: String, description: 'A glob for the config files to backup.' },
			{ name: 'saves', alias: 'S', type: String, description: 'A glob for the save files to backup.' },
			{ name: 'data', alias: 'D', type: String, description: 'A glob for the data files to backup.' }
		] },
		{ name: 'list-sources', description: 'List the sources currently present in `Paths.json`.' synopsis: '$ save-saver list-sources (options)', options: [
			{ name: 'alias', alias: 'a', type: Boolean, description: 'Include aliases in the list.' }
		] },
		{ name: 'remove-source', description: 'Removes a source and its aliases from `Paths.json`.', synopsis: '$ save-saver remove-source (options) <sources...>', options: [
			{ name: 'force', alias: 'f', type: Boolean, description: 'Do not ask for comfirmation when deleting a source and its data.' },
			{ name: 'alias-only', alias: 'a', type: Boolean, description: 'Only remove aliases, leaving sources mainly intact.' },
			{ name: 'with-backups', alias: 'a', type: Boolean, description: 'Delete any existing backups belonging to the source aswell.' }
		] },
		{ name: 'backup', description: 'Creates a new backup for the given source.', synopsis: '$ save-saver backup (options) <source name> <subsource>', options: [
			{ name: 'message', alias: 'm', type: String, description: 'A message to associate with the backup.' }
			{ name: 'automatic', alias: 'a', type: Boolean, description: 'Automatically backup any sources that have been changed since the last run.' }
		] },
		{ name: 'list-backups', description: 'Lists the backups for the given source.', synopsis: '$ save-saver list-backups <source> (options)', options: [
			{ name: 'oldest', alias: 'o', type: Boolean, description: 'Invert the list order to show the oldest at the bottum.' },
			{ name: 'count', alias: 'C', type: Number, defaultValue: 10, description: 'Specifies how many backups to show in the resulting list. [Default: 10]' }
		] },
		'restore',
		'delete-backup'
	];
	//Variables
	var function_return = [1,null];
	var quick_exit = false;
	var config_path = '';
	var source_dirname = '';
	var parent_dirname = '';
	var package_path = '';
	var env_paths_object = {};
	var config_file_string = '';
	var config_file_path = '';
	var config_object = {};
	//Logger
	try{ 
		MakeDir.sync( EnvironmentPaths.log );
	} catch(error)/* istanbul ignore next */{
		console.error('MakeDir.sync threw: %s', error);
	}
	function_return = ApplicationLogWinstonInterface.InitLogger('debug.log', EnvironmentPaths.log);
	if( function_return[0] === 0 ){
		setLogger( function_return[1] );
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'Start of execution block.'});
	//Options
	var Options = CommandLineArgs( OptionDefinitions );
	//Config
	try{
		MakeDir.sync( EnvironmentPaths.data );
	} catch(error){
		return_error = new Error(`MakeDir.sync threw an error: ${error}`);
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `${return_error}`});
	}
	try{
		MakeDir.sync( EnvironmentPaths.config );
	} catch(error){
		return_error = new Error(`MakeDir.sync threw an error: ${error}`);
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `${return_error}`});
	}
	try{
		ConfigObject.paths_object_path = Path.join( EnvironmentPaths.data, 'Paths.json' );
	} catch(error){
		return_error = new Error(`Path.join threw an error: ${error}`);
		//throw return_error;
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
	}
	try{
		ConfigObject.backups_object_path = Path.join( EnvironmentPaths.data, 'Backups.json' );
	} catch(error){
		return_error = new Error(`Path.join threw an error: ${error}`);
		//throw return_error;
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
	}
	//Load config.json
	if( Options['config-file'] !== '' ){
		try{
			loadConfigObjectFromPath( Options['config-file'] );
		} catch(error){
			return_error = new Error(`loadConfigObjectFromPath threw an error: ${error}`);
			throw return_error;
		}
	} else{
		try{
			config_path = Path.join( EnvironmentPaths.config, 'config.hjson' );
		} catch(error){
			return_error = new Error(`Path.join threw an error: ${error}`);
			throw return_error;
		}
		try{
			loadConfigObjectFromPath( config_path );
		} catch(error){
			return_error = new Error(`loadConfigObjectFromPath threw an error: ${error}`);
			throw return_error;
		}
	}
	/* istanbul ignore next */
	if( Options.verbose === true ){
		Logger.real_transports.console_stderr.level = 'debug';
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: `Logger: console_stderr transport log level set to: ${Logger.real_transports.console_stderr.level}`});
	}
	///Load package.json
	try{
		source_dirname = Path.dirname( module.filename );
		package_path = Path.join( source_dirname, 'package.json' );
		PACKAGE_JSON = require(package_path);
	} catch(error){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `Soft error: ${error}`});
		try{
			parent_dirname = Path.dirname( source_dirname );
			package_path = Path.join( parent_dirname, 'package.json' );
			PACKAGE_JSON = require(package_path);
		} catch(error)/* istanbul ignore next */{
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `Soft error: ${error}`});
		}
	}
	//Main
	/* istanbul ignore next */
	if( Options.version === true ){
		console.log(PACKAGE_JSON.version);
		quick_exit = true;
	}
	/* istanbul ignore next */
	if( Options.help === true ){
//		{ name: 'help', usage: [
//			{
//				header: 'help',
//				content: 'Writes a helupful synopsis for the given subcommand to STDOUT.'
//			},
//			{
//				header: 'Synopsis',
//				content: '$ save-saver help <subcommand>'
//			}
//		]
//		},
		const help_sections_array = [
			{
				header: 'save-saver',
				content: 'Simply backup and restore save data and configuration files for your games.',
			},
			{
				header: 'Commands',
				content: []
			},
			{
				header: 'Options',
				optionList: OptionDefinitions
			}
		]
		const help_message = CommandLineUsage(help_sections_array);
		console.log(help_message);
		quick_exit = true;
	}
	/* istanbul ignore next */
	if( Options.config === true ){
		console.log('Paths: ', EnvironmentPaths);
		console.log('Config file path: ', config_path);
		console.log('Config; ', ConfigObject);
		quick_exit = true;
	}
	if( quick_exit === false || Options['no-quick-exit'] === true ){
		/* istanbul ignore next */
		main_Async( Options );
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'End of execution block.'});
} else{
	exports.setLogger = setLogger;
}
