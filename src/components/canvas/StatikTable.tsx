"use client";

import { Plus, Trash2 } from "lucide-react";

interface StatikTableProps {
  headers: string[];
  rows: string[][];
  onChange: (rows: string[][]) => void;
}

export function StatikTable({ headers, rows, onChange }: StatikTableProps) {
  const addRow = () => {
    const newRow = new Array(headers.length).fill("");
    onChange([...rows, newRow]);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    onChange(newRows);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-3 text-[10px] font-extrabold text-[#9E9E98] uppercase tracking-wider border-b border-gray-100">
                {h}
              </th>
            ))}
            <th className="w-10 border-b border-gray-100"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="group">
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="px-1 py-1 border-b border-gray-50">
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                    className="w-full px-3 py-2 border-transparent border focus:border-[#534AB7] focus:bg-white bg-transparent rounded-lg transition-all outline-none"
                    placeholder="..."
                  />
                </td>
              ))}
              <td className="px-1 py-1 border-b border-gray-50 text-right">
                <button 
                  onClick={() => removeRow(rowIndex)}
                  className="p-2 opacity-0 group-hover:opacity-60 hover:!opacity-100 text-red-500 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button 
        onClick={addRow}
        className="mt-4 flex items-center gap-2 text-[13px] font-bold text-muted-foreground hover:text-[#534AB7] transition-colors px-2"
      >
        <Plus size={16} /> Adicionar linha
      </button>
    </div>
  );
}
