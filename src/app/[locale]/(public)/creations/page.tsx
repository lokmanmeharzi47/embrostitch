"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Sparkles, Heart, Share2, Search, Filter, Loader2, Camera } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface Creation {
  id: string;
  title: string;
  creator: string;
  image: string;
  category: string;
  likes: number;
  creator_avatar?: string;
}

export default function CreationsPage() {
  const [creations, setCreations] = useState<Creation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const fetchCreations = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("couturiere_profiles")
          .select(`
            id, portfolio_images, category,
            profiles!id (first_name, last_name, avatar_url)
          `)
          .not("portfolio_images", "is", null);

        if (error) throw error;

        const flattenedCreations: Creation[] = (data || []).flatMap((profile: any) => {
          const profileInfo = Array.isArray(profile.profiles) ? profile.profiles[0] : profile.profiles;
          return (profile.portfolio_images || []).map((img: string, index: number) => ({
            id: `${profile.id}-${index}`,
            title: `Artisanal Piece #${index + 1}`,
            creator: `${profileInfo?.first_name || "Artisan"} ${profileInfo?.last_name || ""}`,
            image: img,
            category: profile.category || "Traditional",
            likes: Math.floor(Math.random() * 200) + 50,
            creator_avatar: profileInfo?.avatar_url
          }))
        });

        // Shuffle for variety
        setCreations(flattenedCreations.sort(() => Math.random() - 0.5));
      } catch (err) {
        console.error("Error fetching creations:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCreations();
  }, [supabase]);

  const filteredCreations = creations.filter(c => {
    const matchesCategory = activeCategory === "All" || c.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = c.creator.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", "Traditional", "Modern", "Wedding", "Accessories"];

  return (
    <div className="min-h-screen bg-[#fafafa] pt-8 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="max-w-3xl mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-primary mb-4"
          >
            <Sparkles size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Inspiration Gallery</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6"
          >
            Masterpiece <span className="text-primary italic">Creations</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium"
          >
            Explore the finest hand-crafted garments and embroidery from our community of elite creators. 
            Each piece is a testament to heritage and modern luxury.
          </motion.p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 px-4 shadow-sm border-b border-border/20 pb-12">
          <div className="relative w-full md:max-w-xl group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={22} />
            <Input 
              placeholder="Search by creator or title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-16 bg-white rounded-[2rem] border-none shadow-xl shadow-zinc-200/50 focus:ring-4 focus:ring-primary/10 text-lg transition-all"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            {categories.map((cat, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (i * 0.05) }}
                key={cat}
              >
                <Button 
                  onClick={() => setActiveCategory(cat)}
                  variant={activeCategory === cat ? "primary" : "ghost"}
                  className={cn(
                    "rounded-2xl px-8 h-12 shadow-sm shrink-0 font-semibold transition-all",
                    activeCategory !== cat && "bg-white hover:bg-zinc-100"
                  )}
                >
                  {cat}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="text-primary"
             >
                <Sparkles size={48} />
             </motion.div>
             <p className="text-muted-foreground font-medium animate-pulse">Curating masterpieces...</p>
          </div>
        ) : filteredCreations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
            <AnimatePresence mode="popLayout">
              {filteredCreations.map((item, i) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group relative cursor-pointer"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] bg-zinc-200 shadow-2xl shadow-zinc-300/20">
                    <Image 
                      src={item.image} 
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 427px"
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    
                    <div className="absolute inset-0 p-10 flex flex-col justify-end translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="luxury" className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                          {item.category}
                        </Badge>
                        <Badge variant="luxury" className="bg-primary/20 border-primary/30 text-primary px-3 py-1.5">
                           <Heart size={14} className="fill-current" />
                        </Badge>
                      </div>
                      
                      <h3 className="text-3xl font-bold text-white mb-3 leading-tight tracking-tight">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-2">
                        <Link href={`/profile/${item.id.split('-')[0]}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-white border border-white/20 overflow-hidden relative">
                                 <Image 
                                    src={item.creator_avatar || `https://i.pravatar.cc/100?u=${item.creator}`} 
                                    fill 
                                    sizes="40px"
                                    alt={item.creator} 
                                    className="object-cover" 
                                 />
                            </div>
                            <p className="text-white font-semibold text-lg">{item.creator}</p>
                        </Link>
                        <Button size="icon" variant="ghost" className="rounded-full h-12 w-12 bg-white/10 text-white hover:bg-primary hover:text-white border border-white/10 transition-all">
                            <Share2 size={20} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Camera size={48} className="text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No creations found</h3>
            <p className="text-muted-foreground max-w-sm">Try adjusting your filters or search keywords to find what you&apos;re looking for.</p>
            <Button variant="outline" className="mt-8 rounded-full px-8" onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}>
              Clear all filters
            </Button>
          </div>
        )}
        
        {/* Footer CTA */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-32 rounded-[4rem] bg-zinc-900 overflow-hidden relative p-16 md:p-24 text-center"
        >
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <Image 
                    src="/fabric-texture.png" 
                    fill 
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    alt="Fabric texture" 
                    className="object-cover mix-blend-overlay" 
                />
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white mb-8 shadow-xl shadow-primary/20">
                    <Sparkles size={24} />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    Ready to showcase your talent?
                </h2>
                <p className="text-zinc-400 text-lg mb-10 leading-relaxed font-medium">
                    Join Algerian&apos;s most exclusive community of artisans and reach clients who value true craftsmanship.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register?role=creator">
                        <Button variant="luxury" size="lg" className="rounded-full px-12 h-16 text-lg font-bold shadow-2xl bg-white text-black hover:bg-zinc-200">
                            Join as Creator
                        </Button>
                    </Link>
                    <Button variant="ghost" size="lg" className="rounded-full px-12 h-16 text-lg font-bold text-white hover:bg-white/5 border border-white/10">
                        Learn More
                    </Button>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  )
}
