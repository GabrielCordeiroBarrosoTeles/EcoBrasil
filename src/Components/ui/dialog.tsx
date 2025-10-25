import * as React from "react"

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
          onClick={() => onOpenChange(false)}
        />
        <div className="relative z-50 w-full max-w-md animate-in zoom-in-95 fade-in duration-300">
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
      {children}
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-6">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold text-slate-900">{children}</h2>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-600 mt-3">{children}</p>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-3 mt-8">{children}</div>;
}
