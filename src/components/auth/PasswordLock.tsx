import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

interface PasswordLockProps {
  onUnlock: () => void;
}

const PasswordLock = ({ onUnlock }: PasswordLockProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "3005") {
      onUnlock();
      setError("");
    } else {
      setError("Senha incorreta");
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg shadow-lg border max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Finanças Pessoais</h2>
            <p className="text-muted-foreground mt-2">Digite sua senha para acessar</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <Input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-center text-lg tracking-widest"
              autoFocus
            />
            
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
            
            <Button type="submit" className="w-full" size="lg">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordLock;