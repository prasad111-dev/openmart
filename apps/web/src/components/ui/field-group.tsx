import { cn } from "@/lib/utils"

function FieldGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

export { FieldGroup }
