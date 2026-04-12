"use client";

import { X, Plus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  type: "internal" | "external";
  placeholder?: string;
}

export function TagInput({ tags, onChange, type, placeholder }: TagInputProps) {
  const [input, setInput] = useState("");

  const colorClass = type === "internal" 
    ? "bg-[#E1F5EE] text-[#1D9E75]" 
    : "bg-[#FAECE7] text-[#D85A30]";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = input.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
        setInput("");
      }
    }
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div 
      className="min-h-[120px] p-4 border-2 border-dashed border-gray-100 rounded-2xl bg-white flex flex-wrap gap-2 content-start transition-all focus-within:border-[#534AB7]/20"
      onClick={() => document.getElementById(`tag-input-${type}`)?.focus()}
    >
      <AnimatePresence>
        {tags.map((tag) => (
          <motion.span
            key={tag}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 ${colorClass}`}
          >
            {tag}
            <button onClick={(e) => { e.stopPropagation(); removeTag(tag); }}>
              <X size={14} className="hover:opacity-100 opacity-60 transition-opacity" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <input
        id={`tag-input-${type}`}
        type="text"
        className="bg-transparent border-none outline-none text-sm flex-1 min-w-[150px] py-1.5"
        placeholder={tags.length === 0 ? (placeholder || "Digite e pressione Enter...") : ""}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
