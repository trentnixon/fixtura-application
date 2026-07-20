import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { accountSummaryFixture } from "@/lib/account/account-summary-fixture";

import {
  accountMeQueryData,
  baseBrandingPayload,
  createWizardTestWrapper,
  lookupThemes,
} from "./_test/wizard-test-fixtures";
import { WizardStepBranding, type WizardStepBrandingHandle } from "./wizard-step-branding";

const useAccountBranding = vi.hoisted(() => vi.fn());
const useAccountMe = vi.hoisted(() => vi.fn());
const useOnboardingLookupThemes = vi.hoisted(() => vi.fn());
const useUpdateOnboardingStep2 = vi.hoisted(() => vi.fn());
const useCreateOnboardingStep2Theme = vi.hoisted(() => vi.fn());
const usePatchAccountBranding = vi.hoisted(() => vi.fn());
const mockOnLogoComplete = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useAccountBranding", () => ({
  useAccountBranding,
  isAccountBrandingGatewayRedirect: () => false,
}));

vi.mock("@/lib/api/hooks/account/useAccountMe", () => ({
  useAccountMe,
}));

vi.mock("@/lib/api/hooks/account/useOnboardingLookupThemes", () => ({
  useOnboardingLookupThemes,
}));

vi.mock("@/lib/api/hooks/account/useUpdateOnboardingStep2", () => ({
  useUpdateOnboardingStep2,
}));

vi.mock("@/lib/api/hooks/account/useCreateOnboardingStep2Theme", () => ({
  useCreateOnboardingStep2Theme,
}));

vi.mock("@/lib/api/hooks/account/usePatchAccountBranding", () => ({
  usePatchAccountBranding,
}));

vi.mock("@/components/media/image-uploader-crop", () => ({
  ImageUploaderCrop: ({ onComplete }: { onComplete: (payload: { file: File }) => void }) => (
    <button
      type="button"
      onClick={() => {
        mockOnLogoComplete();
        onComplete({ file: new File(["logo"], "logo.png", { type: "image/png" }) });
      }}
    >
      mock-upload-logo
    </button>
  ),
}));

function renderBrandingStep(branding = baseBrandingPayload()) {
  const ref = createRef<WizardStepBrandingHandle>();
  const onContinue = vi.fn();
  const { Wrapper } = createWizardTestWrapper();

  useAccountBranding.mockReturnValue({
    data: branding,
    isPending: false,
    isError: false,
  });

  render(
    <Wrapper>
      <WizardStepBranding
        ref={ref}
        accountId="1"
        onContinue={onContinue}
        onPendingChange={vi.fn()}
      />
      <button type="button" onClick={() => void ref.current?.submit()}>
        submit-step
      </button>
    </Wrapper>,
  );

  return { ref, onContinue };
}

describe("WizardStepBranding", () => {
  const updateMutateAsync = vi.fn();
  const createThemeMutateAsync = vi.fn();
  const patchBrandingMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnLogoComplete.mockReset();
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:mock"),
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    updateMutateAsync.mockResolvedValue({ data: {} });
    createThemeMutateAsync.mockResolvedValue({ data: { id: 555 } });
    patchBrandingMutateAsync.mockResolvedValue({ data: { accountId: 1, themeId: 555 } });

    useAccountMe.mockReturnValue({
      data: accountMeQueryData({
        accounts: [
          accountSummaryFixture({
            id: 1,
            FirstName: "Jane",
            LastName: "Doe",
            onboardingOrganisationName: "Metro Association",
          }),
        ],
      }),
      isPending: false,
      isError: false,
    });
    useOnboardingLookupThemes.mockReturnValue({
      data: { data: lookupThemes },
      isPending: false,
      isError: false,
      isSuccess: true,
    });
    useUpdateOnboardingStep2.mockReturnValue({
      mutateAsync: updateMutateAsync,
      isPending: false,
      isError: false,
    });
    useCreateOnboardingStep2Theme.mockReturnValue({
      mutateAsync: createThemeMutateAsync,
      isPending: false,
      isError: false,
    });
    usePatchAccountBranding.mockReturnValue({
      mutateAsync: patchBrandingMutateAsync,
      isPending: false,
      isError: false,
    });
  });

  it("PATCHes theme-only changes in premade mode", async () => {
    const { onContinue } = renderBrandingStep();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Preset themes/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Preset themes/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Bold/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Bold/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({ body: { themeId: 102 } });
    });
    expect(onContinue).toHaveBeenCalled();
  });

  it("skips PATCH when branding is unchanged", async () => {
    const { onContinue } = renderBrandingStep(
      baseBrandingPayload({
        theme: {
          id: 101,
          name: "Classic",
          theme: {
            primary: "#79001F",
            secondary: "#FDBC2C",
            dark: "#0F172A",
            white: "#FFFFFF",
          },
        },
        onboardingLogo: {
          id: 9,
          url: "https://example.com/logo.png",
          width: null,
          height: null,
          mime: "image/png",
          alternativeText: null,
        },
      }),
    );

    await waitFor(() => {
      expect(screen.getByText(/upload and crop your organisation logo/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(onContinue).toHaveBeenCalled();
    });
    expect(updateMutateAsync).not.toHaveBeenCalled();
  });

  it("uploads logo and PATCHes step 2 when a new file is added", async () => {
    const { onContinue } = renderBrandingStep();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /mock-upload-logo/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /mock-upload-logo/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          file: expect.any(File),
          body: {},
        }),
      );
    });
    expect(onContinue).toHaveBeenCalled();
  });

  it("creates custom theme then PATCHes when colours change", async () => {
    const { onContinue } = renderBrandingStep(
      baseBrandingPayload({
        theme: {
          id: 999,
          name: "Custom",
          theme: {
            primary: "#111111",
            secondary: "#222222",
            dark: "#0F172A",
            white: "#FFFFFF",
          },
        },
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^primary$/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/^primary$/i), {
      target: { value: "#123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(createThemeMutateAsync).toHaveBeenCalled();
      expect(updateMutateAsync).toHaveBeenCalledWith({ body: { themeId: 555 } });
      expect(patchBrandingMutateAsync).toHaveBeenCalledWith({
        themeId: 555,
        palette: { primary: "#123456", secondary: "#222222" },
        theme: {
          themeId: 555,
          primary: "#123456",
          secondary: "#222222",
          dark: "#111",
          white: "#FFF",
        },
      });
    });
    expect(onContinue).toHaveBeenCalled();
  });

  it("PATCHes with themeId when custom theme create returns CMS themeId shape", async () => {
    createThemeMutateAsync.mockResolvedValue({ data: { themeId: 777 } });
    const { onContinue } = renderBrandingStep(
      baseBrandingPayload({
        theme: {
          id: 101,
          name: "Classic",
          theme: {
            primary: "#79001F",
            secondary: "#FDBC2C",
            dark: "#0F172A",
            white: "#FFFFFF",
          },
        },
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^primary$/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/^primary$/i), {
      target: { value: "#123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(createThemeMutateAsync).toHaveBeenCalled();
      expect(updateMutateAsync).toHaveBeenCalledWith({ body: { themeId: 777 } });
      expect(patchBrandingMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          themeId: 777,
          palette: { primary: "#123456", secondary: "#FDBC2C" },
        }),
      );
    });
    expect(onContinue).toHaveBeenCalled();
  });

  it("does not continue when custom theme create response is missing a theme id", async () => {
    createThemeMutateAsync.mockResolvedValue({ data: {} });
    const { onContinue } = renderBrandingStep(
      baseBrandingPayload({
        theme: {
          id: 101,
          name: "Classic",
          theme: {
            primary: "#79001F",
            secondary: "#FDBC2C",
            dark: "#0F172A",
            white: "#FFFFFF",
          },
        },
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^primary$/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/^primary$/i), {
      target: { value: "#123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(screen.getByText(/theme was created, but its id was missing/i)).toBeInTheDocument();
    });
    expect(updateMutateAsync).not.toHaveBeenCalled();
    expect(patchBrandingMutateAsync).not.toHaveBeenCalled();
    expect(onContinue).not.toHaveBeenCalled();
  });

  it("does not continue when custom colour branding save fails", async () => {
    patchBrandingMutateAsync.mockRejectedValue(new Error("Branding save failed."));
    const { onContinue } = renderBrandingStep(
      baseBrandingPayload({
        theme: {
          id: 999,
          name: "Custom",
          theme: {
            primary: "#111111",
            secondary: "#222222",
            dark: "#0F172A",
            white: "#FFFFFF",
          },
        },
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^primary$/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/^primary$/i), {
      target: { value: "#123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(screen.getByText(/Branding save failed/i)).toBeInTheDocument();
    });
    expect(updateMutateAsync).toHaveBeenCalledWith({ body: { themeId: 555 } });
    expect(onContinue).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid custom colours", async () => {
    const { onContinue } = renderBrandingStep(
      baseBrandingPayload({
        theme: {
          id: 999,
          name: "Custom",
          theme: {
            primary: "#111111",
            secondary: "#222222",
            dark: "#0F172A",
            white: "#FFFFFF",
          },
        },
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^primary$/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/^primary$/i), {
      target: { value: "not-hex" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    expect(screen.getByText(/Enter valid primary and secondary HEX colours/i)).toBeInTheDocument();
    expect(onContinue).not.toHaveBeenCalled();
  });

  it("shows branding load error", () => {
    useAccountBranding.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    });

    const { Wrapper } = createWizardTestWrapper();
    render(
      <Wrapper>
        <WizardStepBranding accountId="1" onContinue={vi.fn()} />
      </Wrapper>,
    );

    expect(screen.getByText(/could not load branding/i)).toBeInTheDocument();
  });

  it("surfaces mutation failures in InlineAlert", async () => {
    updateMutateAsync.mockRejectedValue(new Error("Upload failed."));
    const { onContinue } = renderBrandingStep();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Preset themes/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Preset themes/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Bold/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Bold/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit-step/i }));

    await waitFor(() => {
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
    });
    expect(onContinue).not.toHaveBeenCalled();
  });
});
