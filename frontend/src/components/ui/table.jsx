import React from "react";

export const Table = ({ children }) => {
  return (
    <table className="min-w-full border border-gray-200 rounded-lg">
      {children}
    </table>
  );
};

export const TableHeader = ({ children }) => {
  return <thead className="bg-gray-100">{children}</thead>;
};

export const TableBody = ({ children }) => {
  return <tbody>{children}</tbody>;
};

export const TableRow = ({ children }) => {
  return <tr className="border-b">{children}</tr>;
};

export const TableHead = ({ children }) => {
  return (
    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
      {children}
    </th>
  );
};

export const TableCell = ({ children }) => {
  return (
    <td className="px-4 py-2 text-sm text-gray-600">
      {children}
    </td>
  );
};