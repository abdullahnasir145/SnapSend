import type { ReactNode } from "react";
import { Text } from "react-native";

import { poppinsFontFamilyByWeight } from "@/constants/fonts";
import { cn } from "@/lib/utils";

type TypographySize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
type TypographyWeight = keyof typeof poppinsFontFamilyByWeight;

const sizeClasses: Record<TypographySize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

const weightClasses: Record<TypographyWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
};

function getTypographyStyle(weight: TypographyWeight) {
  return { fontFamily: poppinsFontFamilyByWeight[weight] };
}

export interface Heading1Props {
  children: ReactNode;
  className?: string;
  size?: TypographySize;
  weight?: TypographyWeight;
}

/** Primary screen title with a 3xl bold default type scale. */
export function Heading1({
  children,
  className,
  size,
  weight,
}: Heading1Props) {
  const resolvedSize = size ?? "3xl";
  const resolvedWeight = weight ?? "bold";

  return (
    <Text
      accessibilityRole="header"
      className={cn("text-foreground", sizeClasses[resolvedSize], weightClasses[resolvedWeight], className)}
      style={getTypographyStyle(resolvedWeight)}
    >
      {children}
    </Text>
  );
}

export interface Heading2Props {
  children: ReactNode;
  className?: string;
  size?: TypographySize;
  weight?: TypographyWeight;
}

/** Section title with a 2xl semibold default type scale. */
export function Heading2({
  children,
  className,
  size,
  weight,
}: Heading2Props) {
  const resolvedSize = size ?? "2xl";
  const resolvedWeight = weight ?? "semibold";

  return (
    <Text
      accessibilityRole="header"
      className={cn("text-foreground", sizeClasses[resolvedSize], weightClasses[resolvedWeight], className)}
      style={getTypographyStyle(resolvedWeight)}
    >
      {children}
    </Text>
  );
}

export interface Heading3Props {
  children: ReactNode;
  className?: string;
  size?: TypographySize;
  weight?: TypographyWeight;
}

/** Subsection title with an xl semibold default type scale. */
export function Heading3({
  children,
  className,
  size,
  weight,
}: Heading3Props) {
  const resolvedSize = size ?? "xl";
  const resolvedWeight = weight ?? "semibold";

  return (
    <Text
      accessibilityRole="header"
      className={cn("text-foreground", sizeClasses[resolvedSize], weightClasses[resolvedWeight], className)}
      style={getTypographyStyle(resolvedWeight)}
    >
      {children}
    </Text>
  );
}

export interface ParagraphProps {
  children: ReactNode;
  className?: string;
  size?: TypographySize;
  weight?: TypographyWeight;
}

/** Body copy with a base-size, normal-weight default type scale. */
export function Paragraph({
  children,
  className,
  size,
  weight,
}: ParagraphProps) {
  const resolvedSize = size ?? "md";
  const resolvedWeight = weight ?? "normal";

  return (
    <Text
      className={cn("text-foreground", sizeClasses[resolvedSize], weightClasses[resolvedWeight], className)}
      style={getTypographyStyle(resolvedWeight)}
    >
      {children}
    </Text>
  );
}
