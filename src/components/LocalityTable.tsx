import type { Locality } from "../types";

interface LocalityTableProps {
  items: Locality[];
}

export default function LocalityTable({ items }: LocalityTableProps) {
  return (
    <div className="table-wrap">
      <table className="locality-table">
        <thead>
          <tr>
            <th scope="col">Bairro / Região</th>
            <th scope="col">Suspeitos</th>
            <th scope="col">Confirmados</th>
            <th scope="col">Descartados</th>
            <th scope="col">Total Notificações</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>{item.suspected}</td>
              <td>{item.confirmed}</td>
              <td>{item.discarded}</td>
              <td className="total-cell">{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
