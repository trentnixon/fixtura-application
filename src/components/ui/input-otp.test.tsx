import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "./input-otp";

// Mock input-otp
vi.mock("input-otp", () => ({
  OTPInput: ({ children, containerClassName, className, ...props }: any) => (
    <div
      data-testid="input-otp"
      className={`${containerClassName || ""} ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  ),
  OTPInputContext: React.createContext({
    slots: [{ isActive: true }],
  }),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  MinusIcon: () => <div data-testid="minus-icon" />,
}));

describe("InputOTP", () => {
  it("renders with default props", () => {
    render(
      <InputOTP maxLength={6} data-testid="input-otp">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const inputOTP = screen.getByTestId("input-otp");
    expect(inputOTP).toBeInTheDocument();
    expect(inputOTP).toHaveAttribute("data-slot", "input-otp");
  });

  it("applies custom className", () => {
    render(
      <InputOTP maxLength={6} className="custom-class" data-testid="input-otp">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const inputOTP = screen.getByTestId("input-otp");
    expect(inputOTP).toHaveClass("custom-class");
  });

  it("applies container className", () => {
    render(
      <InputOTP maxLength={6} containerClassName="container-class" data-testid="input-otp">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const inputOTP = screen.getByTestId("input-otp");
    // The containerClassName is applied to the container element, not the main element
    expect(inputOTP).toHaveClass("container-class");
  });
});

describe("InputOTPGroup", () => {
  it("renders with default props", () => {
    render(
      <InputOTP maxLength={6}>
        <InputOTPGroup data-testid="input-otp-group">
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const group = screen.getByTestId("input-otp-group");
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("data-slot", "input-otp-group");
  });

  it("applies custom className", () => {
    render(
      <InputOTP maxLength={6}>
        <InputOTPGroup className="custom-class" data-testid="input-otp-group">
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const group = screen.getByTestId("input-otp-group");
    expect(group).toHaveClass("custom-class");
  });
});

describe("InputOTPSlot", () => {
  it("renders with default props", () => {
    render(
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} data-testid="input-otp-slot" />
        </InputOTPGroup>
      </InputOTP>,
    );
    const slot = screen.getByTestId("input-otp-slot");
    expect(slot).toBeInTheDocument();
    expect(slot).toHaveAttribute("data-slot", "input-otp-slot");
  });

  it("applies custom className", () => {
    render(
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} className="custom-class" data-testid="input-otp-slot" />
        </InputOTPGroup>
      </InputOTP>,
    );
    const slot = screen.getByTestId("input-otp-slot");
    expect(slot).toHaveClass("custom-class");
  });

  it("renders with active state", () => {
    render(
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} data-testid="input-otp-slot" />
        </InputOTPGroup>
      </InputOTP>,
    );
    const slot = screen.getByTestId("input-otp-slot");
    expect(slot).toHaveAttribute("data-active");
  });
});

describe("InputOTPSeparator", () => {
  it("renders with default props", () => {
    render(
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
        <InputOTPSeparator data-testid="input-otp-separator" />
        <InputOTPGroup>
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const separator = screen.getByTestId("input-otp-separator");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-slot", "input-otp-separator");
    expect(separator).toHaveAttribute("role", "separator");
  });

  it("renders minus icon", () => {
    render(
      <InputOTP maxLength={6}>
        <InputOTPSeparator data-testid="input-otp-separator" />
      </InputOTP>,
    );
    const separator = screen.getByTestId("input-otp-separator");
    const minusIcon = separator.querySelector('[data-testid="minus-icon"]');
    expect(minusIcon).toBeInTheDocument();
  });
});

describe("InputOTP Composition", () => {
  it("renders complete OTP input structure", () => {
    render(
      <InputOTP maxLength={6} data-testid="input-otp">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>,
    );

    const inputOTP = screen.getByTestId("input-otp");
    expect(inputOTP).toBeInTheDocument();

    const groups = inputOTP.querySelectorAll('[data-slot="input-otp-group"]');
    expect(groups).toHaveLength(2);

    const slots = inputOTP.querySelectorAll('[data-slot="input-otp-slot"]');
    expect(slots).toHaveLength(6);

    const separator = inputOTP.querySelector('[data-slot="input-otp-separator"]');
    expect(separator).toBeInTheDocument();
  });
});
