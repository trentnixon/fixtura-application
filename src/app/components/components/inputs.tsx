"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
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

export function InputsPanel() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [otp, setOtp] = React.useState("");
  const [text, setText] = React.useState("");
  const [enabled, setEnabled] = React.useState(false);
  const [volume, setVolume] = React.useState<number[]>([50]);
  const [option, setOption] = React.useState<string>("");

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Date Picker</h3>
        <p className="text-muted-foreground text-sm">Pick a date using the calendar.</p>
        <div className="rounded-md border p-3">
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
        </div>
      </div>

      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Input OTP</h3>
        <p className="text-muted-foreground text-sm">One-time password input.</p>
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Textarea</h3>
        <p className="text-muted-foreground text-sm">Multiline input.</p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write here..."
        />
      </div>

      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Switch</h3>
        <p className="text-muted-foreground text-sm">Toggle a boolean value.</p>
        <div className="flex items-center gap-3">
          <Switch checked={enabled} onCheckedChange={setEnabled} id="feature" />
          <label htmlFor="feature" className="text-sm">
            Enabled
          </label>
        </div>
      </div>

      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Slider</h3>
        <p className="text-muted-foreground text-sm">Adjust a numeric value.</p>
        <div className="flex items-center gap-3">
          <Slider value={volume} onValueChange={setVolume} className="max-w-xs" />
          <span className="text-sm">{volume[0]}</span>
        </div>
      </div>

      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Select</h3>
        <p className="text-muted-foreground text-sm">Choose from options.</p>
        <Select value={option} onValueChange={setOption}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
            <SelectItem value="c">Option C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          Reset
        </Button>
        <Button size="sm">Submit</Button>
      </div>
    </div>
  );
}
