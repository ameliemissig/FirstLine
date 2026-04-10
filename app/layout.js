export const metadata = {
  title: "First Line — cold DM generator",
  description: "Drop your resume, pick a company, get a LinkedIn DM that doesn't sound like a template.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
