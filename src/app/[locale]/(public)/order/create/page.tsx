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
  { number: 1, label: "Vision", description: "Describe your project" },
  { number: 2, label: "Details", description: "Budget & Timeline" },
  { number: 3, label: "References", description: "Visual inspiration" },
  { number: 4, label: "Review", description: "Final confirmation" },
]

const BUDGET_PRESETS = [
  { label: "Essential", range: "5,000 – 15,000 DA", min: "5000", max: "15000" },
  { label: "Premium", range: "15,000 – 40,000 DA", min: "15000", max: "40000" },
  { label: "Luxury", range: "40,000 – 100,000 DA", min: "40000", max: "100000" },
  { label: "Couture", range: "100,000+ DA", min: "100000", max: "" },
]

function CreateOrderForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const creatorId = searchParams.get("creatorId")

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
    if (step === 2) return true
    if (step === 3) return true
    return true
  }

  const handleBudgetPreset = (idx: number) => {
    const preset = BUDGET_PRESETS[idx]
    setSelectedBudgetPreset(idx)
    setMinPrice(preset.min)
    setMaxPrice(preset.max)
  }

  const handleSubmit = async () => {
    if (!creatorId) { setErrorMsg("No designer selected."); return }
    setIsSubmitting(true)
    setErrorMsg("")
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creator_id: creatorId,
          title,
          description,
          price: parseFloat(maxPrice) || parseFloat(minPrice) || 0,
          delivery_date: deadline ? new Date(deadline).toISOString() : null,
          images: referenceUrls
        })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to submit request")
      }
      const { order } = await res.json()
      if (referenceUrls.length > 0) {
        await supabase.from("references").update({ order_id: order.id }).in("file_url", referenceUrls)
      }
      router.refresh()
      router.push("/client")
    } catch (err: any) {
      setErrorMsg(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-20 px-6">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Bespoke Request</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Start Your Custom Order</h1>
          <p className="text-secondary-foreground font-light text-lg">Define your vision and let our artisans bring it to life.</p>
        </motion.div>

        {/* Progress Timeline */}
        <div className="flex justify-between items-end mb-16 relative px-2">
          <div className="absolute bottom-[11px] left-0 w-full h-[1px] bg-border z-0" />
          <div 
            className="absolute bottom-[11px] left-0 h-[1px] bg-primary z-0 transition-all duration-700 ease-in-out" 
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />

          {STEPS.map((s, idx) => {
            const isCompleted = step > s.number
            const isCurrent = step === s.number
            return (
              <div key={s.number} className="relative z-10 flex flex-col items-center gap-4">
                <span className={`text-[10px] uppercase tracking-widest font-semibold transition-colors duration-300 hidden sm:block ${isCurrent || isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                <motion.div
                  animate={{
                    scale: isCurrent ? 1 : 1,
                    backgroundColor: isCompleted ? "var(--color-primary)" : isCurrent ? "var(--color-surface)" : "var(--color-background)",
                    borderColor: isCurrent || isCompleted ? "var(--color-primary)" : "var(--color-border)",
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-6 h-6 rounded-full border-[2px] flex items-center justify-center transition-all ${isCurrent ? 'ring-4 ring-primary/10' : ''}`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <span className={`text-[10px] font-bold ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>{s.number}</span>
                  )}
                </motion.div>
              </div>
            )
          })}
        </div>

        {/* Main Form Container */}
        <motion.div
          layout
          className="bg-surface rounded-[24px] border border-border shadow-sm overflow-hidden"
        >
          {/* Card header */}
          <div className="px-8 md:px-12 pt-10 pb-8 border-b border-border/60">
            <h2 className="text-3xl font-serif text-foreground">
              {step === 1 && "What is your vision?"}
              {step === 2 && "Details & Constraints"}
              {step === 3 && "Visual Inspiration"}
              {step === 4 && "Review & Submit"}
            </h2>
            <p className="text-secondary-foreground font-light text-sm mt-2">
              {STEPS[step - 1].description}
            </p>
          </div>

          {/* Card body */}
          <div className="p-8 md:px-12 md:py-10 min-h-[360px]">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center gap-3 p-4 bg-destructive/5 text-destructive text-sm font-medium rounded-xl border border-destructive/20"
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
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-widest">Project Title *</label>
                    <Input
                      placeholder="e.g. Velvet Karakou for Summer Wedding"
                      className="h-14 text-base rounded-[12px] bg-background border-border focus:border-primary/40 font-light"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-widest">Detailed Description</label>
                    <textarea
                      className="w-full rounded-[12px] border border-border bg-background px-5 py-4 text-base font-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/40 transition-all min-h-[180px] resize-none"
                      placeholder="Describe the fabric, cut, embroidery style, and any specific requirements..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <p className="text-xs text-secondary-foreground font-light">The more details you provide, the more accurate the artisan's quote will be.</p>
                  </div>
                </motion.div>
              )}

              {/* Step 2 — Budget & Deadline */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-10"
                >
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-widest">Estimated Budget</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {BUDGET_PRESETS.map((preset, i) => (
                        <button
                          key={i}
                          onClick={() => handleBudgetPreset(i)}
                          className={`p-4 rounded-[12px] border text-left transition-all ${
                            selectedBudgetPreset === i
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40 bg-background"
                          }`}
                        >
                          <p className={`font-serif text-lg mb-1 ${selectedBudgetPreset === i ? "text-primary" : "text-foreground"}`}>
                            {preset.label}
                          </p>
                          <p className="text-xs text-secondary-foreground font-light">{preset.range}</p>
                        </button>
                      ))}
                    </div>
                    
                    <div className="pt-4 flex items-center gap-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Or enter custom</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="flex items-center gap-4">
                      <Input type="number" placeholder="Min (DA)" className="h-14 text-base rounded-[12px] bg-background font-light" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                      <span className="text-border">—</span>
                      <Input type="number" placeholder="Max (DA)" className="h-14 text-base rounded-[12px] bg-background font-light" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" /> Delivery Deadline
                    </label>
                    <Input type="date" className="h-14 text-base rounded-[12px] bg-background font-light max-w-[280px]" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                    <p className="text-xs text-secondary-foreground font-light">Leave blank if you are flexible on timing.</p>
                  </div>
                </motion.div>
              )}

              {/* Step 3 — References */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="mb-8">
                    <p className="text-base text-secondary-foreground font-light leading-relaxed">
                      Upload images that inspire your design. This could be previous work from the artisan, a sketch, or photos of similar garments to illustrate your preferred style, color, or fabric.
                    </p>
                  </div>
                  <ReferenceUploader onReferencesChange={(urls) => setReferenceUrls(urls)} />
                </motion.div>
              )}

              {/* Step 4 — Summary */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="bg-secondary/30 rounded-[16px] p-8 space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Project Title</p>
                      <p className="font-serif text-xl text-foreground">{title || "—"}</p>
                    </div>
                    {description && (
                      <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Description</p>
                        <p className="text-sm text-secondary-foreground font-light leading-relaxed">{description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-border">
                      <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Budget</p>
                        <p className="font-medium text-foreground text-base">
                          {minPrice || maxPrice ? `${minPrice || "?"} – ${maxPrice || "?"} DA` : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Deadline</p>
                        <p className="font-medium text-foreground text-base">
                          {deadline ? new Date(deadline).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "Flexible"}
                        </p>
                      </div>
                    </div>
                    {referenceUrls.length > 0 && (
                      <div className="pt-6 border-t border-border">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">References</p>
                        <p className="text-sm text-foreground">{referenceUrls.length} image(s) attached</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card footer */}
          <div className="px-8 md:px-12 py-6 border-t border-border/60 flex items-center justify-between bg-secondary/10">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || isSubmitting}
              className="gap-2 font-medium rounded-full h-12 px-6"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            {step < 4 ? (
              <Button
                variant="luxury"
                onClick={() => canGoNext() && setStep((s) => s + 1)}
                disabled={!canGoNext()}
                className="gap-2 font-medium rounded-full h-12 px-8"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !title || !creatorId}
                className="gap-2 font-medium rounded-full h-12 px-8 bg-primary text-white hover:bg-primary-light transition-colors border-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Submit Request
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
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-10 text-[11px] text-muted-foreground uppercase tracking-widest"
        >
          <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> No Commitment Quote</span>
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Secure Communication</span>
        </motion.div>
      </div>
    </div>
  )
}

export default function CreateOrderView() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <CreateOrderForm />
    </Suspense>
  )
}
