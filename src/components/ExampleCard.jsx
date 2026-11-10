export default function ExampleCard({ title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:border-violet-400 hover:shadow-lg transition"
    >
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <p className="text-gray-500 text-sm mt-2">{description}</p>
    </button>
  );
}
