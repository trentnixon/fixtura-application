import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./table";

describe("Table", () => {
  it("renders with default props", () => {
    render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = screen.getByTestId("table");
    expect(table).toBeInTheDocument();
    expect(table).toHaveAttribute("data-slot", "table");
  });

  it("applies custom className", () => {
    render(
      <Table className="custom-class" data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = screen.getByTestId("table");
    expect(table).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = screen.getByTestId("table");
    expect(table).toHaveClass("w-full", "caption-bottom", "text-sm");
  });

  it("renders with table container", () => {
    render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const container = screen.getByTestId("table").parentElement;
    expect(container).toHaveAttribute("data-slot", "table-container");
    expect(container).toHaveClass("relative", "w-full", "overflow-x-auto");
  });
});

describe("TableHeader", () => {
  it("renders with default props", () => {
    render(
      <Table>
        <TableHeader data-testid="table-header">
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    const header = screen.getByTestId("table-header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute("data-slot", "table-header");
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableHeader className="custom-class" data-testid="table-header">
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    const header = screen.getByTestId("table-header");
    expect(header).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Table>
        <TableHeader data-testid="table-header">
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    const header = screen.getByTestId("table-header");
    expect(header).toHaveClass("[&_tr]:border-b");
  });
});

describe("TableBody", () => {
  it("renders with default props", () => {
    render(
      <Table>
        <TableBody data-testid="table-body">
          <TableRow>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const body = screen.getByTestId("table-body");
    expect(body).toBeInTheDocument();
    expect(body).toHaveAttribute("data-slot", "table-body");
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableBody className="custom-class" data-testid="table-body">
          <TableRow>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const body = screen.getByTestId("table-body");
    expect(body).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Table>
        <TableBody data-testid="table-body">
          <TableRow>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const body = screen.getByTestId("table-body");
    expect(body).toHaveClass("[&_tr:last-child]:border-0");
  });
});

describe("TableFooter", () => {
  it("renders with default props", () => {
    render(
      <Table>
        <TableFooter data-testid="table-footer">
          <TableRow>
            <TableCell>Footer content</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    const footer = screen.getByTestId("table-footer");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveAttribute("data-slot", "table-footer");
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableFooter className="custom-class" data-testid="table-footer">
          <TableRow>
            <TableCell>Footer content</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    const footer = screen.getByTestId("table-footer");
    expect(footer).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Table>
        <TableFooter data-testid="table-footer">
          <TableRow>
            <TableCell>Footer content</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    const footer = screen.getByTestId("table-footer");
    expect(footer).toHaveClass("bg-muted/50", "border-t", "font-medium");
  });
});

describe("TableRow", () => {
  it("renders with default props", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="table-row">
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = screen.getByTestId("table-row");
    expect(row).toBeInTheDocument();
    expect(row).toHaveAttribute("data-slot", "table-row");
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableBody>
          <TableRow className="custom-class" data-testid="table-row">
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = screen.getByTestId("table-row");
    expect(row).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="table-row">
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = screen.getByTestId("table-row");
    expect(row).toHaveClass("hover:bg-muted/50", "border-b", "transition-colors");
  });
});

describe("TableHead", () => {
  it("renders with default props", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-testid="table-head">Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    const head = screen.getByTestId("table-head");
    expect(head).toBeInTheDocument();
    expect(head).toHaveTextContent("Header");
    expect(head).toHaveAttribute("data-slot", "table-head");
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="custom-class" data-testid="table-head">
              Header
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    const head = screen.getByTestId("table-head");
    expect(head).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-testid="table-head">Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    const head = screen.getByTestId("table-head");
    expect(head).toHaveClass("text-foreground", "h-10", "px-2", "text-left", "font-medium");
  });
});

describe("TableCell", () => {
  it("renders with default props", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell data-testid="table-cell">Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const cell = screen.getByTestId("table-cell");
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveTextContent("Cell content");
    expect(cell).toHaveAttribute("data-slot", "table-cell");
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="custom-class" data-testid="table-cell">
              Cell content
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const cell = screen.getByTestId("table-cell");
    expect(cell).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell data-testid="table-cell">Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const cell = screen.getByTestId("table-cell");
    expect(cell).toHaveClass("p-2", "align-middle", "whitespace-nowrap");
  });
});

describe("TableCaption", () => {
  it("renders with default props", () => {
    render(
      <Table>
        <TableCaption data-testid="table-caption">Table caption</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const caption = screen.getByTestId("table-caption");
    expect(caption).toBeInTheDocument();
    expect(caption).toHaveTextContent("Table caption");
    expect(caption).toHaveAttribute("data-slot", "table-caption");
  });

  it("applies custom className", () => {
    render(
      <Table>
        <TableCaption className="custom-class" data-testid="table-caption">
          Table caption
        </TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const caption = screen.getByTestId("table-caption");
    expect(caption).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(
      <Table>
        <TableCaption data-testid="table-caption">Table caption</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Cell content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const caption = screen.getByTestId("table-caption");
    expect(caption).toHaveClass("text-muted-foreground", "mt-4", "text-sm");
  });
});

describe("Table composition", () => {
  it("renders complete table structure", () => {
    render(
      <Table data-testid="table">
        <TableCaption data-testid="table-caption">Sample table</TableCaption>
        <TableHeader data-testid="table-header">
          <TableRow data-testid="header-row">
            <TableHead data-testid="table-head">Name</TableHead>
            <TableHead data-testid="table-head-2">Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody data-testid="table-body">
          <TableRow data-testid="table-row">
            <TableCell data-testid="table-cell">John</TableCell>
            <TableCell data-testid="table-cell-2">25</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter data-testid="table-footer">
          <TableRow data-testid="footer-row">
            <TableCell data-testid="footer-cell">Total: 1</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByTestId("table-caption")).toBeInTheDocument();
    expect(screen.getByTestId("table-header")).toBeInTheDocument();
    expect(screen.getByTestId("header-row")).toBeInTheDocument();
    expect(screen.getByTestId("table-head")).toBeInTheDocument();
    expect(screen.getByTestId("table-head-2")).toBeInTheDocument();
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
    expect(screen.getByTestId("table-row")).toBeInTheDocument();
    expect(screen.getByTestId("table-cell")).toBeInTheDocument();
    expect(screen.getByTestId("table-cell-2")).toBeInTheDocument();
    expect(screen.getByTestId("table-footer")).toBeInTheDocument();
    expect(screen.getByTestId("footer-row")).toBeInTheDocument();
    expect(screen.getByTestId("footer-cell")).toBeInTheDocument();
  });
});
