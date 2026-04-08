export const metadata = {
  title: 'Presocio — Instagram Reel Auto-Publisher',
  description: 'Generate and publish Instagram Reels automatically',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#0a0a0f',
          color: '#e0e0e0',
        }}
      >
        {children}
      </body>
    </html>
  );
}
