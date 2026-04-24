export function Table({ columns = [], rows = [], emptyMessage = 'No records found.' }) {
  if (!rows.length) {
    return (
      <div className="rounded-3xl border border-dashed border-mist-200 bg-mist-50 px-6 py-8 text-sm text-mist-600">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-mist-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-mist-100">
          <thead className="bg-mist-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-mist-500"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-mist-100 bg-white">
            {rows.map((row, index) => (
              <tr key={row.id || index} className="align-top">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-sm text-mist-700">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
