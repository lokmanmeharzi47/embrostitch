"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Sparkles, X, MessageSquare, Send, ChevronRight } from "lucide-react"

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'ai'|'user', content: string }>>([
     { role: 'ai', content: "Hi! I'm your fashion assistant. Describe what you're looking for, for example: 'I want a modern karakou in Alger'." }
  ])
  const [inputVal, setInputVal] = useState("")

  const handleSend = () => {
     if (!inputVal.trim()) return
     
     // Add user message
     setMessages(prev => [...prev, { role: 'user', content: inputVal }])
     
     // Mock AI response for structural demonstration
     setTimeout(() => {
        setMessages(prev => [...prev, { 
           role: 'ai', 
           content: "I found perfect matches for you! Based on your request, I recommend Amina Fashion or Sara Creations." 
        }])
     }, 1000)
     
     setInputVal("")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
       
      {isOpen && (
         <div className="mb-4 w-80 md:w-96 bg-white border border-border shadow-2xl premium-shadow rounded-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark p-4 flex justify-between items-center text-white">
               <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur">
                     <Sparkles size={18} className="text-accent fill-accent" />
                  </div>
                  <div>
                     <h3 className="font-bold text-sm">Style Match AI</h3>
                     <p className="text-[10px] text-white/70">Powered by 刺繍 Crafts</p>
                  </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition-colors"><X size={20} /></button>
            </div>
            
            {/* Body */}
            <div className="h-80 bg-[#FAFAFA] overflow-y-auto p-4 flex flex-col gap-4">
               {messages.map((m, idx) => (
                  <div key={idx} className={`flex max-w-[85%] ${m.role === 'user' ? 'self-end justify-end' : 'self-start'}`}>
                      <div className={`p-3 text-sm shadow-sm ${m.role === 'user' ? 'bg-muted rounded-2xl rounded-br-sm' : 'bg-white border rounded-2xl rounded-bl-sm'} `}>
                         {m.content}
                         {m.role === 'ai' && idx === messages.length - 1 && messages.length > 1 && (
                            <div className="mt-3 bg-secondary p-2 rounded-xl flex items-center justify-between cursor-pointer hover:bg-muted transition-colors border">
                               <div className="flex flex-col">
                                  <span className="text-xs font-bold text-foreground">View Matches (3)</span>
                                  <span className="text-[10px] text-muted-foreground">in Alger</span>
                               </div>
                               <ChevronRight size={14} className="text-muted-foreground" />
                            </div>
                         )}
                      </div>
                  </div>
               ))}
            </div>
            
            {/* Input Footer */}
            <div className="p-3 bg-white border-t flex items-center gap-2">
               <Input 
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for matches..." 
                  className="rounded-full h-10 border-input bg-muted focus-visible:ring-primary shadow-inner" 
               />
               <Button onClick={handleSend} variant="luxury" size="icon" className="h-10 w-10 shrink-0 rounded-full bg-primary hover:-translate-y-0.5 shadow-md">
                  <Send size={16} />
               </Button>
            </div>
         </div>
      )}

      {/* Floating Button */}
      <button 
         onClick={() => setIsOpen(!isOpen)}
         className={`h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${isOpen ? 'bg-muted text-foreground' : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-primary/30 premium-shadow'}`}
      >
         {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
         {!isOpen && <Sparkles size={12} className="absolute top-3 right-3 text-accent fill-accent animate-pulse" />}
      </button>

    </div>
  )
}
