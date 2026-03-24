import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

interface Props {
  title: string;
  content: string;
}

export default function LegalPageContent({ title, content }: Props) {
  const lines = content.split(/\n/);

  return (
    <div style={{ backgroundColor: "#0B0B0B", minHeight: "100vh" }}>
      <main style={{ paddingTop: "7rem", paddingBottom: "5rem" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.5rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#ffffff", marginBottom: "2rem" }}>
            {title}
          </h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {lines.map((line, i) => {
              if (!line.trim()) return <div key={i} style={{ height: "0.5rem" }} />;
              if (line.startsWith("### ")) {
                return (
                  <h2 key={i} style={{ fontSize: "1.125rem", fontWeight: 700, color: "#D4AF37", marginTop: "1.5rem", marginBottom: "0.25rem", paddingBottom: "0.375rem", borderBottom: "1px solid #1f1f1f" }}>
                    {line.replace("### ", "")}
                  </h2>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h2 key={i} style={{ fontSize: "1.375rem", fontWeight: 700, color: "#D4AF37", marginTop: "2rem", marginBottom: "0.375rem", paddingBottom: "0.375rem", borderBottom: "1px solid #1f1f1f" }}>
                    {line.replace("## ", "")}
                  </h2>
                );
              }
              if (line.startsWith("- ") || line.startsWith("• ")) {
                return (
                  <p key={i} style={{ color: "#cccccc", lineHeight: 1.8, paddingLeft: "1.25rem", position: "relative", margin: 0 }}>
                    <span style={{ position: "absolute", left: 0, color: "#D4AF37" }}>•</span>
                    {line.replace(/^[-•] /, "")}
                  </p>
                );
              }
              return (
                <p key={i} style={{ color: "#cccccc", lineHeight: 1.8, margin: 0 }}>
                  {line}
                </p>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
