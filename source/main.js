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
		SaveSaver.setPathsObject( await paths_object_promise );
	} catch(error){
		return_error = new Error(`SaveSaver.setPathsObject threw an error: ${error}`);
		throw return_error;
	}
	try{
		SaveSaver.setBackupsObject( await backups_object_promise );
	} catch(error){
		return_error = new Error(`SaveSaver.setBackupsObject threw an error: ${error}`);
		throw return_error;
	}
}
/**
### CLI_Command_Help (Async)
> Implements the `help` subcommand.

Parametres:
| name | type | description |
| --- | --- | --- |
| command_options | {Object} | The options specific to the subcommand. \[default: {}\] |
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
async function CLI_Command_Help( command_options = {}, options = {} ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'CLI_Command_Help';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	//Parametre checks
	if( typeof(command_options) !== 'object' ){
		return_error = new TypeError('Param "command_options" is not an Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is not an Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	for( var i = 0; i < command_options.subcommand.length; i++ ){
		if( command_options.subcommand[i] === CLIDefinitions
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
		//###External
		const ApplicationLogWinstonInterface = require('application-log-winston-interface');
		const EnvPaths = require('env-paths');
		const CommandLineCommands = require('command-line-commands');
		const CommandLineArgs = require('command-line-args');
		const CommandLineUsage = require('command-line-usage');
	//Constants
	//EnvironmentPaths = EnvPaths( PROCESS_NAME );
	/* istanbul ignore next */
	if( global_options.help === true ){
		const help_sections_array = [
			{
				header: 'save-saver',
				content: 'Simply backup and restore save data and configuration files for your games.',
			},
			{
				header: 'Commands',
				content: commands_array
			},
			{
				header: 'Global Options',
				optionList: CLIDefinitions[0].options
			}
		]
		const help_message = CommandLineUsage(help_sections_array);
		console.log(help_message);
		quick_exit = true;
	}
	/* istanbul ignore next */
	if( global_options.config === true ){
		console.log('Paths: ', EnvironmentPaths);
		console.log('Config file path: ', config_path);
		console.log('Config; ', ConfigObject);
		quick_exit = true;
	}
	if( quick_exit === false || global_options['no-quick-exit'] === true ){
		/* istanbul ignore next */
		//##### Commands
		main_Async( global_options );
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'End of execution block.'});
} else{
	exports.setLogger = setLogger;
}
