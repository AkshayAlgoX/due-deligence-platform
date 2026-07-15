export default function Loader({
  text = "Loading...",
}) {
  return (
    <div className="flex flex-col justify-center items-center gap-3 py-10">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

      <p className="text-gray-500">
        {text}
      </p>
    </div>
  );
}