#!/usr/local/bin/node
'use strict';
/**
# [lib.test.js](source/lib.test.js)
> AVA test file for [lib.js](source/lib.js).

Internal module name: `SaveSaverTest`

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
	//## External
	const AVA = require('ava');
//# Constants
const FILENAME = 'lib.test.js';
const MODULE_NAME = 'SaveSaverTest';
var PACKAGE_JSON = {};
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'save-saver-test';
} else{
	PROCESS_NAME = process.argv0;
}
//## Errors

//# Global Variables
/* istanbul ignore next */

/**
## Functions
*/
AVA( 'sha256BufferFromFilePath:Success', async function(t){
	const test_name = 'sha256BufferFromFilePath:Success';
	var sha256_buffer = await SaveSaver.sha256BufferFromFilePath( 'test/input/file.dat' );
	t.log( sha256_buffer );
	var expected_sha256 = FileSystem.readFileSync( 'test/DATA/file.sha256' );
	t.deepEqual( sha256_buffer, expected_sha256 );
} );

//# Exports and Execution
if(require.main === module){
	var return_error = null;
	const FUNCTION_NAME = 'MainExecutionFunction';
	//## Dependencies
		//### Internal
		//### Standard
		//### External
} else{
}
