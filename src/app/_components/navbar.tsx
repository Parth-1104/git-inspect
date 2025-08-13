"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export function Navbar() {
  return (
    <header className="w-full border-b border-primary/20 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-sm bg-primary shadow-[0_0_24px_theme(colors.primary)]" />
            <span className="text-base font-semibold tracking-tight">Git Inspect</span>
          </Link>
        </div>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm font-medium">
            <li>
              <Link href="#product" className="text-muted-foreground transition-colors hover:text-foreground">
                Product
              </Link>
            </li>
            <li>
              <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
                Features
              </Link>
            </li>
            <li>
              <Link href="#solutions" className="text-muted-foreground transition-colors hover:text-foreground">
                Solutions
              </Link>
            </li>
            <li>
              <Link href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="#docs" className="text-muted-foreground transition-colors hover:text-foreground">
                Docs
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <SignedOut>
            <Button asChild variant="default" size="sm" className="px-4">
              <Link href="/sign-up">JOIN UP</Link>
            </Button>
            <Button asChild variant="secondary" size="sm" className="px-4">
              <Link href="/sign-in">LOGIN</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild variant="default" size="sm" className="px-4">
              <Link href="/dashboard">DASHBOARD</Link>
            </Button>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

