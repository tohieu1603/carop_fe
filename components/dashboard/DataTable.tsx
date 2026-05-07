"use client";

import React from "react";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  width?: string | number;
}

interface Props<T> {
  rows: T[] | undefined;
  columns: Column<T>[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  empty?: React.ReactNode;
}

export function DataTable<T>({ rows, columns, rowKey, isLoading, empty }: Props<T>) {
  return (
    <div className="card" style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead style={{ background: "var(--bg-soft)" }}>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--ink-500)",
                  borderBottom: "1px solid var(--border)",
                  width: c.width,
                }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 24, textAlign: "center", color: "var(--ink-500)" }}>
                Đang tải…
              </td>
            </tr>
          ) : !rows || rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 24, textAlign: "center", color: "var(--ink-500)" }}>
                {empty || "Chưa có dữ liệu."}
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={rowKey(r)} style={{ borderBottom: "1px solid var(--border)" }}>
                {columns.map((c) => (
                  <td key={c.key} style={{ padding: "10px 12px" }}>
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const color = colorFor(value);
  return <span className={`badge badge-${color}`}>{value}</span>;
}

function colorFor(s: string) {
  const v = s.toUpperCase();
  if (["ACTIVE", "APPROVED", "ACCEPTED", "HELD", "PAID_OUT", "RESOLVED", "RECEIPT_CONFIRMED"].includes(v)) return "green";
  if (["PENDING", "PENDING_OTP", "PENDING_PAYMENT", "PENDING_BALANCE", "DRAFT_SUBMITTED", "INSPECTION_PENDING", "OPEN", "ASSIGNED"].includes(v)) return "amber";
  if (["BLOCKED", "REJECTED", "WITHDRAWN", "FORFEITED", "CANCELED", "INSPECTION_REJECTED", "DISPUTED"].includes(v)) return "red";
  return "neutral";
}
