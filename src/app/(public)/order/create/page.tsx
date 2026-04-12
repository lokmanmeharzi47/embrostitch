"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Check, Info, Paperclip, ChevronRight, ChevronLeft } from "lucide-react"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import ReferenceUploader from "@/components/order/ReferenceUploader"
import { createClient } from "@/lib/supabase/client"

function CreateOrderForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const couturiereId = searchParams.get("couturiereId")
  
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [deadline, setDeadline] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [referenceUrls, setReferenceUrls] = useState<string[]>([])
  
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!couturiereId) {
       setErrorMsg("Aucune couturière sélectionnée.");
       return;
    }
    setIsSubmitting(true)
    setErrorMsg("")
    
    try {
       const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             couturiere_id: couturiereId,
             title,
             description,
             price: parseFloat(maxPrice) || parseFloat(minPrice) || 0,
             delivery_date: deadline ? new Date(deadline).toISOString() : null
          })
       })
       
       if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || "Erreur lors de la création de la commande")
       }

       const { order } = await res.json()
       
       // Link references to this order
       if (referenceUrls.length > 0) {
           const { error: linkError } = await supabase
               .from("references")
               .update({ order_id: order.id })
               .in("file_url", referenceUrls)
           
           if (linkError) {
               console.error("Linking references failed:", linkError)
               // Non-blocking error for the user
           }
       }
       
       router.push("/client")
    } catch (err: any) {
       setErrorMsg(err.message)
       setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full flex items-center justify-center py-24">
      <div className="w-full max-w-2xl px-4 md:px-0">
             
             {/* Progress Bar */}
             <div className="mb-8 flex items-center justify-between max-w-sm mx-auto">
                {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= i ? 'bg-primary text-white shadow-md' : 'bg-muted text-muted-foreground'}`}>
                         {step > i ? <Check size={16} /> : i}
                      </div>
                   </div>
                ))}
             </div>
             
             <Card className="shadow-2xl premium-shadow border-border/50 bg-white">
                <CardHeader className="border-b border-border/50 p-6 md:p-10">
                   <div className="flex items-center gap-2 text-[#4F46E5] font-bold text-xs mb-3 uppercase tracking-[0.1em]">
                     {step === 1 && "Étape 1: La Vision"}
                     {step === 2 && "Étape 2: Budget & Délais"}
                     {step === 3 && "Étape 3: Références"}
                     {step === 4 && "Étape 4: Résumé"}
                   </div>
                   <CardTitle className="text-3xl font-extrabold text-[#111111] tracking-tight">
                      {step === 1 && "Décrivez votre tenue sur mesure"}
                      {step === 2 && "Définissez vos contraintes"}
                      {step === 3 && "Joignez vos inspirations"}
                      {step === 4 && "Confirmez votre demande"}
                   </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 md:p-8 min-h-[300px]">
                   
                   {errorMsg && (
                     <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm font-medium rounded-xl">
                       {errorMsg}
                     </div>
                   )}

                   {/* Step 1 Content */}
                   {step === 1 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                         <div className="space-y-2">
                            <label className="text-sm font-semibold">Titre de votre demande</label>
                            <Input 
                               placeholder="ex. Karakou en velours pour mariage" 
                               className="h-12" 
                               value={title}
                               onChange={(e) => setTitle(e.target.value)}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-sm font-semibold">Description détaillée</label>
                            <textarea 
                               className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all min-h-[150px] resize-none"
                               placeholder="Je recherche une tenue de deux pièces..."
                               value={description}
                               onChange={(e) => setDescription(e.target.value)}
                            />
                         </div>
                      </div>
                   )}

                   {/* Step 2 Content */}
                   {step === 2 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                         <div className="space-y-3">
                            <label className="text-sm font-semibold flex items-center gap-2">
                               Budget estimé (Optionnel) <Info size={14} className="text-muted-foreground" />
                            </label>
                            <div className="flex items-center gap-4">
                               <Input type="number" placeholder="Min (DA)" className="h-12" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                               <span className="text-muted-foreground">à</span>
                               <Input type="number" placeholder="Max (DA)" className="h-12" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                            </div>
                         </div>
                         
                         <div className="space-y-3">
                            <label className="text-sm font-semibold">Date limite de livraison</label>
                            <Input type="date" className="h-12" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                         </div>
                      </div>
                   )}

                   {/* Step 3 Content */}
                   {step === 3 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                         <ReferenceUploader 
                            onReferencesChange={(urls) => setReferenceUrls(urls)} 
                         />
                      </div>
                   )}

                   {/* Step 4 Content */}
                   {step === 4 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                         <div className="bg-muted p-6 rounded-2xl">
                             <h4 className="font-bold text-foreground">{title || "Sans Titre"}</h4>
                             <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                               {description || "Aucune description fournie."}
                             </p>
                             <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                   <p className="text-xs font-semibold text-muted-foreground uppercase">Budget</p>
                                   <p className="font-medium">
                                     {minPrice || maxPrice ? `${minPrice || 0} - ${maxPrice || minPrice} DA` : "Non spécifié"}
                                   </p>
                                </div>
                                <div>
                                   <p className="text-xs font-semibold text-muted-foreground uppercase">Délai</p>
                                   <p className="font-medium">{deadline ? new Date(deadline).toLocaleDateString("fr-FR") : "Flexible"}</p>
                                </div>
                             </div>
                         </div>
                      </div>
                   )}

                </CardContent>
                
                <CardFooter className="p-8 md:p-10 border-t border-border/50 flex justify-between items-center">
                   <Button 
                      variant="ghost" 
                      onClick={() => setStep(step > 1 ? step - 1 : 1)}
                      disabled={step === 1 || isSubmitting}
                      className="text-foreground hover:bg-muted font-bold px-6 h-14 rounded-2xl transition-all"
                   >
                      <ChevronLeft size={20} className="mr-2" /> Retour
                   </Button>
                   
                   {step < 4 ? (
                      <Button 
                        variant="default" 
                        onClick={() => setStep(step + 1)}
                        className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-8 h-14 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all hover:translate-x-1"
                      >
                         Continuer <ChevronRight size={20} className="ml-2" />
                      </Button>
                   ) : (
                      <Button 
                         variant="default" 
                         className="bg-success text-white hover:bg-success/90 hover:shadow-xl border-transparent px-10 h-14 rounded-2xl font-bold transition-all"
                         onClick={handleSubmit}
                         disabled={isSubmitting || !title || (!couturiereId)}
                      >
                         {isSubmitting ? "Envoi..." : "Soumettre la demande"} <Check size={20} className="ml-2" />
                      </Button>
                   )}
                </CardFooter>
             </Card>
             
          </div>
    </div>
  )
}

export default function CreateOrderView() {
   return (
      <Suspense fallback={<div className="w-full flex justify-center py-24"><div className="animate-pulse w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"/></div>}>
         <CreateOrderForm />
      </Suspense>
   )
}
