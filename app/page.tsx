import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { ContactUs } from "@/components/contact-us";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Minimalist Navigation Bar */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-transparent backdrop-blur-sm">
        <div className="w-full flex justify-between items-center px-4">
          <Link href="/" className="text-xl font-bold tracking-tight">BajuNow</Link>
          <div className="flex items-center gap-2">
            {!hasEnvVars ? <EnvVarWarning /> : <Suspense><AuthButton /></Suspense>}
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full flex justify-center items-center py-8 px-8">
      <Hero />
      </section>

      {/* Features Section */}
      <section className="w-full flex justify-center items-center py-8 px-8"> 
      <Features />
      </section>

      {/* Contact Us Section */}
      <section className="w-full flex justify-center items-center py-8 px-8">
      <ContactUs />
      </section>

      {/* Minimalist Footer */}
      <footer className="w-full border-t py-8 mt-auto">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between px-4 gap-4">
          <p className="text-xs text-muted-foreground">© 2025 BajuNow — All rights reserved</p>
          <div className="flex items-center gap-4">
            <a className="text-muted-foreground hover:underline" href="#">Instagram</a>
            <a className="text-muted-foreground hover:underline" href="#">Twitter</a>
            <a className="text-muted-foreground hover:underline" href="#">Facebook</a>
            <ThemeSwitcher />
          </div>
        </div>
      </footer>
    </main>
  );
}
