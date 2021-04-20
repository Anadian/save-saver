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
const CLIDefintions = [
	{ name: null, description: 'Simply backup and restore save data and configuration files for your games.', synopsis: '$ save-saver (options)', options: [
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
		{ name: 'override-paths-object-path', type: String, description: 'Specify a path to read the PathsObject from instead of the default. Takes precedent over `override-data-directory-path`.' },
		{ name: 'override-backups-object-path', type: String, description: 'Specify a path to read the BackupsObject from instead of the default. Takes precedent over `override-data-directory-path`.' },
		{ name: 'override-data-directory-path', type: String, description: 'Specify a directory to search for the PathsObject and BackupsObject files instead of the default.' }
	] },
	{ name: 'help', description: 'Writes a helpful synopsis for the given subcommand to STDOUT.', synopsis: '$ save-saver help <subcommand>', options: [
		{ name: 'subcommand', alias: 'S', type: String, multiple: true, defaultOption: true, description: 'The subcommand(s) to write help text for.' }
	] },
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
		{ name: 'oldest', alias: 'o', type: Boolean, description: 'Invert the list order to show the oldest at the bottom.' },
		{ name: 'count', alias: 'C', type: Number, defaultValue: 10, description: 'Specifies how many backups to show in the resulting list. [Default: 10]' }
	] },
	{ name: 'restore', description: 'Restores the backup with the given ID.', synposis: '$ save-saver restore <backup ID> (options)', options: [
		{ name: 'id', alias: 'I', type: String, defaultOption: true, description: 'The ID of the backup to be restored.' }
	] },
	{ name: 'delete-backup', description: 'Deletes the backup with the given ID.', synopsis: '$ save-saver delete-backup <backup ID> (options)', options: [
		{ name: 'id', alias: 'I', type: String, defaultOption: true, description: 'The ID of the backup to be deleted.' }
	] }
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
		EnvironmentPaths = environmnet_paths;
	} else{
		return_error = new Error('Param `environment_paths` is `null`.');
		return_error.code = 'ERR_INVALID_ARG_VALUE';
		throw return_error;
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
	function_return = ApplicationLogWinstonInterface.InitLogger('debug.log', EnvironmentPaths.log);
	if( function_return[0] === 0 ){
		setLogger( function_return[1] );
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'Start of execution block.'});
	//#### CLI
	//##### Options
	for( var i = 0; i < CLIDefinitions.length; i++ ){
		commands_array.push( CLIDefinitions[i].name );
	}
	try{
		global_options = CommandLineArgs( CLIDefinitions[0], { stopAtFirstUnknown: true } );
	} catch(error)/* istanbul ignore next */{
		return_error = new Error(`CommandLineArgs threw an error: ${error}`);
		throw return_error;
	}
	try{
		command = CommandLineCommands( commands_array );
	} catch(error)/* istanbul ignore next */{
		return_error = new Error(`CommandLineCommands threw an error: ${error}`);
		throw return_error;
	}
	if( command != null ){
		for( var i = 0; i < CLIDefinitions.length; i++ ){
			if( command === CLIDefinitions[i].name ){
				try{
					command_options = CommandLineArgs( CLIDefinitions[i].options );
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
		if( global_options['config-file'] !== '' ){
			loadConfigFile( global_options['config-file'] );
		} else{
			loadConfigFile();
		}
	} catch(error){
		return_error = new Error(`loadConfigFile threw an error: ${error}`);
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
	}
} else{
	exports.setLogger = setLogger;
	exports.setConfigObject = setConfigObject;
	exports.setEnvironmentPaths = setEnvironmnetPaths;
}
