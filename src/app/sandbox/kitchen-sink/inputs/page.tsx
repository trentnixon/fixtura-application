"use client";

import { format } from "date-fns";
import { CalendarIcon, Fingerprint } from "lucide-react";
import * as React from "react";

import {
  TypographyH2,
  TypographyH4,
  TypographyLarge,
  TypographyMuted,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { PageHeader, Section, Surface, GlassSurface } from "@/components/ui/container";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function InputsPage() {
  const [date, setDate] = React.useState<Date>();

  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="Input & Control Gallery"
        description="Advanced form controls and interactive primitives designed for high-density dashboard environments."
      />

      <div className="space-y-24">
        {/* Date & Time Section */}
        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Date Selection</TypographyH2>
            <TypographyMuted className="mt-1">
              Calendar-based triggers for date ranges and audit scheduling.
            </TypographyMuted>
          </div>
          <Surface className="max-w-md">
            <div className="space-y-4">
              <Label>Target Audit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "h-11 w-full justify-start rounded-xl text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
              <TypographyMuted className="pl-1 text-[10px] font-bold tracking-widest uppercase">
                Audit occurs at 12:00 AM AEST on selected date.
              </TypographyMuted>
            </div>
          </Surface>
        </Section>

        {/* Security / OTP Section */}
        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Secure Verification</TypographyH2>
            <TypographyMuted className="mt-1">
              One-time password interface for two-factor authentication.
            </TypographyMuted>
          </div>
          <GlassSurface className="border-primary/20 max-w-md">
            <div className="flex flex-col items-center space-y-6">
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                <Fingerprint className="size-6" />
              </div>
              <div className="space-y-1 text-center">
                <TypographyH4 className="font-bold italic">Verify Account</TypographyH4>
                <TypographyMuted className="text-xs">
                  Enter the 6-digit code sent to your mobile.
                </TypographyMuted>
              </div>
              <InputOTP maxLength={6}>
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
              </InputOTP>
              <Button variant="link" className="text-primary text-xs font-bold">
                Resend Code
              </Button>
            </div>
          </GlassSurface>
        </Section>

        {/* Controls (Switch/Slider/Select) */}
        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Interactive Controls</TypographyH2>
            <TypographyMuted className="mt-1">
              Refined Boolean and numeric adjustment components.
            </TypographyMuted>
          </div>
          <div className="grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {/* Switches & Selects */}
            <Surface className="space-y-8">
              <div className="space-y-4">
                <Label>Platform Configuration</Label>
                <div className="space-y-4">
                  <div className="bg-muted/20 flex items-center justify-between rounded-xl border p-4">
                    <div className="space-y-0.5">
                      <TypographyLarge className="text-sm font-semibold">
                        Enable Deep Scan
                      </TypographyLarge>
                      <TypographyMuted className="text-[10px]">
                        Analyze shadow DOM assets.
                      </TypographyMuted>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="bg-muted/20 flex items-center justify-between rounded-xl border p-4">
                    <div className="space-y-0.5">
                      <TypographyLarge className="text-sm font-semibold">
                        Public Log
                      </TypographyLarge>
                      <TypographyMuted className="text-[10px]">
                        Allow guest viewing of results.
                      </TypographyMuted>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Report Priority</Label>
                <Select defaultValue="medium">
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Standard Priority</SelectItem>
                    <SelectItem value="high">Urgent Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Surface>

            {/* Slider & Textarea */}
            <Surface className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-end justify-between">
                  <Label>Scan Depth Threshold</Label>
                  <span className="text-primary font-mono text-xs font-bold">75%</span>
                </div>
                <Slider defaultValue={[75]} max={100} step={1} />
                <TypographyMuted className="text-[10px] leading-relaxed italic">
                  Higher thresholds increase audit duration but provide more comprehensive coverage
                  of dynamic assets.
                </TypographyMuted>
              </div>

              <div className="space-y-3">
                <Label>Developer Notes</Label>
                <Textarea
                  placeholder="Enter internal project notes..."
                  className="min-h-[120px] rounded-xl"
                />
              </div>
            </Surface>
          </div>
        </Section>
      </div>
    </div>
  );
}
