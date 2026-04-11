import Sidebar from "@/components/layout/Sidebar";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-sky-50/50">
      <Sidebar role="employee" />
      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}