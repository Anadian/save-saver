#!/usr/local/bin/node
'use strict';
/**
# [cli.js](source/cli.js)
> Implements the `save-saver` command-line interface.

Internal module name: `CLI`

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
	const SaveSaver = require('./lib.js');
	//## Standard
	const FileSystem = require('fs');
	const Path = require('path');
	//## External
	const MakeDir = require('make-dir');
	const EnvPaths = require('env-paths');
	const ApplicationLogWinstonInterface = require('application-log-winston-interface');
	const ParseJSON = require('parse-json');
	const HJSON = require('hjson');
	const CommandLineCommands = require('command-line-commands');
	const CommandLineArgs = require('command-line-args');
	const CommandLineUsage = require('command-line-usage');
	const Inquirer = require('inquirer');
//# Constants
const FILENAME = 'cli.js';
const MODULE_NAME = 'CLI';
var PACKAGE_JSON = {};
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'save-saver';
} else{
	PROCESS_NAME = process.argv0;
}
const CLIDefinitions = [
	{ name: null, description: 'Simply backup and restore save data and configuration files for your games.', synopsis: '$ save-saver [options]', options: [
		//UI
		{ name: 'help', alias: 'h', type: Boolean, description: 'Writes this help text to STDOUT.' },
		{ name: 'noop', alias: 'n', type: Boolean, description: '[Reserved] Show what would be done without actually doing it.' },
		{ name: 'verbose', alias: 'v', type: Boolean, description: 'Verbose output to STDERR.' },
		{ name: 'version', alias: 'V', type: Boolean, description: 'Writes version information to STDOUT.' },
		{ name: 'no-quick-exit', alias: 'x', type: Boolean, description: 'Don\'t immediately exit after printing help, version, and/or config information.' },
		//Config
		{ name: 'config', alias: 'c', type: Boolean, description: 'Print search paths and configuration values to STDOUT.' },
		{ name: 'config-file', alias: 'C', type: String, description: 'Use the given config file instead of the default.' },
		//Low-Level
		{ name: 'override-sources-json-path', type: String, description: 'Specify a path to read the SourcesJSON file from instead of the default. Takes precedent over `override-data-directory-path`.' },
		{ name: 'override-backups-json-path', type: String, description: 'Specify a path to read the BackupsJSON file from instead of the default. Takes precedent over `override-data-directory-path`.' },
		{ name: 'override-data-directory-path', type: String, description: 'Specify a directory to search for the PathsObject and BackupsObject files instead of the default.' }
	] },
	{ name: 'help', description: 'Writes a helpful synopsis for the given subcommand to STDOUT.', synopsis: '$ save-saver help <subcommand>', options: [
		{ name: 'subcommand', alias: 'S', type: String, multiple: true, defaultOption: true, description: 'The subcommand(s) to write help text for.' }
	], func: CLI_Command_Help },
	{ name: 'add-source', description: 'Adds a new source to the `Sources.json` index file.', synopsis: '$ save-saver add-source [options]', options: [
		{ name: 'force', alias: 'f', type: Boolean, description: 'Do not ask for comfirmation in the new source would overwrite an existing one.' },
		{ name: 'edit', alias: 'e', type: Boolean, description: 'Edit the source record in $EDITOR.' },
		{ name: 'name', alias: 'N', type: String, defaultOption: true, description: 'The name of the source as it will appear in `Paths.json`.' },
		{ name: 'alias', alias: 'A', type: String, multiple: true, description: 'An alias which can also be used to refer to the source. Can be specified multiple times.' },
		{ name: 'config', alias: 'C', type: String, description: 'A glob for the config files to backup.' },
		{ name: 'saves', alias: 'S', type: String, description: 'A glob for the save files to backup.' },
		{ name: 'data', alias: 'D', type: String, description: 'A glob for the data files to backup.' }
	], func: CLI_Command_AddSource },
	{ name: 'list-sources', description: 'List the sources currently present in `Sources.json`.', synopsis: '$ save-saver list-sources (options)', options: [
		//columns
		{ name: 'alias', alias: 'a', type: Boolean, description: 'Include aliases in the list.' },
		{ name: 'paths', alias: 'p', type: Boolean, description: 'Include paths in the list.' },
		//filters
		/*{ name: 'glob', alias: 'g', type: String, description: 'Only include sources matching the given glob in the list.' },
		{ name: 'regex', alias: 'r', type: String, description: 'Only include sources matching the given regex in the list.' },
		{ name: 'path', alias: 'P', type: String, description: 'Only include sources with a path matching the given string in the list.' },
		{ name: 'path-glob', alias: 'G', type: String, description: 'Only include sources with a path matching the given glob in the list.' },
		{ name: 'path-regex', alias: 'R', type: String, description: 'Only include sources with a path matching the given regex in the list.' },*/
		{ name: 'include-regex', alias: 'i', type: String, multiple: true, description: 'A regex to filter what sources will be included in the listing; may be specified multiple times: a source must match all of the given regexes.' },
		{ name: 'exclude-regex', alias: 'x', type: String, multiple: true, description: 'A regex to filter what sources will be included in the listing; may be specified multiple times and along side the `include-regex` option: a source must NOT match any of these regexes to be included.' },
		//format
		{ name: 'invert', alias: 'I', type: Boolean, description: 'Invert the order sources will be listed.' },
		{ name: 'json', alias: 'j', type: Boolean, description: 'Display the list as JSON instead of pretty printing.' }

	], func: CLI_Command_ListSources },
	{ name: 'remove-source', description: 'Removes a source and its aliases from `Sources.json`.', synopsis: '$ save-saver remove-source (options) <sources...>', options: [
		{ name: 'force', alias: 'f', type: Boolean, description: 'Do not ask for comfirmation when deleting a source and its data.' },
		{ name: 'alias-only', alias: 'a', type: Boolean, description: 'Only remove aliases, leaving sources mainly intact.' },
		{ name: 'with-backups', alias: 'a', type: Boolean, description: 'Delete any existing backups belonging to the source aswell.' }
	], func: null },//CLI_Command_RemoveSource },
	{ name: 'backup', description: 'Creates a new backup for the given source.', synopsis: '$ save-saver backup (options) <source name> <subsource>', options: [
		{ name: 'message', alias: 'm', type: String, description: 'A message to associate with the backup.' },
		{ name: 'automatic', alias: 'a', type: Boolean, description: 'Automatically backup any sources that have been changed since the last run.' }
	], func: null },//CLI_Command_Backup },
	{ name: 'list-backups', description: 'Lists the backups for the given source.', synopsis: '$ save-saver list-backups <source> (options)', options: [
		{ name: 'oldest', alias: 'o', type: Boolean, description: 'Invert the list order to show the oldest at the bottom.' },
		{ name: 'count', alias: 'C', type: Number, defaultValue: 10, description: 'Specifies how many backups to show in the resulting list. [Default: 10]' }
	], func: null },//CLI_Command_ListBackups },
	{ name: 'restore', description: 'Restores the backup with the given ID.', synposis: '$ save-saver restore <backup ID> (options)', options: [
		{ name: 'id', alias: 'I', type: String, defaultOption: true, description: 'The ID of the backup to be restored.' }
	], func: null },//CLI_Command_Restore },
	{ name: 'delete-backup', description: 'Deletes the backup with the given ID.', synopsis: '$ save-saver delete-backup <backup ID> (options)', options: [
		{ name: 'id', alias: 'I', type: String, defaultOption: true, description: 'The ID of the backup to be deleted.' }
	], func: null },//CLI_Command_DeleteBackup }
];
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
	if( typeof(config_filepath) === 'string' && config_filepath != '' ){
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
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: error});
				if( /*error instanceof SystemError &&*/ error.code === 'ENOENT' ){
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
					Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
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
### loadPersistentDataObjects_Async (private)
> Loads any existing data to the global `SourcesJSON` and `BackupsJSON`. Not exported and should never be manually called.

Parametres:
| name | type | description |
| --- | --- | --- |
| data_path | {String} | The path to search for the `Sources.json` and `Backups.json` files in if not overridden by the runtime options.  |
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
async function loadPersistentDataObjects_Async( data_path = EnvironmentPaths.data, options = {} ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'loadPersistentDataObjects_Async';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var sources_json_path = '';
	var backups_json_path = '';
	//var paths_json_string_promise = null;
	//var backups_json_string_promise = null;
	var sources_json_promise = null;
	var backups_json_promise = null;
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
	if( options['override-data-directory-path'] != null && typeof(options['override-data-directory-path']) === 'string' ){
		data_path = options['override-data-directory-path'];
	}
	if( options['override-sources-json-path'] != null ){
		sources_json_path = options['override-sources-json-path'];
	} else{
		try{
			sources_json_path = Path.join( data_path, 'Sources.json' );
		} catch(error){
			return_error = new Error(`Path.join threw an error: ${error}`);
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `${return_error}`});
			throw return_error;
		}
	}
	if( sources_json_path !== '' ){
		try{
			FileSystem.accessSync( sources_json_path );
			try{
				sources_json_promise = FileSystem.promises.readFile( sources_json_path, 'utf8' ).then( eol_fix_function ).then( parse_json_function );
			} catch(error){
				return_error = new Error(`FileSystem.promises.readFile threw an error: ${error}`);
				throw return_error;
			}
		} catch(error){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: `FileSystem.accessSync threw an error: ${error}`});
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: '`Paths.json` does not exist; attempting to create one.'});
			sources_json_promise = Promise.resolve( {} );
		}
	}
	if( options['override-backups-json-path'] != null ){
		backups_json_path = options['override-backups-json-path'];
	} else{
		try{
			backups_json_path = Path.join( EnvironmentPaths.data, 'Backups.json' );
		} catch(error){
			return_error = new Error(`Path.join threw an error: ${error}`);
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `${return_error}`});
			throw return_error;
		}
	}
	if( backups_json_path !== '' ){
		try{
			FileSystem.accessSync( backups_json_path );
			try{
				backups_json_promise = FileSystem.promises.readFile( backups_json_path, 'utf8' ).then( eol_fix_function ).then( parse_json_function );
			} catch(error){
				return_error = new Error(`FileSystem.promises.readFile threw an error: ${error}`);
				throw return_error;
			}
		} catch(error){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: `FileSystem.accessSync threw an error: ${error}`});
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: '`Backups.json` does not exist; attempting to create one.'});
			backups_json_promise = Promise.resolve( {} );
		}
	}

	try{
		SaveSaver.setSourcesObject( await sources_json_promise );
	} catch(error){
		return_error = new Error(`SaveSaver.setPathsObject threw an error: ${error}`);
		throw return_error;
	}
	try{
		SaveSaver.setBackupsObject( await backups_json_promise );
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
	var return_error = null;
	const FUNCTION_NAME = 'CLI_Command_Help';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var subcommand_help = '';
	//Parametre checks
	if( typeof(command_options) !== 'object' ){
		return_error = new TypeError('Param "command_options" is not an Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		//throw return_error;
	}
	if( typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is not an Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		//throw return_error;
	}

	//Function
	for( var i = 0; i < command_options.subcommand.length; i++ ){
		for( var j = 1; j < CLIDefinitions.length; j++ ){
			if( command_options.subcommand[i] === CLIDefinitions[j].name ){
				subcommand_help = CommandLineUsage( [
					{
						header: CLIDefinitions[j].name,
						content: CLIDefinitions[j].description
					},
					{
						header: 'Synopsis',
						content: CLIDefinitions[j].synopsis
					},
					{
						header: 'Options',
						optionList: CLIDefinitions[j].options
					}
				] );
				console.log( subcommand_help );
			}
		}
	}

	//Exit
	if( return_error !== null ){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'crit', message: return_error});
		process.exitCode = 1;
	}
}
/**
### CLI_Command_AddSource (Async)
> Adds a new source object to the `Paths.json` object.

Parametres:
| name | type | description |
| --- | --- | --- |
| command_options | {Object} | The options passed to the `add-source` command. \[default: {}\] |
| global_options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

History:
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/
async function CLI_Command_AddSource( command_options = {}, global_options = {} ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'CLI_Command_AddSource';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	const inquirer_questions = [
		{
			type: 'editor',
			name: 'content',
			message: '',
			default: `{
	"name": "NewSource",
	"aliases": [
		"ns"
	],
	"paths": {
		"saves": {
			"include": "",
			"exclude": null
		},
		"config": {
			"include": "",
			"exclude": null
		},
		"data": {
			"include": "",
			"exclude": null
		}
	}
}`
		}
	];
	//Variables
	var existing_source_object = null;
	var new_source_object = {};
	var inquirer_answer = {};
	//Parametre checks
	if( typeof(command_options) !== 'object' ){
		return_error = new TypeError('Param "command_options" is not Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(global_options) !== 'object' ){
		return_error = new TypeError('Param "global_options" is not ?Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	try{
		if( typeof(command_options.name) === 'string' && command_options.name != null ){
			try{
				existing_source_object = SaveSaver.getSourceObject( command_options.name );
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: `A source object already exists with the given name.`});
				if( command_options.force === true ){
					Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: 'Overwriting existing record.'});
				} else{
					return_error = new Error('A source object with that name already exists. Pass `--force` to overwrite it.');
					Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
				}
			} catch(error){
				if( error.code === 'ERR_INVALID_ARG_VALUE' ){
					Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: `No source object with the name "${command_options.name}" exists so we'll create a new one.`});
				} else{
					return_error = new Error(`SaveSaver.getSourceObject threw an unexpected error: ${error}`);
					Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
				}
			}
		} else if( command_options.edit === true ){
			try{
				inquirer_answer = await Inquirer.prompt( inquirer_questions );
			} catch(error){
				return_error = new Error(`await Inquirer.prompt threw an error: ${error}`);
				throw return_error;
			}
			try{
				new_source_object = HJSON.parse( inquirer_answer.content );
			} catch(error){
				return_error = new Error(`HJSON.parse threw an error: ${error}`);
				throw return_error;
			}
		} else{
			if( return_error == null ){
				new_source_object = {
					name: command_options.name,
					aliases: command_options.aliases,
					paths: {}
				};
				if( command_options.data != null && typeof(command_options.data) === 'string' ){
					new_source_object.paths.data = {
						include: [ command_options.data ]
					}
				}
				if( command_options.config != null && typeof(command_options.config) === 'string' ){
					new_source_object.paths.config = {
						include: [ command_options.config ]
					}
				}
				if( command_options.saves != null && typeof(command_options.saves) === 'string' ){
					new_source_object.paths.saves = {
						include: [ command_options.saves ]
					}
				}
			}
		}
		if( new_source_object != null && typeof(new_source_object) === 'object' ){
			try{
				SaveSaver.setSourceObject( new_source_object );
			} catch(error){
				return_error = new Error(`SaveSaver.setSourceObject threw an error: ${error}`);
				throw return_error;
			}
		}
	} catch(error){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'crit', message: error});
		process.exitCode = 1;
	}
}
/**
### CLI_Command_ListSources
> List sources in the `Sources.json` file.

Parametres:
| name | type | description |
| --- | --- | --- |
| command_options | {Object} | The command-line options specific to the command.  |
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
async function CLI_Command_ListSources( command_options, options = {} ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'CLI_Command_ListSources';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var filters_object = {
		include: [],
		exclude: []
	};
	var sources_array = [];
	var source_object = {};
	var index = []; //sorted array of sources with additional information.
	var row_object = {}; //A single "row" entry in the final index.
	//Parametre checks
	if( typeof(command_options) !== 'object' ){
		return_error = new TypeError('Param "command_options" is not Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is not ?Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( command_options['include-regex'] != null && Array.isArray(command_options['include-regex']) === true ){
		filters_object.include = command_options['include-regex'];
	}
	if( command_options['exclude-regex'] != null && Array.isArray(command_options['exclude-regex']) === true ){
		filters_object.exclude = command_options['exclude-regex'];
	}
	try{
		sources_array = SaveSaver.listSources( filters_object );
	} catch(error){
		return_error = new Error(`SaveSaver.listSources threw an error: ${error}`);
		throw return_error;
	}
	for( const source of sources_array ){
		row_object = {};
		row_object.name = source_object.name;
		if( command_options.alias === true || command_options.paths === true ){
			try{
				source_object = SaveSaver.getSourceObject( source );
				if( command_options.alias === true ){
					row_object.aliases = source_object.aliases;
				}
				if( command_options.paths === true ){
					row_object.paths = source_object.paths;
				}
			} catch(error){
				return_error = new Error(`SaveSaver.getSourceObject threw an error: ${error}`);
				throw return_error;
			}
		}
		index.push( row_object );
	}
	index.sort( (a, b) => {
		var swap = 0;
		if( b.name < a.name ){
			swap = 1;
		} else{
			swap = -1;
		}
		if( command_options.invert === true ){
			swap *= -1;
		}
		return swap;
	} );
	if( command_options.json === true ){
		console.log( '%j', index );
	} else{
		console.log('Name\t|\tAliases\t|\tPaths');
		console.log('----\t|\t-------\t|\t-----');
		for( const row of index ){
			console.log('%s\t|\t%s\t|\t%s', row.name, row.aliases.toString(), Object.keys(row.paths).toString() );
		}
	}
	//Exit
	if( return_error !== null ){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'crit', message: return_error});
		process.exitCode = 1;
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
	//Parametre checks
	//Function
	try{
		await loadPersistentDataObjects_Async( EnvironmentPaths.data, options );
		/*try{
			SaveSaver.setSourcePathsObject( PathsObject );
			try{
				SaveSaver.setBackupsObject( BackupsObject );
			} catch(error){
				return_error = new Error(`SaveSaver.setBackupsObject threw an error: ${error}`);
				//throw return_error;
			}
		} catch(error){
			return_error = new Error(`SaveSaver.setSourcePathsObject threw an error: ${error}`);
			//throw return_error;
		}*/
	} catch(error){
		return_error = new Error(`await loadPersistentDataObjects_Async threw an error: ${error}`);
		//throw return_error;
	}

	//Return
	if( return_error !== null ){
		process.exitCode = 1;
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'crit', message: return_error.message});
	}
}

//# Exports and Execution
if(require.main === module){
	var return_error = null;
	const FUNCTION_NAME = 'MainExecutionFunction';
	//## Dependencies
		//### Internal
		//### Standard
		//### External
	//Variables
	var function_return = [1,null];
	var logger = null;
	var quick_exit = false;
	var config_path = '';
	var source_dirname = '';
	var parent_dirname = '';
	var package_path = '';
	var env_paths_object = {};
	var commands_array = [];
	var global_options = {};
	var command = '';
	var command_options = {};
	//EnvironmentPaths
	try{
		env_paths_object = EnvPaths('save-saver');
		try{
			setEnvironmentPaths( env_paths_object );
			SaveSaver.setEnvironmentPaths( env_paths_object );
		} catch(error){
			return_error = new Error(`setEnvironmentPaths threw an error: ${error}`);
			throw return_error;
		}
	} catch(error)/* istanbul ignore next */{
		return_error = new Error(`EnvPaths threw an error: ${error}`);
		throw return_error;
	}
	//Logger
	try{ 
		MakeDir.sync( EnvironmentPaths.log );
	} catch(error)/* istanbul ignore next */{
		console.error('MakeDir.sync threw: %s', error);
	}
	try{
		logger = ApplicationLogWinstonInterface.initWinstonLogger( 'debug.log', EnvironmentPaths.log );
		try{
			setLogger( logger );
		} catch(error){
			return_error = new Error(`setLogger threw an error: ${error}`);
			console.error(return_error);
		}
		try{
			SaveSaver.setLogger( logger );
		} catch(error){
			return_error = new Error(`SaveSaver.setLogger threw an error: ${error}`);
			console.error(return_error);
		}
	} catch(error){
		return_error = new Error(`ApplicationLogWinstonInterface.initWinstonLogger threw an error: ${error}`);
		console.error(return_error);
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'Start of execution block.'});
	//#### CLI
	//##### Options
	for( var i = 0; i < CLIDefinitions.length; i++ ){
		commands_array.push( CLIDefinitions[i].name );
	}
	try{
		global_options = CommandLineArgs( CLIDefinitions[0].options, { stopAtFirstUnknown: true } );
	} catch(error)/* istanbul ignore next */{
		return_error = new Error(`CommandLineArgs threw an error: ${error}`);
		throw return_error;
	}
	try{
		command = CommandLineCommands( commands_array, global_options._unknown );
		//console.log(command, commands_array);
	} catch(error)/* istanbul ignore next */{
		return_error = new Error(`CommandLineCommands threw an error: ${error}`);
		throw return_error;
	}
	if( command != null ){
		for( var i = 0; i < CLIDefinitions.length; i++ ){
			if( command.command === CLIDefinitions[i].name ){
				try{
					//console.log( i, CLIDefinitions[i], command.argv );
					command_options = CommandLineArgs( CLIDefinitions[i].options, { argv: command.argv } );
					//CLIDefinitions[i].func( command_options, global_options )
				} catch(error)/* istanbul ignore next */{
					return_error = new Error(`CommandLineArgs threw an error: ${error}`);
					throw return_error;
				}
			}
		}
	}
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
	//Load config.hjson
	try{
		if( typeof(global_options['config-file']) === 'string' && global_options['config-file'] != '' ){
			loadConfigFile( global_options['config-file'] );
		} else{
			loadConfigFile();
		}
	} catch(error){
		return_error = new Error(`loadConfigFile threw an error: ${error}`);
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
	}
	/* istanbul ignore next */
	if( global_options.verbose === true ){
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
	//Load schema functions.
	try{
		SaveSaver.loadSchemaFunctions();
	} catch(error){
		return_error = new Error(`SaveSaver.loadSchemaFunctions threw an error: ${error}`);
		throw return_error;
	}
	//Main
	/* istanbul ignore next */
	if( global_options.version === true ){
		console.log(PACKAGE_JSON.version);
		quick_exit = true;
	}
	if( global_options.help === true ){
		var commands_list = [];
		for( var i = 1; i < CLIDefinitions.length; i++ ){
			commands_list.push( { name: CLIDefinitions[i].name, summary: CLIDefinitions[i].description } );
		}
		const help_sections_array = [
			{
				header: 'save-saver',
				content: 'Simply backup and restore save data and configuration files for your games.',
			},
			{
				header: 'Commands',
				content: commands_list
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
		console.log('Default config file path: ', Path.join( EnvironmentPaths.config, 'config.hjson' ));
		console.log('Config; ', ConfigObject);
		quick_exit = true;
	}
	if( quick_exit === false || global_options['no-quick-exit'] === true ){
		/* istanbul ignore next */
		//##### Commands
		//main_Async( global_options );
		//console.log(command);
		for( var i = 0; i < CLIDefinitions.length; i++ ){
			if( command.command === CLIDefinitions[i].name ){
				CLIDefinitions[i].func( command_options, global_options );
			}
		}
	}
} else{
	exports.setLogger = setLogger;
	exports.setConfigObject = setConfigObject;
	exports.setEnvironmentPaths = setEnvironmnetPaths;
}
