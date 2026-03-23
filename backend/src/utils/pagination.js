const cursorPaginate = ({ rows, limit, cursorKey = 'id' }) => {
  const hasNext = rows.length > limit;
  const slicedRows = hasNext ? rows.slice(0, limit) : rows;
  const nextCursor = hasNext ? slicedRows[slicedRows.length - 1][cursorKey] : null;

  return {
    data: slicedRows,
    pagination: {
      nextCursor,
      hasNext
    }
  };
};

module.exports = {
  cursorPaginate
};