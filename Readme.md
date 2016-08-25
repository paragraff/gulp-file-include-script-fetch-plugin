### gulp-file-include-script-fetch-plugin
a plugin of gulp for [gulp-file-include](https://github.com/coderhaoxin/gulp-file-include) plugin

### include plugin to gulp-file-include

```js
fileinclude({
  ...
  plugins: ['node_modules/gulp-file-include-script-fetch-plugin']
  ...
})
```

### options

plugin require options:

  - context.path.templates: `array`, paths to the included file in fs

```js
fileinclude({
  ...
  plugins: ['node_modules/gulp-file-include-script-fetch-plugin']
  context: {
    path: {
      template: ['srs/templates/', 'anotherDir/templates']
    }
  }
  ...
})
```

### Example

index.html
```html
<!DOCTYPE html>
<html>
  <body>
    /*{template_script_fetch file="someTemplate.jst" jst=1}*/
  </body>
</html>
```

src/engineTemplates/someTemplate.jst
```
<div>
<h3>Engine template</h3>
<p>Lorem ipsum dolor sit amet</p>
</div>
```

src/projectTemplates/someTemplate.jst
```
<div>
<h3>Site template</h3>
<p>Lorem ipsum dolor sit amet</p>
</div>
```

gulpfile.js
```js
var fileinclude = require('gulp-file-include'),
  gulp = require('gulp');

gulp.task('fileinclude', function() {
  gulp.src(['index.html'])
    .pipe(fileinclude({
      prefix: '/*{',
      postfix: '}*/',
      plugins: ['node_modules/gulp-file-include-script-fetch-plugin'],
      context: {
        path: {
          templates: ['src/engineTemplates', 'src/projectTemplates']
        }
      }
    }))
    .pipe(gulp.dest('./dest'));
});
```

and the result is dest/index.html:
```
<!DOCTYPE html>
<html>
  <body>
    <div>
    <h3>Engine template</h3>
    <p>Lorem ipsum dolor sit amet</p>
    </div>
  </body>
</html>
```

if replace templates options:
```
...
 templates: ['src/projectTemplates', 'src/engineTemplates']
...
```

then result to be:
```
<!DOCTYPE html>
<html>
  <body>
    <div>
    <h3>Site template</h3>
    <p>Lorem ipsum dolor sit amet</p>
    </div>
  </body>
</html>
```

### License
MIT
