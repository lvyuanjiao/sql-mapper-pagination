
var assert = require('assert');
var getPagination = require('../index');

(function () {

  var sql = 'SELECT * FROM tb';
  var values = [];
  var limit = {
    'offset': 0,
    'rows': 12
  };
  var testData = [{
    title: '  MySQL',
    dialect: 'mysql',
    params: limit,
    sql_input: sql,
    values_input: values,
    sql_output: 'SELECT * FROM tb LIMIT 12 OFFSET 0',
    values_output: []
  },{
    title: '  PostgresSQL',
    dialect: 'postgres',
    params: limit,
    sql_input: sql,
    values_input: values,
    sql_output: 'SELECT * FROM tb LIMIT 12 OFFSET 0',
    values_output: []
  },{
    title: '  SQlite',
    dialect: 'sqlite',
    params: limit,
    sql_input: sql,
    values_input: values,
    sql_output: 'SELECT * FROM tb LIMIT 12 OFFSET 0',
    values_output: []
  },{
    title: '  Oracle',
    dialect: 'oracle',
    params: limit,
    sql_input: sql,
    values_input: values,
    sql_output: 'SELECT * FROM ( SELECT tmp_table.*, rownum, row_id FROM ( SELECT * FROM tb ) tmp_table WHERE rownum <= 12 ) WHERE row_id > 0',
    values_output: []
  },{
    title: '  MS SQL',
    dialect: 'mssql',
    params: limit,
    sql_input: sql,
    values_input: values,
    sql_output: 'SELECT * FROM tb OFFSET 0 ROWS FETCH NEXT 12 ROWS ONLY',
    values_output: []
  }];

  function getPlugin (dialect, params) {
    params = [].concat(params || []);
    return {
      'ctx': {
        'dialect': dialect
      },
      'params': params
    };
  }

  console.log('#Test');
  var paginate = getPagination();
  testData.forEach(function (item) {
    console.log(item.title);
    var plugin = getPlugin(item.dialect, item.params);
    paginate.afterParse(item.sql_input, item.values_input, plugin, function (sql, values) {
      assert.equal(sql, item.sql_output, 'sql not the same');
      assert.deepEqual(values, item.values_output, 'values not the same');
    });
  });


  console.log('#Test with default rows');
  paginate = getPagination();
  testData.forEach(function (item) {
    console.log(item.title);
    var plugin = getPlugin(item.dialect); // no params
    paginate.afterParse(item.sql_input, item.values_input, plugin, function (sql, values) {
      assert.equal(sql, item.sql_output, 'sql not the same');
      assert.deepEqual(values, item.values_output, 'values not the same');
    });
  });

})();
