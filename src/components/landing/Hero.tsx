import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Search, MapPin, Scissors } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] opacity-50 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-50 -translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
          <span>✨ The #1 Couture Marketplace in Algeria</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mb-6">
          Find the perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">couturière</span> for your unique style.
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
          Connect with expert fashion professionals across Algeria. From elegant Karakous to modern daily wear, bring your vision to life.
        </p>

        {/* Smart Search Bar */}
        <div className="w-full max-w-4xl bg-white rounded-2xl md:rounded-full p-2 md:p-3 shadow-xl premium-shadow border flex flex-col md:flex-row items-center gap-2">
          <div className="flex-1 flex items-center w-full px-4 py-2 border-b md:border-b-0 md:border-r border-border">
            <MapPin className="text-muted-foreground mr-3 flex-shrink-0" size={20} />
            <Input 
              type="text" 
              placeholder="Where? (e.g. Alger, Oran)" 
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-auto"
            />
          </div>
          <div className="flex-1 flex items-center w-full px-4 py-2 border-b md:border-b-0 md:border-r border-border">
            <Scissors className="text-muted-foreground mr-3 flex-shrink-0" size={20} />
            <Input 
              type="text" 
              placeholder="What? (Karakou, Robe...)" 
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-auto"
            />
          </div>
          <div className="w-full md:w-auto px-2 pt-2 md:pt-0">
            <Button size="lg" variant="luxury" className="w-full md:w-auto rounded-xl md:rounded-full px-8 gap-2">
              <Search size={18} />
              <span className="md:hidden">Search</span>
            </Button>
          </div>
        </div>

        {/* Key metrics / Social Proof */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 text-muted-foreground">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground">500+</span>
            <span className="text-sm font-medium mt-1">Verified Pros</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground">10k+</span>
            <span className="text-sm font-medium mt-1">Orders Completed</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground">4.9/5</span>
            <span className="text-sm font-medium mt-1">Average Rating</span>
          </div>
        </div>
      </div>
    </section>
  )
}
