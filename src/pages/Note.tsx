import { useEffect, useState, useCallback, useRef } from "react";
import type React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cloud, CloudOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Note = () => {
  const { noteName } = useParams<{ noteName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<number | undefined>();

  // Load note from MongoDB API
  useEffect(() => {
    if (!noteName) return;

    const loadNote = async () => {
      try {
        const res = await fetch(`${API_BASE}/notes/${encodeURIComponent(noteName)}`);

        if (res.status === 404) {
          // New note, nothing to load yet
          setContent("");
          setLastSaved(null);
          setIsConnected(true);
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Unknown error");
        }

        const data: { content: string; updatedAt?: string } = await res.json();
        setContent(data.content || "");
        if (data.updatedAt) {
          setLastSaved(new Date(data.updatedAt));
        }
        setIsConnected(true);
      } catch (error: unknown) {
        console.error("Error loading note:", error);
        setIsConnected(false);
        toast({
          title: "Error loading note",
          description: "Couldn't load your note. Check your connection.",
          variant: "destructive",
        });
      }
    };

    loadNote();
  }, [noteName, toast]);

  // Auto-save function
  const saveNote = useCallback(
    async (text: string) => {
      if (!noteName) return;

      setIsSaving(true);

      try {
        const res = await fetch(`${API_BASE}/notes/${encodeURIComponent(noteName)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: text }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Unknown error");
        }

        const data: { updatedAt?: string } = await res.json();
        setLastSaved(data.updatedAt ? new Date(data.updatedAt) : new Date());
        setIsConnected(true);
      } catch (error: unknown) {
        console.error("Error saving note:", error);
        setIsConnected(false);
        toast({
          title: "Save failed",
          description: "Couldn't save your note. Check your connection.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [noteName, toast],
  );

  // Handle content changes with debounced auto-save
  const handleContentChange = (text: string) => {
    setContent(text);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = window.setTimeout(() => {
      saveNote(text);
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-card border-b border-border z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Button>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary">
              {noteName}
            </span>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isSaving ? (
                <>
                  <Cloud className="w-4 h-4 animate-pulse" />
                  <span>Saving...</span>
                </>
              ) : isConnected ? (
                <>
                  <Cloud className="w-4 h-4 text-accent" />
                  <span>
                    {lastSaved
                      ? `Saved ${lastSaved.toLocaleTimeString()}`
                      : "Ready"}
                  </span>
                </>
              ) : (
                <>
                  <CloudOff className="w-4 h-4 text-destructive" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="pt-24 pb-12 px-4 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start typing your thoughts..."
            className="min-h-[calc(100vh-12rem)] text-lg leading-relaxed bg-background border-2 border-border focus:border-foreground transition-all resize-none p-8"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Anyone with this note name can view and edit together
          </p>
        </div>
      </div>
    </div>
  );
};

export default Note;