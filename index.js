'use strict';

module.exports = function(opts) {
  opts = opts || {};
  var defaultRows = opts.defaultRows || 12;
  var offsetKey = opts.offsetKey || 'offset';
  var rowsKey = opts.rowsKey || 'rows';
  return {
    before: function(sql, values, plugin, callback) {
      var dialect = plugin.ctx.dialect;
      var page = plugin.params && plugin.params[0] || {};
      var limit = {
        offset: page[offsetKey] || 0,
        rows: page[rowsKey] || defaultRows
      };

      var condition = '';
      if (dialect === 'mysql' || dialect === 'postgres' || dialect === 'sqlite') {
        callback((sql + (limit.rows ? (' LIMIT ' + limit.rows) : '') + ' OFFSET ' + limit.offset), values);
      } else if (dialect === 'oracle') {
        condition = limit.rows ? ('WHERE rownum <= ' + limit.rows) : '';
        callback('SELECT * FROM ( SELECT tmp_table.*, rownum, row_id FROM ( ' + sql + ' ) tmp_table ' + condition + ' ) WHERE row_id > ' + limit.offset, values);
      } else if (dialect === 'mssql') { // MSSQL Server 2012        
        condition = limit.rows ? ('FETCH NEXT ' + limit.rows + ' ROWS ONLY') : '';
        callback(sql + ' OFFSET ' + limit.offset + ' ROWS ' + condition, values);
      } else {
        callback(sql, values);
      }
    }
  };
};
