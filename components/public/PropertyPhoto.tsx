type PropertyPhotoVariant = "hero" | "main" | "secondary" | "tertiary";

type PropertyPhotoProps = {
  propertyId?: string;
  variant?: PropertyPhotoVariant;
  alt: string;
  compact?: boolean;
};

const mainPositions: Record<string, string> = {
  "narjis-101": "33.333% 0%",
  "yasmin-villa": "66.667% 0%",
  "aqiq-duplex": "100% 0%",
  "malqa-studio": "0% 100%",
  "yasmin-12": "33.333% 100%",
  "arid-villa": "66.667% 100%"
};

const variantPositions: Record<PropertyPhotoVariant, string> = {
  hero: "0% 0%",
  main: "0% 0%",
  secondary: "100% 100%",
  tertiary: "33.333% 0%"
};

export function PropertyPhoto({ propertyId, variant = "main", alt, compact = false }: PropertyPhotoProps) {
  const position = variant === "main" && propertyId
    ? mainPositions[propertyId] ?? variantPositions.main
    : variantPositions[variant];

  return (
    <div
      className={compact ? "property-visual property-visual--compact" : "property-visual"}
      data-testid="property-photo"
      role="img"
      aria-label={alt}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        backgroundImage: 'url("/assets/rp04/properties/property-sprite.webp")',
        backgroundSize: "400% 200%",
        backgroundPosition: position,
        backgroundRepeat: "no-repeat",
        backgroundColor: "#e8e2d7"
      }}
    />
  );
}
