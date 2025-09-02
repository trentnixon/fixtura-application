import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WrappedAvatar } from "./Avatar";

describe("WrappedAvatar", () => {
  it("renders with default props", () => {
    render(<WrappedAvatar data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    expect(avatar).toBeInTheDocument();
  });

  it("renders with fallback text", () => {
    render(<WrappedAvatar fallback="JD" data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    expect(avatar).toHaveTextContent("JD");
  });

  it("renders with default fallback when no fallback provided", () => {
    render(<WrappedAvatar data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    expect(avatar).toHaveTextContent("?");
  });

  it("renders with image when src provided", () => {
    render(<WrappedAvatar src="test.jpg" alt="Test Avatar" data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    // The Avatar component renders the image internally, so we just check the avatar exists
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent("?"); // Fallback text
  });

  it("applies correct size classes", () => {
    render(<WrappedAvatar size="sm" data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    const avatarElement = avatar.querySelector('[class*="size-8"]');
    expect(avatarElement).toBeInTheDocument();
  });

  it("applies correct size classes for md", () => {
    render(<WrappedAvatar size="md" data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    const avatarElement = avatar.querySelector('[class*="size-10"]');
    expect(avatarElement).toBeInTheDocument();
  });

  it("applies correct size classes for lg", () => {
    render(<WrappedAvatar size="lg" data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    const avatarElement = avatar.querySelector('[class*="size-12"]');
    expect(avatarElement).toBeInTheDocument();
  });

  it("applies correct size classes for xl", () => {
    render(<WrappedAvatar size="xl" data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    const avatarElement = avatar.querySelector('[class*="size-16"]');
    expect(avatarElement).toBeInTheDocument();
  });

  it("applies circle shape by default", () => {
    render(<WrappedAvatar data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    const avatarElement = avatar.querySelector('[class*="rounded-full"]');
    expect(avatarElement).toBeInTheDocument();
  });

  it("applies square shape when specified", () => {
    render(<WrappedAvatar shape="square" data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    const avatarElement = avatar.querySelector('[class*="rounded-md"]');
    expect(avatarElement).toBeInTheDocument();
  });

  it("renders status indicator for online", () => {
    render(<WrappedAvatar status="online" data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    const statusIndicator = avatar.querySelector('[class*="bg-emerald-500"]');
    expect(statusIndicator).toBeInTheDocument();
  });

  it("renders status indicator for offline", () => {
    render(<WrappedAvatar status="offline" data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    const statusIndicator = avatar.querySelector('[class*="bg-muted"]');
    expect(statusIndicator).toBeInTheDocument();
  });

  it("renders status indicator for busy", () => {
    render(<WrappedAvatar status="busy" data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    const statusIndicator = avatar.querySelector('[class*="bg-amber-500"]');
    expect(statusIndicator).toBeInTheDocument();
  });

  it("does not render status indicator when status is none", () => {
    render(<WrappedAvatar status="none" data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    // Check that no status indicator span exists
    const statusIndicator = avatar.querySelector('span[class*="absolute"]');
    expect(statusIndicator).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<WrappedAvatar className="custom-class" data-testid="wrapped-avatar" />);
    const avatar = screen.getByTestId("wrapped-avatar");
    expect(avatar).toHaveClass("custom-class");
  });

  it("renders with all props", () => {
    render(
      <WrappedAvatar
        src="test.jpg"
        alt="Test Avatar"
        fallback="JD"
        size="lg"
        shape="square"
        status="online"
        className="custom-class"
        data-testid="wrapped-avatar"
      />,
    );
    const avatar = screen.getByTestId("wrapped-avatar");
    expect(avatar).toHaveClass("custom-class");
    expect(avatar).toHaveTextContent("JD");
    // The Avatar component renders the image internally, so we just check the avatar exists
    expect(avatar).toBeInTheDocument();
    const avatarElement = avatar.querySelector('[class*="size-12"]');
    expect(avatarElement).toBeInTheDocument();
    const statusIndicator = avatar.querySelector('[class*="bg-emerald-500"]');
    expect(statusIndicator).toBeInTheDocument();
  });
});
