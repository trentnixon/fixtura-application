import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrdersTableInvoiceActions } from "./OrdersTableInvoiceActions";

describe("OrdersTableInvoiceActions", () => {
  it("renders Pay invoice for hosted URL when showPayAction is true", () => {
    render(
      <OrdersTableInvoiceActions
        hostedInvoiceUrl="https://example.com/invoice"
        invoicePdfUrl={null}
        showPayAction
      />,
    );
    const link = screen.getByRole("link", { name: /Pay invoice/i });
    expect(link).toHaveAttribute("href", "https://example.com/invoice");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("renders View invoice for hosted URL when not payable", () => {
    render(
      <OrdersTableInvoiceActions
        hostedInvoiceUrl="https://example.com/invoice"
        invoicePdfUrl={null}
        showPayAction={false}
      />,
    );
    expect(screen.getByRole("link", { name: /View invoice/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Pay invoice/i })).not.toBeInTheDocument();
  });

  it("renders both hosted and PDF actions", () => {
    render(
      <OrdersTableInvoiceActions
        hostedInvoiceUrl="https://example.com/invoice"
        invoicePdfUrl="https://example.com/invoice.pdf"
        showPayAction
      />,
    );
    expect(screen.getByRole("link", { name: /Pay invoice/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Download invoice/i })).toBeInTheDocument();
  });

  it("renders PDF-only download", () => {
    render(
      <OrdersTableInvoiceActions
        hostedInvoiceUrl={null}
        invoicePdfUrl="https://example.com/invoice.pdf"
      />,
    );
    expect(screen.getByRole("link", { name: /Download invoice/i })).toBeInTheDocument();
  });

  it("renders em dash when no URLs", () => {
    render(<OrdersTableInvoiceActions hostedInvoiceUrl={null} invoicePdfUrl={null} />);
    expect(screen.getByText("–")).toBeInTheDocument();
  });
});
