
import { SolanaProvider } from "@/app/providers/SolanaProvider"
import { ProgramProvider } from "@/app/contexts/ProgramContext"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SolanaProvider>
          <ProgramProvider>
            {children}
          </ProgramProvider>
        </SolanaProvider>
        <Toaster />
      </body>
    </html>
  );
}