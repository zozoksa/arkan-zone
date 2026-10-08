/** Minimal accessible table with horizontal scroll on small screens. */
export default function DataTable({ columns, rows, rowKey, empty = 'مفيش بيانات' }) {
  if (!rows.length) return <p className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-muted">{empty}</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-[40rem] text-sm">
        <thead className="bg-raised">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className="px-4 py-3 text-start font-medium text-muted">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-raised/60">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 align-middle text-ink-soft">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
