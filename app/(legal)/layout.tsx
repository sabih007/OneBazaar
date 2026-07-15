export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-app max-w-3xl py-12">
      <article className="prose-legal">{children}</article>
    </div>
  );
}
