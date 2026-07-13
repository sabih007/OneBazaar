export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-md border border-line bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        {children}
      </div>
    </div>
  );
}
