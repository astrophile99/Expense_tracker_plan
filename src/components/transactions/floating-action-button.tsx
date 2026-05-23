"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps {
  onClick: () => void
  className?: string
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="xl"
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl z-50 md:hidden",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "transition-all duration-300 hover:scale-110 active:scale-95",
        "before:absolute before:inset-0 before:rounded-full before:animate-ping before:opacity-20 before:bg-primary",
        className
      )}
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">Add transaction</span>
    </Button>
  )
}
