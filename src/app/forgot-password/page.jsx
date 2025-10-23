"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { forgotPassword } from "@/services/password";

// Schema de validação
const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido" }),
});

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values) {
    setIsSubmitting(true);
    
    try {
      await forgotPassword(values.email);
      
      toast.success("E-mail enviado!", {
        description: `Enviamos instruções para ${values.email}. Verifique sua caixa de entrada.`,
      });
      
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar e-mail de reset:", error);
      const errorMessage = error?.response?.data?.message || "Ocorreu um erro ao tentar enviar o e-mail. Tente novamente.";
      
      toast.error("Erro ao enviar", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-neutral-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-center">
            Esqueceu a senha?
          </CardTitle>        
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Digite seu e-mail cadastrado e enviaremos instruções para redefinir sua senha.
                </p>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="seu@email.com"
                          {...field}
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : "Enviar"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center text-sm">
            <Link 
              href="/login" 
              className="text-blue-600 hover:underline"
            >
              Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
