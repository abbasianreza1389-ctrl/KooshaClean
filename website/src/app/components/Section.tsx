export default function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      {children}
    </section>
  );
}
