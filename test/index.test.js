const plugin = require('../src/index');

describe('SQL Plugin', () => {
  test('exports parsers and printers', () => {
    expect(plugin.parsers).toBeDefined();
    expect(plugin.parsers.sql).toBeDefined();
    expect(plugin.printers).toBeDefined();
    expect(plugin.printers.sql).toBeDefined();
  });

  test('has sql parser configuration', () => {
    expect(plugin.parsers.sql.parse).toBeInstanceOf(Function);
    expect(plugin.parsers.sql.astFormat).toBe('sql');
    expect(plugin.parsers.sql.locStart).toBeInstanceOf(Function);
    expect(plugin.parsers.sql.locEnd).toBeInstanceOf(Function);
    expect(plugin.parsers.sql.extensions).toEqual(['.sql']);
  });

  test('has sql printer configuration', () => {
    expect(plugin.printers.sql.print).toBeInstanceOf(Function);
  });

  test('has plugin options', () => {
    expect(plugin.options).toBeDefined();
    expect(plugin.options.sqlKeywordsCase).toBeDefined();
    expect(plugin.options.sqlCommaPosition).toBeDefined();
  });

  test('parser creates sql AST node', () => {
    const input = 'SELECT id FROM users';
    const ast = plugin.parsers.sql.parse(input);
    
    expect(ast).toEqual({
      type: 'sql',
      value: input
    });
  });
  
  test('printer formats SQL with keywords on new lines', () => {
    const input = {
      type: 'sql',
      value: 'SELECT id FROM users WHERE id = 1'
    };
    
    const path = {
      getValue: () => input
    };
    
    const options = {};
    const formatted = plugin.printers.sql.print(path, options);
    
    expect(formatted).toContain('\nFROM');
    expect(formatted).toContain('\nWHERE');
  });
});