var balanced = require('balanced-match');
var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');

module.exports = function(file, text, data, opts, handleFn) {
	'use strict';

	opts.name = 'template_script_fetch';

	var result = '';
	var reStart = new RegExp(opts.prefix + '[ ]*' + opts.name + ' ');
	var reEnd = new RegExp(opts.suffix);
	var matchArg;

	// check required options: paths.templates
	if (
		!opts.hasOwnProperty('context')
		|| !opts.context.hasOwnProperty('path')
		|| !opts.context.path.hasOwnProperty('templates')
		|| !Array.isArray(opts.context.path.templates)
		|| opts.context.path.templates.length < 1
	) {
		throw new Error('options context.path.templates is required for script_fetch plugin');
	}

	while (reStart.exec(text)) {

		// get markup
		matchArg = balanced(reStart, reEnd, text);

		// get params from markup string
		let fileParams = matchArg.body.match(/(.*?)="(.*?)"\s?/g),
			paramsObj = fileParams.reduce(function (result, param) {
				result[param.split('=')[0]] = param.split('=')[1].trim();
				return result;
			}, {}),
			fileName = paramsObj.file;

		// check exist path to file in markup params
		if (fileName === undefined) {
			throw new Error('file - required property for templates_script_fetch markup');
		} else {
			delete paramsObj.file;
			fileName = fileName.substring(1, fileName.length - 1);
			// Reflect is not defined in nodejs < 6
			// Reflect.deleteProperty(paramsObj, 'file');
		}

		// check exist included file for any paths
		let templateBase = opts.context.path.templates.find(function (basePath) {
			try {
				fs.accessSync(path.resolve(basePath, fileName), fs.F_OK);
				return true;
			} catch (ex) {
				return false;
			}
		});
		if (templateBase === undefined) {
			throw new Error('can\'t include file: file not exists by path: ' + path.resolve(basePath, fileName));
		}

		let includeContent = fs.readFileSync(path.resolve(templateBase, fileName), 'utf-8');

		text =
			// string before markup
			text.substring(0, matchArg.start) +
			// new string instead markup
			includeContent.replace(/(\r\n)|(\n)/g, '\\n').replace(/\t/g, '\\t').replace(/'/g, '\\\'') +
			// string after markup
			text.substring(matchArg.end, text.length).replace(reEnd, '');

		let recFile = new gutil.File({
			cwd: process.cwd(),
			base: file.base,
			path: file.path,
			contents: new Buffer(text)
		});

		recFile = handleFn(recFile, text, data);

		text = String(recFile.contents);
	}

	result += text;

	return result;
};
