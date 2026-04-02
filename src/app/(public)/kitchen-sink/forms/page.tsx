"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, User, CreditCard, ChevronRight, Undo2, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { PageHeader, Section, GlassSurface } from "@/components/ui/container";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// --- Schemas (same as previous) ---
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

const purchaseSchema = z.object({
  cardName: z.string().min(2, "Name on card is required."),
  cardNumber: z.string().length(16, "Must be a 16-digit card number."),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format."),
  cvv: z.string().length(3, "Must be 3 digits."),
});

export default function FormsPage() {
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const purchaseForm = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { cardName: "", cardNumber: "", expiry: "", cvv: "" },
  });

  function onSubmit(values: unknown) {
    void values;
    toast.success("Design validated!", {
      description: "Premium form submission successful.",
    });
  }

  return (
    <div className="relative space-y-12 overflow-hidden pb-20">
      {/* Decorative background elements (similar to /login) */}
      <div className="bg-primary/10 absolute top-0 right-0 -z-10 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-brand-secondary/10 absolute bottom-40 left-0 -z-10 h-96 w-96 rounded-full blur-3xl" />

      <PageHeader
        title="Premium Form Patterns"
        description="Our high-end, glassmorphism-inspired form designs used for critical user authentication and financial flows."
      />

      <div className="space-y-32">
        {/* Auth Grid */}
        <Section spacing="none">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            {/* Premium Login */}
            <div className="space-y-6">
              <div className="px-2">
                <h3 className="font-heading text-2xl font-bold tracking-tight">Access Control</h3>
                <p className="text-muted-foreground text-sm">
                  Standardized glass layout for user authentication.
                </p>
              </div>
              <GlassSurface>
                <div className="mb-8 text-center sm:text-left">
                  <h2 className="font-heading text-foreground from-foreground to-foreground/60 bg-gradient-to-br bg-clip-text text-3xl font-extrabold tracking-tighter">
                    Fixtura Prime
                  </h2>
                  <p className="text-muted-foreground mt-1 text-xs font-medium">
                    Please enter your credentials below
                  </p>
                </div>

                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold tracking-wider uppercase opacity-70">
                            Email Identity
                          </FormLabel>
                          <FormControl>
                            <div className="group relative">
                              <User className="text-muted-foreground group-focus-within:text-primary absolute top-3.5 left-4 h-4 w-4 transition-colors" />
                              <Input placeholder="name@company.com" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-xs font-bold tracking-wider uppercase opacity-70">
                              Security Key
                            </FormLabel>
                            <span className="text-primary cursor-pointer text-[10px] font-bold tracking-widest uppercase hover:underline">
                              Forgot Account?
                            </span>
                          </div>
                          <FormControl>
                            <div className="group relative">
                              <Lock className="text-muted-foreground group-focus-within:text-primary absolute top-3.5 left-4 h-4 w-4 transition-colors" />
                              <Input type="password" placeholder="••••••••" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      variant="brand"
                      size="lg"
                      className="shadow-primary/20 mt-4 h-12 w-full text-base font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98]"
                    >
                      Authorize Session
                    </Button>
                  </form>
                </Form>
              </GlassSurface>
            </div>

            {/* Premium Recovery */}
            <div className="space-y-6 pt-12 lg:pt-0">
              <div className="px-2">
                <h3 className="font-heading text-2xl font-bold tracking-tight">
                  Identity Recovery
                </h3>
                <p className="text-muted-foreground text-sm">
                  Minimal state for password reset flows.
                </p>
              </div>
              <GlassSurface className="border-brand-secondary/30">
                <div className="mb-8 flex items-center gap-4">
                  <div className="bg-brand-secondary/15 text-brand-secondary flex size-12 items-center justify-center rounded-2xl">
                    <Undo2 className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold">Restore Access</h3>
                    <p className="text-muted-foreground text-xs">
                      Verification link will be sent to your inbox.
                    </p>
                  </div>
                </div>
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={forgotPasswordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold tracking-wider uppercase opacity-70">
                            Verified Email
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="name@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col gap-4">
                      <Button
                        type="submit"
                        variant="brand"
                        className="bg-brand-secondary hover:bg-brand-secondary/90 h-12 w-full font-bold"
                      >
                        Initiate Recovery
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-muted-foreground text-xs font-bold tracking-widest uppercase"
                      >
                        Return to Secure Entry
                      </Button>
                    </div>
                  </form>
                </Form>
              </GlassSurface>
            </div>
          </div>
        </Section>

        {/* Premium Checkout */}
        <Section spacing="none">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-foreground text-3xl font-bold">
              Premium Transaction Flow
            </h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm">
              High-trust purchase confirmation pattern with enhanced spatial awareness.
            </p>
          </div>

          <div className="border-border bg-card mx-auto grid max-w-4xl grid-cols-1 gap-0 overflow-hidden rounded-[2rem] border shadow-2xl md:grid-cols-5">
            {/* Left: Summary */}
            <div className="bg-muted/40 border-border shrink-0 border-r p-10 md:col-span-2">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="bg-success flex size-8 items-center justify-center rounded-lg text-white">
                    <ShieldCheck className="size-4" />
                  </div>
                  <span className="text-sm font-bold tracking-widest uppercase">
                    Encypted Checkout
                  </span>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                      Selected Plan
                    </h4>
                    <p className="font-heading text-primary text-xl font-bold italic">
                      Enterprise Scan Pro
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Billed Monthly</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Includes unlimited audits, enterprise API access, and dedicated support.
                    </p>
                  </div>
                </div>

                <div className="pt-20">
                  <div className="border-border flex items-end justify-between border-t pt-6">
                    <span className="text-muted-foreground text-sm">Monthly Total</span>
                    <span className="font-heading text-4xl font-black tracking-tighter tabular-nums">
                      $99<span className="text-muted-foreground text-sm font-normal">.00</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment Form */}
            <div className="bg-white p-10 md:col-span-3 dark:bg-black/20">
              <Form {...purchaseForm}>
                <form onSubmit={purchaseForm.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={purchaseForm.control}
                    name="cardName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold tracking-wider uppercase opacity-60">
                          Cardholder Identity
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="TRENT NIXON"
                            {...field}
                            className="font-mono tracking-wider uppercase"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={purchaseForm.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold tracking-wider uppercase opacity-60">
                          Financial Identifier
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CreditCard className="text-muted-foreground absolute top-3.5 right-4 h-4 w-4" />
                            <Input
                              placeholder="0000 0000 0000 0000"
                              {...field}
                              className="font-mono text-lg"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={purchaseForm.control}
                      name="expiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold tracking-wider uppercase opacity-60">
                            Valid Until
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="MM / YY"
                              {...field}
                              className="text-center font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={purchaseForm.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold tracking-wider uppercase opacity-60">
                            Security Key
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="***"
                              {...field}
                              className="text-center font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="brand"
                    size="lg"
                    className="shadow-primary/20 mt-10 h-14 w-full text-lg font-black tracking-[0.2em] uppercase shadow-2xl"
                  >
                    Commit Payment <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
