import * as React from "react"

import { cn } from "../../lib/utils"

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  containerClassName?: string
}

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {},
})

export function Dialog({
  open,
  onOpenChange,
  children,
  containerClassName,
}: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
          onClick={() => onOpenChange(false)}
        />
        <div
          className={cn(
            "relative z-50 w-full max-w-md animate-in zoom-in-95 fade-in duration-300",
            containerClassName,
          )}
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  )
}

type DialogContentProps = React.HTMLAttributes<HTMLDivElement>

export function DialogContent({ children, className, ...rest }: DialogContentProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-2xl p-8 border border-slate-100 animate-in fade-in zoom-in-95 duration-300",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>
type DialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>
type DialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>
type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>

export function DialogHeader({ children, className, ...rest }: DialogHeaderProps) {
  return (
    <div className={cn("mb-6", className)} {...rest}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className, ...rest }: DialogTitleProps) {
  return (
    <h2 className={cn("text-2xl font-bold text-slate-900", className)} {...rest}>
      {children}
    </h2>
  )
}

export function DialogDescription({
  children,
  className,
  ...rest
}: DialogDescriptionProps) {
  return (
    <p className={cn("text-slate-600 mt-3", className)} {...rest}>
      {children}
    </p>
  )
}

export function DialogFooter({ children, className, ...rest }: DialogFooterProps) {
  return (
    <div className={cn("flex gap-3 mt-8", className)} {...rest}>
      {children}
    </div>
  )
}
