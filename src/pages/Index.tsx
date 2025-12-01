import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Minus } from "lucide-react";

const Index = () => {
  const [noteName, setNoteName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteName.trim()) {
      navigate(`/note/${encodeURIComponent(noteName.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Minimal geometric background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-foreground rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-foreground"></div>
      </div>

      <div className="max-w-lg w-full relative animate-fade-in">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative flex items-center gap-3">
            <FileText className="w-16 h-16 text-foreground" strokeWidth={1.5} />
            <Minus className="w-8 h-8 text-foreground" strokeWidth={2} />
          </div>
        </div>

        {/* Main card */}
        <div className="bg-card border border-border shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 text-foreground tracking-tight">
            Not A NotePad
          </h1>
          
          <p className="text-center text-muted-foreground mb-8 text-lg">
            Minimalist and collaborative. 
            <br />
            <span className="text-sm">Just enter a name to start or join a note.</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter a note name..."
                value={noteName}
                onChange={(e) => setNoteName(e.target.value)}
                className="text-lg py-6 px-6 border-2 focus:border-foreground bg-background transition-all text-center"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-lg bg-foreground hover:bg-accent transition-all font-semibold"
              disabled={!noteName.trim()}
            >
              Open Note
            </Button>
          </form>

          <div className="mt-8 p-4 bg-secondary border border-border">
            <p className="text-sm text-center text-muted-foreground">
              <span className="font-medium">Note:</span> Share the note name with others to collaborate in real-time
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center mt-8 text-sm text-muted-foreground">
          Auto-saves as you type • Works on any device • Share instantly
        </p>
      </div>
    </div>
  );
};

export default Index;