/**
 * ES6 Template like strings in ES3 compatible syntax
 */
String.prototype.template = function(object) {
  // Andrea Giammarchi - WTFPL License
  var stringify = JSON.stringify,
    re = /\$\{([\S\s]*?)\}/g,
    evaluate = [],
    i = 0,
    m;

  while(m = re.exec(this)) {
    evaluate.push(
      stringify(this.slice(i, re.lastIndex - m[0].length)),
      '(' + m[1] + ')'
    );
    i = re.lastIndex;
  }
  evaluate.push(stringify(this.slice(i)));
  // Function is needed to opt out from possible "use strict" directive
  return Function('with(this)return' + evaluate.join('+')).call(object);
};
