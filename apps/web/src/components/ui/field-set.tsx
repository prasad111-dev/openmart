import * as React from "react"
import { cn } from "@/lib/utils"

function FieldSet({
  className,
  children,
  ...props
}: React.FieldsetHTMLAttributes<HTMLFieldSetElement>) {
  return (
    <fieldset
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      {children}
    </fieldset>
  )
}

function FieldLegend({
  className,
  ...props
}: React.HTMLAttributes<HTMLLegendElement>) {
  return (
    <legend
      className={cn("text-sm font-medium leading-none text-foreground", className)}
      {...props}
    />
  )
}

export { FieldSet, FieldLegend }
