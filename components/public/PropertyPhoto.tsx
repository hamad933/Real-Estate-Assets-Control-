import Image from "next/image";

type PropertyPhotoVariant = "hero" | "main" | "secondary" | "tertiary";

type PropertyPhotoProps = {
  propertyId?: string;
  variant?: PropertyPhotoVariant;
  alt: string;
  priority?: boolean;
};

type PhotoAsset = {
  src: string;
  width: number;
  height: number;
  position?: string;
};

const hero: PhotoAsset = {
  src: "/assets/rp04/properties/hero-residence.jpg",
  width: 1600,
  height: 1004,
  position: "center"
};

const propertyPhotos: Record<string, { main: PhotoAsset; secondary?: PhotoAsset; tertiary?: PhotoAsset }> = {
  "narjis-101": {
    main: { src: "/assets/rp04/properties/narjis-apartment.jpg", width: 1200, height: 830 }
  },
  "yasmin-villa": {
    main: { src: "/assets/rp04/properties/yasmin-villa.jpg", width: 1600, height: 704 },
    secondary: { src: "/assets/rp04/properties/yasmin-living.jpg", width: 1200, height: 679 },
    tertiary: { src: "/assets/rp04/properties/yasmin-kitchen.jpg", width: 1200, height: 679 }
  },
  "aqiq-duplex": {
    main: { src: "/assets/rp04/properties/aqiq-duplex.jpg", width: 1200, height: 700 }
  },
  "malqa-studio": {
    main: { src: "/assets/rp04/properties/malqa-studio.jpg", width: 1200, height: 715 }
  },
  "yasmin-12": {
    main: { src: "/assets/rp04/properties/yasmin-apartment.jpg", width: 1200, height: 654 }
  },
  "arid-villa": {
    main: { src: "/assets/rp04/properties/arid-villa.jpg", width: 1200, height: 669 }
  }
};

export function PropertyPhoto({ propertyId, variant = "main", alt, priority = false }: PropertyPhotoProps) {
  const group = propertyId ? propertyPhotos[propertyId] : undefined;
  const asset = variant === "hero"
    ? hero
    : group?.[variant === "secondary" ? "secondary" : variant === "tertiary" ? "tertiary" : "main"] ?? group?.main ?? hero;

  return (
    <Image
      src={asset.src}
      alt={alt}
      width={asset.width}
      height={asset.height}
      priority={priority}
      sizes="(max-width: 720px) 100vw, (max-width: 1100px) 60vw, 50vw"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        objectFit: "cover",
        objectPosition: asset.position ?? "center"
      }}
    />
  );
}
