'use strict';

module.exports = function(defaultRows) {
  defaultRows = defaultRows || 12;
  return {
    afterParse: function(sql, values, plugin, callback) {
      var dialect = plugin.ctx.dialect;
      var limit = {
        'rows': defaultRows
      };
      if (plugin.params && plugin.params[0]) {
        limit = plugin.params[0];
      }
      limit.offset = limit.offset || 0;
      limit.rows = limit.rows || defaultRows;

      var condition = '';
      if (dialect === 'mysql' || dialect === 'postgres' || dialect === 'sqlite') {
        condition = '';
        callback((sql + (limit.rows ? (' LIMIT ' + limit.rows) : '') + ' OFFSET ' + limit.offset), values);
      } else if (dialect === 'oracle') {
        condition = '';
        if (limit.rows) {
          condition = 'WHERE rownum <= ' + limit.rows;
        }
        callback('SELECT * FROM ( SELECT tmp_table.*, rownum, row_id FROM ( ' + sql + ' ) tmp_table ' + condition + ' ) WHERE row_id > ' + limit.offset, values);
      } else if (dialect === 'mssql') {
        // MSSQL Server 2012
        condition = '';
        if (limit.rows) {
          condition = 'FETCH NEXT ' + limit.rows + ' ROWS ONLY';
        }
        callback(sql + ' OFFSET ' + limit.offset + ' ROWS ' + condition, values);
      } else {
        callback(sql, values);
      }
    }
  };
};
