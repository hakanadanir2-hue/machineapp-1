"use client";
import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/lib/cartContext";

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    discounted_price: number | null;
    cover_image_url: string | null;
  };
  variant?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function AddToCartButton({ product, variant, style, className }: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add({
      id:               product.id,
      name:             product.name,
      price:            product.price,
      discounted_price: product.discounted_price,
      image_url:        product.cover_image_url,
      variant,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button onClick={handleAdd} className={className} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
      padding: "0.75rem 1.5rem", borderRadius: "12px", border: "none", cursor: "pointer",
      fontWeight: 700, fontSize: "0.875rem", transition: "all .2s",
      background: added ? "rgba(74,222,128,0.15)" : "#6A0D25",
      color: added ? "#4ade80" : "#fff",
      ...style,
    }}>
      {added ? <Check size={16} /> : <ShoppingCart size={16} />}
      {added ? "Eklendi!" : "Sepete Ekle"}
    </button>
  );
}
