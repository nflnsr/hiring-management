"use client";

import type React from "react";

import { useState, useEffect } from "react";

interface Candidate {
  id: string;
  job_id: string;
  attributes: Array<{
    key: string;
    label: string;
    value: string;
  }>;
  applied_at: string;
}

interface CandidateTableProps {
  candidates: Candidate[];
}

export default function CandidateTable({ candidates }: CandidateTableProps) {
  const [columns, setColumns] = useState<Array<{ key: string; label: string; width: number }>>(
    candidates.length > 0
      ? candidates[0].attributes.map((attr, idx) => ({
          key: attr.key,
          label: attr.label,
          width: 150,
        }))
      : []
  );

  const [columnOrder, setColumnOrder] = useState<number[]>(columns.map((_, i) => i));

  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [startX, setStartX] = useState(0);

  const handleMouseDown = (e: React.MouseEvent, columnIndex: number) => {
    setResizingColumn(columnIndex);
    setStartX(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn === null) return;
      const diff = e.clientX - startX;
      setColumns((prev) => {
        const newCols = [...prev];
        newCols[resizingColumn] = {
          ...newCols[resizingColumn],
          width: Math.max(100, newCols[resizingColumn].width + diff),
        };
        return newCols;
      });
      setStartX(e.clientX);
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    if (resizingColumn !== null) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizingColumn, startX]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColumn(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (draggedColumn === null) return;
    const newOrder = [...columnOrder];
    const draggedIdx = columnOrder.indexOf(draggedColumn);
    const targetIdx = columnOrder.indexOf(index);

    if (draggedIdx !== targetIdx) {
      [newOrder[draggedIdx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[draggedIdx]];
      setColumnOrder(newOrder);
    }
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  const getColumnValue = (candidate: Candidate, key: string) => {
    const attr = candidate.attributes.find((a) => a.key === key);
    return attr?.value || "-";
  };

  if (candidates.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted">No candidates yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-gray-50">
            {columnOrder.map((colIdx) => (
              <th
                key={colIdx}
                draggable
                onDragStart={(e) => handleDragStart(e, colIdx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(e, colIdx);
                }}
                onDragEnd={handleDragEnd}
                className="px-4 py-3 text-left font-semibold text-foreground text-sm cursor-move hover:bg-border relative"
                style={{ width: columns[colIdx].width }}
              >
                {columns[colIdx].label}
                <div
                  onMouseDown={(e) => handleMouseDown(e, colIdx)}
                  className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-accent opacity-0 hover:opacity-100 transition-opacity"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate.id} className="border-b border-border hover:bg-gray-50">
              {columnOrder.map((colIdx) => (
                <td
                  key={colIdx}
                  className="px-4 py-3 text-sm text-foreground"
                  style={{ width: columns[colIdx].width }}
                >
                  {getColumnValue(candidate, columns[colIdx].key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
