export default function InfoCard({ title, children }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      {children}
    </div>
  );
}
