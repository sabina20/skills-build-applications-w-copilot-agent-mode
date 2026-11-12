type Props = { title: string; description: string };
type ResourceProps = Props & {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
};

export function CapabilityCard({ title, description, loading, error, empty, emptyText, children }: ResourceProps) {
  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {loading ? <p role="status">Loading {title.toLowerCase()}...</p>
      : error ? <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>
        : empty ? <p>{emptyText}</p>
          : children}
  </div></section>;
}
