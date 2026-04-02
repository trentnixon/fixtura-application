import { HelpCircle, Mail, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";

import { ReturnToSignInAction } from "@/components/auth/actions";
import { AuthPageSection, PublicShellContainer } from "@/components/auth/layout";
import { AuthPageHeader, AuthSurface, SecondaryLinkGroup } from "@/components/auth/structure";

export const metadata = {
  title: "Help & Support",
  description: "Get assistance with your Fixtura account and technical issues.",
};

export default function HelpPage() {
  const supportOptions = [
    {
      title: "Knowledge Base",
      description: "Find answers in our documentation.",
      icon: HelpCircle,
      href: "#",
    },
    {
      title: "Email Support",
      description: "Get in touch via email.",
      icon: Mail,
      href: "mailto:support@fixtura.com.au",
    },
    {
      title: "Live Chat",
      description: "Message our team directly.",
      icon: MessageSquare,
      href: "#",
    },
    {
      title: "Phone Support",
      description: "Speak with a representative.",
      icon: Phone,
      href: "tel:+61000000000",
    },
  ];

  return (
    <PublicShellContainer className="max-w-4xl">
      <AuthPageSection className="space-y-12">
        <AuthPageHeader
          title="How can we help?"
          description="Choose a support pathway below or return to the members area."
        />

        <div className="grid gap-6 sm:grid-cols-2">
          {supportOptions.map((option) => (
            <Link
              key={option.title}
              href={option.href}
              className="group transition-all hover:scale-[1.02] active:scale-100"
            >
              <AuthSurface className="h-full !p-0">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="bg-brand/10 text-brand group-hover:bg-brand flex h-10 w-10 items-center justify-center rounded-lg transition-colors group-hover:text-white">
                      <option.icon className="h-5 w-5" />
                    </div>
                    <h3 className="group-hover:text-brand text-lg font-bold transition-colors">
                      {option.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </AuthSurface>
            </Link>
          ))}
        </div>

        <SecondaryLinkGroup className="border-muted/50 border-t pt-8">
          <ReturnToSignInAction label="Back to sign in" />
        </SecondaryLinkGroup>
      </AuthPageSection>
    </PublicShellContainer>
  );
}
