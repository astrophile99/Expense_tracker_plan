"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"
import { ChevronDown, Search } from "lucide-react"

interface CategorySelectorProps {
  categories: Category[]
  value: string
  onChange: (value: string) => void
  error?: string
}

export function CategorySelector({ categories, value, onChange, error }: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selected = categories.find((c) => c.id === value)
  const groups = [...new Set(categories.map((c) => c.group))]
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between h-12",
            !selected && "text-muted-foreground",
            error && "ring-2 ring-destructive"
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: selected.color }}
              />
              {selected.name}
            </span>
          ) : (
            "Select category"
          )}
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="flex items-center border-b border-border px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[280px] overflow-y-auto p-1">
          {groups.map((group) => {
            const groupCats = filtered.filter((c) => c.group === group)
            if (groupCats.length === 0) return null
            return (
              <div key={group}>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {group}
                </div>
                {groupCats.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onChange(cat.id)
                      setOpen(false)
                      setSearch("")
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted",
                      value === cat.id && "bg-muted font-medium"
                    )}
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </button>
                ))}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No categories found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
