import { useState, type FormEvent } from "react";
import { LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { useAuthStore } from "@/auth/store/auth.store";
import BrandLogo from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isPosting, setIsPosting] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPosting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const isValid = await login(email, password);

      if (!isValid) {
        toast.error("Acceso no autorizado", {
          description: "Esta cuenta no tiene permisos para acceder al panel de administración.",
        });
        return;
      }

      toast.success("Sesión iniciada", { description: "Bienvenido al panel de MindSave." });
      navigate("/");
    } catch (error: unknown) {
      toast.error("No pudimos iniciar sesión", {
        description: error instanceof Error ? error.message : "Verifica tus credenciales e inténtalo nuevamente.",
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-6">
      <div className="ms-page-grid pointer-events-none absolute inset-0 opacity-75" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[min(92vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/5" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[min(68vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />

      <Card className="ms-enter relative w-full max-w-[27.5rem] bg-card/95 backdrop-blur-xl">
        <div className="ms-accent-line absolute inset-x-10 top-0 h-[3px]" />
        <CardContent className="p-6 sm:p-10">
          <div className="mb-9 flex flex-col items-center text-center">
            <BrandLogo compact linkToHome={false} markSize={66} />
            <p className="mt-3 font-heading text-xs uppercase tracking-[0.24em] text-[#4a8080]">Mind Save</p>
            <div className="ms-accent-line mt-3 h-0.5 w-12" />
            <h1 className="mt-5 font-heading text-[1.7rem] font-semibold leading-tight text-foreground">Panel de administración</h1>
            <p className="mt-2 text-[0.9375rem] text-muted-foreground">Inicia sesión para continuar</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#4a7070]" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Ingresa tu correo"
                  autoComplete="email"
                  className="pl-11"
                  required
                  disabled={isPosting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#4a7070]" aria-hidden="true" />
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  className="pl-11"
                  required
                  disabled={isPosting}
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-1 w-full" disabled={isPosting}>
              {isPosting && <LoaderCircle className="animate-spin" />}
              {isPosting ? "Ingresando…" : "Ingresar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};
