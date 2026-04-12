import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      imageSrc="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2000&auto=format&fit=crop"
      imageAlt="Thread spools"
      quote="Every great design begins with an even better story."
      author="Lorinda Mamo"
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <span className="material-icons text-base">arrow_back</span>
          Back to Login
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Forgot Password?
        </h1>
        <p className="text-muted-foreground mb-8">
          No worries, we&apos;ll send you reset instructions.
        </p>

        <form className="space-y-5 flex flex-col items-center w-full">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="name@example.com" 
            required 
          />

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Send Instructions
          </Button>
        </form>

        <div className="mt-12 text-center">
          <Link 
            href="#" 
            className="text-sm font-semibold text-primary hover:underline"
          >
            Help Center
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
