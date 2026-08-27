import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <h1 className="font-serif text-3xl font-semibold">Sign in to write</h1>
      <p className="mt-2 text-sm text-muted">Email and password. This door is only for you.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
