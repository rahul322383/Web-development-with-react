import React, { useState, useRef, useEffect } from "react";

export const DropdownMenu = ({ children }) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

export const DropdownMenuTrigger = ({ children, onClick }) => {
  return (
    <div onClick={onClick} className="cursor-pointer">
      {children}
    </div>
  );
};

export const DropdownMenuContent = ({ children, open }) => {
  if (!open) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
    >
      {children}
    </div>
  );
};

export const DropdownMenuSeparator = () => {
  return <div className="border-t border-gray-200 my-1" />;
};

export const DropdownMenuLabel = ({ children }) => {
  return (
    <div className="px-4 py-2 text-xs text-gray-500 uppercase">{children}</div>
  );
};