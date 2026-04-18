"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, ChevronLeft, Sparkles, Upload, Calendar, DollarSign, FileText, Info, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import ReferenceUploader from "@/components/order/ReferenceUploader"
import { createClient } from "@/lib/supabase/client"

const STEPS = [
  { number: 1, label: "Vision", icon: FileText, description: "Décrivez votre projet" },
  { number: 2, label: "Budget", icon: DollarSign, description: "Définissez vos contraintes" },
  { number: 3, label: "Références", icon: Upload, description: "Partagez vos inspirations" },
  { number: 4, label: "Confirmation", icon: Check, description: "Vérifiez et envoyez" },
]

const BUDGET_PRESETS = [
  { label: "Budget", range: "5,000 – 15,000 DA", min: "5000", max: "15000" },
  { label: "Intermédiaire", range: "15,000 – 40,000 DA", min: "15000", max: "40000" },
  { label: "Premium", range: "40,000 – 100,000 DA", min: "40000", max: "100000" },
  { label: "Luxe", range: "100,000+ DA", min: "100000", max: "" },
]

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
  const [selectedBudgetPreset, setSelectedBudgetPreset] = useState<number | null>(null)

  const supabase = createClient()

  const canGoNext = () => {
    if (step === 1) return title.trim().length > 0
    if (step === 2) return true // budget is optional
    if (step === 3) return true // references are optional
    return true
  }

  const handleBudgetPreset = (idx: number) => {
    const preset = BUDGET_PRESETS[idx]
    setSelectedBudgetPreset(idx)
    setMinPrice(preset.min)
    setMaxPrice(preset.max)
  }

  const handleSubmit = async () => {
    if (!couturiereId) { setErrorMsg("Aucune couturière sélectionnée."); return }
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
        const err = await res.json()
        throw new Error(err.error || "Erreur lors de la création")
      }
      const { order } = await res.json()
      if (referenceUrls.length > 0) {
        await supabase.from("references").update({ order_id: order.id }).in("file_url", referenceUrls)
      }
      router.push("/client")
    } catch (err: any) {
      setErrorMsg(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 border border-primary/15 rounded-full px-4 py-2 shadow-sm mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wide">Nouvelle Commande</span>
          </div>
          <h1 className="text-3xl font-black text-foreground">Décrivez votre projet</h1>
          <p className="text-muted-foreground mt-2 text-sm">Guidez votre couturière vers la création parfaite.</p>
        </motion.div>

        {/* Progress timeline */}
        <div className="flex items-center justify-center mb-10 relative">
          {/* Connecting line */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[calc(100%-80px)] h-0.5 bg-border z-0" />
          <div
            className="absolute top-5 left-[calc(50%-calc(var(--steps-width)/2))] h-0.5 bg-primary z-0 transition-all duration-500"
            style={{
              width: `calc((${step - 1} / 3) * (100% - 80px))`,
              left: `calc(40px + (100% - 80px) / 6)`,
            }}
          />

          <div className="flex items-start justify-between w-full max-w-md relative z-10">
            {STEPS.map((s) => {
              const Icon = s.icon
              const isCompleted = step > s.number
              const isCurrent = step === s.number
              return (
                <div key={s.number} className="flex flex-col items-center gap-2">
                  <motion.div
                    animate={{
                      scale: isCurrent ? 1.15 : 1,
                      backgroundColor: isCompleted ? "#10b981" : isCurrent ? "#4F46E5" : "#f4f4f5",
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className={`w-4.5 h-4.5 ${isCurrent ? "text-white" : "text-muted-foreground"}`} />
                    )}
                  </motion.div>
                  <span className={`text-[11px] font-bold hidden sm:block ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main card */}
        <motion.div
          layout
          className="bg-white rounded-3xl border border-border/50 shadow-2xl overflow-hidden"
        >
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-border/50">
            <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest mb-2">
              <span className="w-5 h-5 rounded-full primary-gradient flex items-center justify-center text-white text-[10px]">
                {step}
              </span>
              {STEPS[step - 1].description}
            </div>
            <h2 className="text-2xl font-black text-foreground">
              {step === 1 && "Décrivez votre tenue idéale"}
              {step === 2 && "Budget & Délai de livraison"}
              {step === 3 && "Joignez vos inspirations"}
              {step === 4 && "Récapitulatif de votre demande"}
            </h2>
          </div>

          {/* Card body */}
          <div className="p-8 min-h-[320px]">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-3 p-4 bg-destructive/8 text-destructive text-sm font-semibold rounded-2xl border border-destructive/20"
              >
                <Info className="w-4 h-4 shrink-0" />
                {errorMsg}
                <button onClick={() => setErrorMsg("")} className="ml-auto"><X className="w-4 h-4" /></button>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* Step 1 — Vision */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-black text-foreground">Titre de votre demande *</label>
                    <Input
                      placeholder="ex: Karakou en velours brodé pour mariage"
                      className="h-12 text-sm rounded-xl"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-foreground">Description détaillée</label>
                    <textarea
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all min-h-[160px] resize-none"
                      placeholder="Je souhaite une tenue deux pièces avec une veste karakou en velours rouge bordeaux, broderies dorées sur le col et les manches. Pantalon assorti en serwal. Taille 38. Pour un mariage en juin..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Plus vous êtes précis(e), meilleur sera le résultat.</p>
                  </div>
                </motion.div>
              )}

              {/* Step 2 — Budget */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  {/* Budget presets */}
                  <div className="space-y-3">
                    <label className="text-sm font-black text-foreground">Fourchette de budget</label>
                    <div className="grid grid-cols-2 gap-2">
                      {BUDGET_PRESETS.map((preset, i) => (
                        <button
                          key={i}
                          onClick={() => handleBudgetPreset(i)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedBudgetPreset === i
                              ? "border-primary bg-primary/6 shadow-sm"
                              : "border-border hover:border-primary/40 hover:bg-muted/50"
                          }`}
                        >
                          <p className={`text-sm font-bold ${selectedBudgetPreset === i ? "text-primary" : "text-foreground"}`}>
                            {preset.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{preset.range}</p>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      Ou entrez manuellement ci-dessous
                    </p>
                    <div className="flex items-center gap-4">
                      <Input type="number" placeholder="Min (DA)" className="h-11 text-sm rounded-xl" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                      <span className="text-muted-foreground font-medium">–</span>
                      <Input type="number" placeholder="Max (DA)" className="h-11 text-sm rounded-xl" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Date limite de livraison
                    </label>
                    <Input type="date" className="h-11 text-sm rounded-xl" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Laissez vide si vous êtes flexible sur le délai.</p>
                  </div>
                </motion.div>
              )}

              {/* Step 3 — References */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      Partagez des photos d&apos;inspiration — tenues, tissus, couleurs, broderies. Cela aide votre couturière à comprendre votre vision.
                    </p>
                  </div>
                  <ReferenceUploader onReferencesChange={(urls) => setReferenceUrls(urls)} />
                </motion.div>
              )}

              {/* Step 4 — Summary */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/15 rounded-2xl p-6 space-y-4">
                    <div>
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Titre</p>
                      <p className="font-bold text-foreground">{title || "—"}</p>
                    </div>
                    {description && (
                      <div>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Description</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-primary/10">
                      <div>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Budget</p>
                        <p className="font-bold text-foreground text-sm">
                          {minPrice || maxPrice ? `${minPrice || "?"} – ${maxPrice || "?"} DA` : "Non spécifié"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Délai</p>
                        <p className="font-bold text-foreground text-sm">
                          {deadline ? new Date(deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Flexible"}
                        </p>
                      </div>
                    </div>
                    {referenceUrls.length > 0 && (
                      <div>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Références</p>
                        <p className="text-sm text-foreground font-semibold">{referenceUrls.length} image{referenceUrls.length > 1 ? "s" : ""} jointe{referenceUrls.length > 1 ? "s" : ""}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-success/8 border border-success/20 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Prêt à être envoyé</p>
                      <p className="text-xs text-muted-foreground">La couturière vous répondra sous 24–48h.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card footer */}
          <div className="px-8 py-6 border-t border-border/50 flex items-center justify-between gap-4 bg-muted/20">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || isSubmitting}
              className="gap-2 font-bold rounded-xl h-12"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </Button>

            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div
                  key={s.number}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step === s.number ? "w-6 bg-primary" : step > s.number ? "w-3 bg-success" : "w-3 bg-muted"
                  }`}
                />
              ))}
            </div>

            {step < 4 ? (
              <Button
                variant="luxury"
                onClick={() => canGoNext() && setStep((s) => s + 1)}
                disabled={!canGoNext()}
                className="gap-2 font-bold rounded-xl h-12 px-6 shadow-md shadow-primary/20"
              >
                Continuer
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !title || !couturiereId}
                className="gap-2 font-bold rounded-xl h-12 px-6 bg-success text-white hover:bg-success/90 shadow-md shadow-emerald-200 border-0"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Envoyer la demande
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground"
        >
          {["🔒 Paiement sécurisé", "✅ Couturière vérifiée", "💯 Satisfait ou remboursé"].map((t) => (
            <span key={t} className="font-semibold">{t}</span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default function CreateOrderView() {
  return (
    <Suspense fallback={
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <CreateOrderForm />
    </Suspense>
  )
}
