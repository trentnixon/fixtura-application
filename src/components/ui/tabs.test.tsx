import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

// Mock @radix-ui/react-tabs
vi.mock("@radix-ui/react-tabs", () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid="tabs" {...props}>
      {children}
    </div>
  ),
  List: ({ children, ...props }: any) => (
    <div data-testid="tabs-list" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="tabs-trigger" {...props}>
      {children}
    </button>
  ),
  Content: ({ children, ...props }: any) => (
    <div data-testid="tabs-content" {...props}>
      {children}
    </div>
  ),
}));

describe("Tabs", () => {
  it("renders with default props", () => {
    render(
      <Tabs data-testid="tabs" defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.getByTestId("tabs-list")).toBeInTheDocument();
    expect(screen.getAllByTestId("tabs-trigger")).toHaveLength(2);
    expect(screen.getAllByTestId("tabs-content")).toHaveLength(2);
  });

  it("renders with controlled value", () => {
    render(
      <Tabs value="tab2" data-testid="tabs">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );
    const tabs = screen.getByTestId("tabs");
    expect(tabs).toBeInTheDocument();
  });

  it("renders list with correct attributes", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );
    const list = screen.getByTestId("list");
    expect(list).toBeInTheDocument();
  });

  it("renders trigger with correct attributes", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="trigger">
            Tab 1
          </TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Tab 1");
  });

  it("renders content with correct attributes", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="content">
          Content 1
        </TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );
    const content = screen.getByTestId("content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Content 1");
  });

  it("renders multiple triggers", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="trigger1">
            Tab 1
          </TabsTrigger>
          <TabsTrigger value="tab2" data-testid="trigger2">
            Tab 2
          </TabsTrigger>
          <TabsTrigger value="tab3" data-testid="trigger3">
            Tab 3
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("trigger1")).toBeInTheDocument();
    expect(screen.getByTestId("trigger2")).toBeInTheDocument();
    expect(screen.getByTestId("trigger3")).toBeInTheDocument();
    expect(screen.getByTestId("trigger1")).toHaveTextContent("Tab 1");
    expect(screen.getByTestId("trigger2")).toHaveTextContent("Tab 2");
    expect(screen.getByTestId("trigger3")).toHaveTextContent("Tab 3");
  });

  it("renders multiple content panels", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="content1">
          Content 1
        </TabsContent>
        <TabsContent value="tab2" data-testid="content2">
          Content 2
        </TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("content1")).toBeInTheDocument();
    expect(screen.getByTestId("content2")).toBeInTheDocument();
    expect(screen.getByTestId("content1")).toHaveTextContent("Content 1");
    expect(screen.getByTestId("content2")).toHaveTextContent("Content 2");
  });

  it("applies custom className to list", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList className="custom-class" data-testid="list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );
    const list = screen.getByTestId("list");
    expect(list).toHaveClass("custom-class");
  });

  it("applies custom className to trigger", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" className="custom-class" data-testid="trigger">
            Tab 1
          </TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toHaveClass("custom-class");
  });

  it("applies custom className to content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-class" data-testid="content">
          Content 1
        </TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );
    const content = screen.getByTestId("content");
    expect(content).toHaveClass("custom-class");
  });

  it("renders with complex content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Settings</TabsTrigger>
          <TabsTrigger value="tab2">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <div>
            <h3>Settings</h3>
            <p>Configure your application settings</p>
            <button>Save</button>
          </div>
        </TabsContent>
        <TabsContent value="tab2">
          <div>
            <h3>Profile</h3>
            <p>Manage your profile information</p>
            <button>Edit</button>
          </div>
        </TabsContent>
      </Tabs>,
    );
    expect(screen.getAllByText("Settings")).toHaveLength(2);
    expect(screen.getByText("Configure your application settings")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getAllByText("Profile")).toHaveLength(2);
    expect(screen.getByText("Manage your profile information")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders with disabled trigger", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled data-testid="disabled-trigger">
            Tab 2
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );
    const disabledTrigger = screen.getByTestId("disabled-trigger");
    expect(disabledTrigger).toBeInTheDocument();
  });
});
