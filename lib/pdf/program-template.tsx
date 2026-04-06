import {
  Document, Page, Text, View, StyleSheet, Font, pdf,
} from "@react-pdf/renderer";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

const C = {
  red:    "#7A0D2A",
  gold:   "#D4AF37",
  dark:   "#1A1A1A",
  gray:   "#4A4A4A",
  light:  "#F5F5F5",
  white:  "#FFFFFF",
  border: "#E0E0E0",
};

const S = StyleSheet.create({
  page:       { backgroundColor: C.white, fontFamily: "Helvetica", fontSize: 10, color: C.dark, paddingBottom: 60 },
  header:     { backgroundColor: C.red, padding: "28 40 20 40" },
  headerTop:  { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  brand:      { fontSize: 22, fontWeight: "bold", color: C.white, letterSpacing: 1 },
  brandSub:   { fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 3 },
  tagline:    { fontSize: 9, color: C.gold, fontWeight: "bold", textAlign: "right", marginTop: 4 },
  headerTitle:{ fontSize: 16, fontWeight: "bold", color: C.white, marginTop: 6 },
  headerMeta: { fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 3 },
  body:       { padding: "20 40" },
  section:    { marginBottom: 18 },
  sectionTitle:{ fontSize: 12, fontWeight: "bold", color: C.red, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1.5, borderBottomColor: C.gold },
  grid2:      { flexDirection: "row", gap: 12 },
  infoBox:    { flex: 1, backgroundColor: C.light, borderRadius: 6, padding: "10 12" },
  infoLabel:  { fontSize: 8, color: C.gray, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue:  { fontSize: 10, fontWeight: "bold", color: C.dark },
  programBox: { backgroundColor: C.light, borderRadius: 6, padding: "14 16", borderLeftWidth: 3, borderLeftColor: C.red },
  programText:{ fontSize: 9.5, lineHeight: 1.7, color: C.dark, whiteSpace: "pre-wrap" },
  footer:     { position: "absolute", bottom: 0, left: 0, right: 0, height: 40, backgroundColor: C.red, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 40 },
  footerText: { fontSize: 8, color: "rgba(255,255,255,0.7)" },
  badge:      { backgroundColor: C.gold, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:  { fontSize: 8, fontWeight: "bold", color: C.dark },
  divider:    { height: 1, backgroundColor: C.border, marginVertical: 12 },
  noteBox:    { backgroundColor: "#FFF9E6", borderRadius: 6, padding: "10 12", borderLeftWidth: 3, borderLeftColor: C.gold, marginTop: 8 },
  noteText:   { fontSize: 9, color: "#7A6000", lineHeight: 1.6 },
});

interface ProgramPDFProps {
  fullName: string;
  email: string;
  programType: string;
  programText: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  goal?: string;
  fitnessLevel?: string;
  sentAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  fitness:  "Fitness Programı",
  beslenme: "Beslenme Programı",
  combo:    "Fitness + Beslenme Programı",
};

export function ProgramPDFDocument(props: ProgramPDFProps) {
  const typeLabel = TYPE_LABELS[props.programType] || "Kişisel Program";
  const infoItems = [
    { label: "Ad Soyad", value: props.fullName },
    { label: "E-posta", value: props.email },
    { label: "Program Türü", value: typeLabel },
    { label: "Hazırlanma Tarihi", value: props.sentAt },
  ];
  const bodyItems = [
    props.age && { label: "Yaş", value: `${props.age}` },
    props.gender && { label: "Cinsiyet", value: props.gender === "erkek" ? "Erkek" : "Kadın" },
    props.height && { label: "Boy", value: `${props.height} cm` },
    props.weight && { label: "Kilo", value: `${props.weight} kg` },
    props.goal && { label: "Hedef", value: props.goal },
    props.fitnessLevel && { label: "Fitness Seviyesi", value: props.fitnessLevel },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <View style={S.headerTop}>
            <View>
              <Text style={S.brand}>MACHINE GYM</Text>
              <Text style={S.brandSub}>Bolu'nun Premium Fitness Salonu</Text>
            </View>
            <View style={S.badge}>
              <Text style={S.badgeText}>{typeLabel}</Text>
            </View>
          </View>
          <Text style={S.headerTitle}>Kişisel {typeLabel}</Text>
          <Text style={S.headerMeta}>Hazırlayan: Machine Gym Uzman Ekibi  •  {props.sentAt}</Text>
        </View>

        <View style={S.body}>
          {/* Kişi Bilgileri */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>Kişisel Bilgiler</Text>
            <View style={S.grid2}>
              {infoItems.map((item) => (
                <View key={item.label} style={S.infoBox}>
                  <Text style={S.infoLabel}>{item.label}</Text>
                  <Text style={S.infoValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Profil */}
          {bodyItems.length > 0 && (
            <View style={S.section}>
              <Text style={S.sectionTitle}>Profil Bilgileri</Text>
              <View style={S.grid2}>
                {bodyItems.map((item) => (
                  <View key={item.label} style={S.infoBox}>
                    <Text style={S.infoLabel}>{item.label}</Text>
                    <Text style={S.infoValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={S.divider} />

          {/* Program İçeriği */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>Programınız</Text>
            <View style={S.programBox}>
              <Text style={S.programText}>{props.programText}</Text>
            </View>
          </View>

          {/* Not */}
          <View style={S.noteBox}>
            <Text style={S.noteText}>
              Bu program Machine Gym uzman ekibi tarafından sizin için özel olarak hazırlanmıştır. Sağlık durumunuzdaki değişikliklerde programınızı güncelletmek için bizimle iletişime geçiniz.{"\n"}
              Tel: +90 374 270 14 55  •  WhatsApp: +90 374 270 14 55  •  instagram: @gymachinebolu
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={S.footer}>
          <Text style={S.footerText}>© Machine Gym — machinegym.com.tr</Text>
          <Text style={S.footerText}>Bu belge kişiye özeldir, paylaşılmaması önerilir.</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateProgramPDF(props: ProgramPDFProps): Promise<Buffer> {
  const doc = <ProgramPDFDocument {...props} />;
  const instance = pdf(doc);
  const blob = await instance.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
