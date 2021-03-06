'use strict';

var script_fetch = require('../index.js');
var should = require('should');
var gutil = require('gulp-util');
var sinon = require('sinon');

describe('## script fetch', function() {
	it('# basic', function(done) {
		var text = script_fetch(
			new gutil.File({
				path: 'test/fixtures/engine/someTemplate.jst',
				contents: new Buffer('content/*{template_script_fetch file="someTemplate.jst" jst=1}*/content')
			}),
			'content/*{template_script_fetch file="someTemplate.jst" jst=1}*/content',
			null,
			{
				prefix: '\\/\\*\\{\\$?',
				suffix: '\\}\\*\\/',
				context: {
					path: {
						templates: ['test/fixtures/projectTemplates']
					}
				}
			},
			sinon.stub().returnsArg(0)
		);
		text.should.equal(
			'content<div>\\n<h3>Site template</h3>\\n\\t<p>Lorem ipsum dolor sit amet</p>\\n</div>content'
		);
		done();
	});
	it('# char escaping', function(done) {
		var text = script_fetch(
			new gutil.File({
				path: 'test/fixtures/engine/someTemplate.jst',
				contents: new Buffer('content\n/*{template_script_fetch file="someTemplate.jst" jst=1}*/con\'t\'ent')
			}),
			'content\n/*{template_script_fetch file="someTemplate.jst" jst=1}*/con\'t\'ent',
			null,
			{
				prefix: '\\/\\*\\{\\$?',
				suffix: '\\}\\*\\/',
				context: {
					path: {
						templates: ['test/fixtures/projectTemplates']
					}
				}
			},
			sinon.stub().returnsArg(0)
		);
		text.should.equal(
			'content\n<div>\\n<h3>Site template</h3>\\n\\t<p>Lorem ipsum dolor sit amet</p>\\n</div>con\'t\'ent'
		);
		done();
	});
	it('# recursion', function(done) {
		var text = script_fetch(
			new gutil.File({
				path: 'test/fixtures/engine/someTemplate.jst',
				contents: new Buffer('content/*{template_script_fetch file="someRecursionTemplate.jst" jst=1}*/content')
			}),
			'content/*{template_script_fetch file="someRecursionTemplate.jst" jst=1}*/content',
			null,
			{
				prefix: '\\/\\*\\{\\$?',
				suffix: '\\}\\*\\/',
				context: {
					path: {
						templates: ['test/fixtures/projectTemplates']
					}
				}
			},
			sinon.stub().returnsArg(0)
		);
		text.should.equal(
			'content<div>\\n<p>Recursion template:</p>\\n<div>\\n<h3>Site template</h3>\\n' +
			'\\t<p>Lorem ipsum dolor sit amet</p>\\n</div>\\n</div>content'
		);
		done();
	});
	describe('# for several paths', function () {
		it('include template from first path if file exists', function (done) {
			var text = script_fetch(
				new gutil.File({
					path: 'test/fixtures/engine/someTemplate.jst',
					contents: new Buffer('content/*{template_script_fetch file="someTemplate.jst" jst=1}*/content')
				}),
				'content/*{template_script_fetch file="someTemplate.jst" jst=1}*/content',
				null,
				{
					prefix: '\\/\\*\\{\\$?',
					suffix: '\\}\\*\\/',
					context: {
						path: {
							templates: ['test/fixtures/engineTemplates', 'test/fixtures/projectTemplates']
						}
					}
				},
				sinon.stub().returnsArg(0)
			);
			text.should.equal(
				'content<div>\\n<h3>Engine template</h3>\\n<p>Lorem ipsum dolor sit amet</p>\\n</div>content'
			);
			done();
		});
		it('include template from second path if file not exists to first path', function (done) {
			var text = script_fetch(
				new gutil.File({
					path: 'test/fixtures/engine/someTemplate.jst',
					contents: new Buffer('content/*{template_script_fetch file="someRecursionTemplate.jst" jst=1}*/content')
				}),
				'content/*{template_script_fetch file="someRecursionTemplate.jst" jst=1}*/content',
				null,
				{
					prefix: '\\/\\*\\{\\$?',
					suffix: '\\}\\*\\/',
					context: {
						path: {
							templates: ['test/fixtures/engineTemplates', 'test/fixtures/projectTemplates']
						}
					}
				},
				sinon.stub().returnsArg(0)
			);
			text.should.equal(
				'content<div>\\n<p>Recursion template:</p>\\n<div>\\n<h3>Engine template</h3>\\n' +
				'<p>Lorem ipsum dolor sit amet</p>\\n</div>\\n</div>content'
			);
			done();
		});
	});
});
