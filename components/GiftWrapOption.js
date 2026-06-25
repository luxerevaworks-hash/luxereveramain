"use client";

import { FiGift } from "react-icons/fi";
import { GIFT_WRAP_FEE } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function GiftWrapOption({ checked, onChange }) {
  return (
    <label
      className={`flex items-center gap-3 rounded-2xl p-4 cursor-pointer border-2 border-dashed transition-all ${
        checked
          ? "border-rosewood bg-brown-dark/10 shadow-sm"
          : "border-rosewood/30 bg-brown-dark/5 hover:border-rosewood/60"
      }`}
    >
      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-brown-dark text-gold flex items-center justify-center">
        <FiGift className="w-5 h-5" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-brown-dark">
          Add Gift Wrap{" "}
          <span className="text-brown/60 font-normal">({formatPrice(GIFT_WRAP_FEE)} Extra)</span>
        </span>
        <span className="block text-xs text-brown/50 mt-0.5">
          Sending it as a gift? We&apos;ll wrap it beautifully 🎀
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 accent-rosewood rounded flex-shrink-0"
      />
    </label>
  );
}
