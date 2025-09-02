import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BasicTable, type BasicTableColumn } from "./BasicTable";

describe("BasicTable", () => {
  const mockColumns: BasicTableColumn[] = [
    { key: "name", header: "Name" },
    { key: "age", header: "Age" },
    { key: "email", header: "Email" },
  ];

  const mockRows = [
    { name: "John Doe", age: 30, email: "john@example.com" },
    { name: "Jane Smith", age: 25, email: "jane@example.com" },
  ];

  it("renders with columns and rows", () => {
    render(<BasicTable columns={mockColumns} rows={mockRows} data-testid="basic-table" />);
    const table = screen.getByTestId("basic-table");
    expect(table).toBeInTheDocument();
  });

  it("renders table headers correctly", () => {
    render(<BasicTable columns={mockColumns} rows={mockRows} data-testid="basic-table" />);
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Age" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Email" })).toBeInTheDocument();
  });

  it("renders table data correctly", () => {
    render(<BasicTable columns={mockColumns} rows={mockRows} data-testid="basic-table" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("renders with custom column className", () => {
    const columnsWithClass: BasicTableColumn[] = [
      { key: "name", header: "Name", className: "text-left" },
      { key: "age", header: "Age", className: "text-center" },
    ];
    render(<BasicTable columns={columnsWithClass} rows={mockRows} data-testid="basic-table" />);
    const nameHeader = screen.getByRole("columnheader", { name: "Name" });
    const ageHeader = screen.getByRole("columnheader", { name: "Age" });
    expect(nameHeader).toHaveClass("text-left");
    expect(ageHeader).toHaveClass("text-center");
  });

  it("renders with custom table className", () => {
    render(
      <BasicTable
        columns={mockColumns}
        rows={mockRows}
        className="custom-table-class"
        data-testid="basic-table"
      />,
    );
    const table = screen.getByTestId("basic-table");
    expect(table).toHaveClass("custom-table-class");
  });

  it("renders with empty rows", () => {
    render(<BasicTable columns={mockColumns} rows={[]} data-testid="basic-table" />);
    const table = screen.getByTestId("basic-table");
    expect(table).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Age" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Email" })).toBeInTheDocument();
  });

  it("renders with single row", () => {
    const singleRow = [mockRows[0]!];
    render(<BasicTable columns={mockColumns} rows={singleRow} data-testid="basic-table" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });

  it("renders with complex cell content", () => {
    const complexRows = [
      {
        name: <strong>John Doe</strong>,
        age: <span className="text-blue-500">30</span>,
        email: <a href="mailto:john@example.com">john@example.com</a>,
      },
    ];
    render(<BasicTable columns={mockColumns} rows={complexRows} data-testid="basic-table" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("renders with missing cell data", () => {
    const incompleteRows = [
      { name: "John Doe", age: 30 }, // missing email
      { name: "Jane Smith", email: "jane@example.com" }, // missing age
    ];
    render(<BasicTable columns={mockColumns} rows={incompleteRows} data-testid="basic-table" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("renders correct number of rows", () => {
    render(<BasicTable columns={mockColumns} rows={mockRows} data-testid="basic-table" />);
    const table = screen.getByTestId("basic-table");
    const rows = table.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(2);
  });

  it("renders correct number of columns", () => {
    render(<BasicTable columns={mockColumns} rows={mockRows} data-testid="basic-table" />);
    const table = screen.getByTestId("basic-table");
    const headerCells = table.querySelectorAll("thead th");
    expect(headerCells).toHaveLength(3);
  });
});
