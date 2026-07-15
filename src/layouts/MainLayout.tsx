type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0F172A",
        color: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}