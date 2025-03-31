const parser = require('./parser');
const printer = require('./printer');
const embed = require('./embed');

const languageName = 'sql';

const parsers = {
  sql: {
    parse: parser.parse,
    astFormat: 'sql-ast',
    locStart: parser.locStart,
    locEnd: parser.locEnd,
    extensions: ['.sql']
  }
};

const printers = {
  'sql-ast': {
    print: printer.print,
    embed: embed
  }
};

module.exports = {
  parsers,
  printers
};