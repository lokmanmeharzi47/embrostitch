import Navbar from "@/components/navigation/Navbar"
import Footer from "@/components/landing/Footer"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  )
}
