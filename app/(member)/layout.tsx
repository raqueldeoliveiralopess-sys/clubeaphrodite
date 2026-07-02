import NavBar from "@/components/NavBar";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-pergaminho">
      <NavBar />
      <main>{children}</main>
    </div>
  );
}
