export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-rose-200 bg-white p-12 text-center">
      <h1 className="text-xl font-bold text-stone-800">{title}</h1>
      <p className="mt-2 text-stone-500">Tính năng này sẽ sớm có mặt.</p>
    </div>
  );
}
