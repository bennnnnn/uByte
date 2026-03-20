"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

// Top languages to show in nav dropdowns (most popular first)
const NAV_LANGS = [
  { slug: "go",         icon: "🐹", label: "Go"         },
  { slug: "python",     icon: "🐍", label: "Python"     },
  { slug: "javascript", icon: "🟨", label: "JavaScript" },
  { slug: "typescript", icon: "🔷", label: "TypeScript" },
  { slug: "java",       icon: "☕", label: "Java"       },
  { slug: "rust",       icon: "🦀", label: "Rust"       },
];

// Full list used for certifications (all 9)
const ALL_LANGS = [
  { slug: "go",         icon: "🐹", label: "Go"         },
  { slug: "python",     icon: "🐍", label: "Python"     },
  { slug: "javascript", icon: "🟨", label: "JavaScript" },
  { slug: "typescript", icon: "🔷", label: "TypeScript" },
  { slug: "java",       icon: "☕", label: "Java"       },
  { slug: "rust",       icon: "🦀", label: "Rust"       },
  { slug: "cpp",        icon: "⚙️", label: "C++"        },
  { slug: "csharp",     icon: "💜", label: "C#"         },
  { slug: "sql",        icon: "🗄️", label: "SQL"        },
];

const linkBase =
  "rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

const menuItemBase =
  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800";

type DropdownId = "tutorials" | "interview" | "certifications";

// Click-only dropdown — no hover open/close
function NavDropdown({
  id,
  label,
  open,
  onOpen,
  onClose,
  menuId,
  children,
}: {
  id: DropdownId;
  label: string;
  open: boolean;
  onOpen: (id: DropdownId) => void;
  onClose: () => void;
  menuId: string;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={`${linkBase} flex items-center gap-1`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => (open ? onClose() : onOpen(id))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            onOpen(id);
          }
          if (e.key === "Escape") onClose();
        }}
      >
        {label}
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={`${label} menu`}
          className="absolute left-0 top-full z-50 mt-1.5 min-w-[220px] rounded-xl border border-zinc-200 bg-white py-1.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function HeaderNavLinks({ side = "left" }: { side?: "left" }) {
  const [openMenu, setOpenMenu] = useState<DropdownId | null>(null);
  const pathname = usePathname();

  const handleOpen  = useCallback((id: DropdownId) => setOpenMenu(id), []);
  const handleClose = useCallback(() => setOpenMenu(null), []);

  useEffect(() => { setOpenMenu(null); }, [pathname]);

  if (side !== "left") return null;

  return (
    <nav className="flex items-center gap-1" aria-label="Main navigation">

      {/* ── Tutorials ─────────────────────────────────────────────── */}
      <NavDropdown
        id="tutorials" label="Tutorials"
        open={openMenu === "tutorials"}
        onOpen={handleOpen} onClose={handleClose}
        menuId="nav-tutorials-menu"
      >
        {NAV_LANGS.map((l) => (
          <Link key={l.slug} href={`/tutorial/${l.slug}`} role="menuitem" onClick={handleClose}
            className={menuItemBase}
          >
            <span className="text-base leading-none">{l.icon}</span>
            {l.label}
          </Link>
        ))}
        <div className="mx-3 my-1.5 border-t border-zinc-100 dark:border-zinc-800" />
        <Link href="/tutorial" role="menuitem" onClick={handleClose}
          className="block px-3 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Browse all languages →
        </Link>
      </NavDropdown>

      {/* ── Interview Prep ────────────────────────────────────────── */}
      <NavDropdown
        id="interview" label="Interview Prep"
        open={openMenu === "interview"}
        onOpen={handleOpen} onClose={handleClose}
        menuId="nav-interview-menu"
      >
        <Link href="/practice" role="menuitem" onClick={handleClose} className={menuItemBase}>
          <span className="text-base leading-none">🎯</span>
          All problems
        </Link>
        <Link href="/daily" role="menuitem" onClick={handleClose} className={menuItemBase}>
          <span className="text-base leading-none">⚡</span>
          Daily challenge
        </Link>
        <Link href="/interview" role="menuitem" onClick={handleClose} className={menuItemBase}>
          <span className="text-base leading-none">🎤</span>
          Interview simulator
        </Link>
        <Link href="/interviews" role="menuitem" onClick={handleClose} className={menuItemBase}>
          <span className="text-base leading-none">💬</span>
          Interview experiences
        </Link>
      </NavDropdown>

      {/* ── Certifications ────────────────────────────────────────── */}
      <NavDropdown
        id="certifications" label="Certifications"
        open={openMenu === "certifications"}
        onOpen={handleOpen} onClose={handleClose}
        menuId="nav-certifications-menu"
      >
        {ALL_LANGS.slice(0, 6).map((l) => (
          <Link key={l.slug} href={`/certifications/${l.slug}`} role="menuitem" onClick={handleClose}
            className={menuItemBase}
          >
            <span className="text-base leading-none">{l.icon}</span>
            {l.label}
          </Link>
        ))}
        <div className="mx-3 my-1.5 border-t border-zinc-100 dark:border-zinc-800" />
        <Link href="/certifications" role="menuitem" onClick={handleClose}
          className="block px-3 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Browse all certifications →
        </Link>
      </NavDropdown>

    </nav>
  );
}
