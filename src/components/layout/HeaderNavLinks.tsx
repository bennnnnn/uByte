"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

// How long (ms) to wait before closing after mouse leaves — lets the cursor
// travel from the trigger button into the panel without the menu snapping shut.
const CLOSE_DELAY = 120;

const LANGUAGES = [
  { slug: "go",         icon: "🐹", label: "Go",         sub: "Beginner-friendly"    },
  { slug: "python",     icon: "🐍", label: "Python",     sub: "Clean & readable"      },
  { slug: "javascript", icon: "🟨", label: "JavaScript", sub: "Web & Node.js"         },
  { slug: "java",       icon: "☕", label: "Java",       sub: "Enterprise & OOP"      },
  { slug: "rust",       icon: "🦀", label: "Rust",       sub: "Systems programming"   },
  { slug: "cpp",        icon: "⚙️", label: "C++",        sub: "Performance & control" },
  { slug: "csharp",     icon: "💜", label: "C#",         sub: ".NET & game dev"       },
];

const PRACTICE_LANGS = [
  { slug: "go",         icon: "🐹", label: "Go"         },
  { slug: "python",     icon: "🐍", label: "Python"     },
  { slug: "javascript", icon: "🟨", label: "JavaScript" },
  { slug: "java",       icon: "☕", label: "Java"       },
  { slug: "rust",       icon: "🦀", label: "Rust"       },
  { slug: "cpp",        icon: "⚙️", label: "C++"        },
  { slug: "csharp",     icon: "💜", label: "C#"         },
];

const linkBase =
  "rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

type DropdownId = "tutorials" | "interview" | "certifications";

// Reusable dropdown wrapper — handles hover AND keyboard open/close with ARIA attributes.
// Uses a delayed close so the cursor can travel from the trigger into the panel.
// NO CSS group-hover — visibility is driven purely by JS state to avoid the
// bug where group-hover keeps the panel open after a link click.
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
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(onClose, CLOSE_DELAY);
  }, [onClose]);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // Clean up timer on unmount
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  // Close when keyboard focus leaves the container entirely
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      if (!containerRef.current?.contains(e.relatedTarget as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  const dropdownClasses = `absolute left-0 top-full z-50 mt-1.5 origin-top-left rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/60 transition-all duration-150 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40 ${
    open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
  }`;

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={handleBlur}
    >
      <button
        type="button"
        className={`${linkBase} flex items-center`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onMouseEnter={() => { cancelClose(); onOpen(id); }}
        onMouseLeave={scheduleClose}
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
          className={`ml-1 inline-block h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      <div
        id={menuId}
        role="menu"
        aria-label={`${label} menu`}
        className={dropdownClasses}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      >
        {children}
      </div>
    </div>
  );
}

export default function HeaderNavLinks({ side = "left" }: { side?: "left" }) {
  const [openMenu, setOpenMenu] = useState<DropdownId | null>(null);
  const pathname = usePathname();

  const handleOpen = useCallback((id: DropdownId) => setOpenMenu(id), []);
  const handleClose = useCallback(() => setOpenMenu(null), []);

  // Close all dropdowns whenever the route changes (link was clicked)
  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  if (side === "left") {
    return (
      <nav className="flex items-center gap-1" aria-label="Main navigation">

        {/* ── Tutorials dropdown ──────────────────────────────────── */}
        <NavDropdown
          id="tutorials"
          label="Tutorials"
          open={openMenu === "tutorials"}
          onOpen={handleOpen}
          onClose={handleClose}
          menuId="nav-tutorials-menu"
        >
          <div className="w-64 p-2">
            {LANGUAGES.map((l) => (
              <Link
                key={l.slug}
                href={`/tutorial/${l.slug}`}
                role="menuitem"
                onClick={handleClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-base dark:bg-zinc-800">
                  {l.icon}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">{l.label}</span>
                  <span className="block text-xs text-zinc-400 dark:text-zinc-500">{l.sub}</span>
                </span>
              </Link>
            ))}
          </div>
        </NavDropdown>

        {/* ── Interview Prep dropdown ──────────────────────────────── */}
        <NavDropdown
          id="interview"
          label="Interview Prep"
          open={openMenu === "interview"}
          onOpen={handleOpen}
          onClose={handleClose}
          menuId="nav-interview-menu"
        >
          <div className="w-56 p-2">
            <Link
              href="/practice"
              role="menuitem"
              onClick={handleClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-base dark:bg-indigo-950/60">
                🎯
              </span>
              <span>
                <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">All problems</span>
                <span className="block text-xs text-zinc-400 dark:text-zinc-500">Browse every language</span>
              </span>
            </Link>

            <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />

            {PRACTICE_LANGS.map((l) => (
              <Link
                key={l.slug}
                href={`/practice/${l.slug}`}
                role="menuitem"
                onClick={handleClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
              >
                <span className="w-6 text-center text-base">{l.icon}</span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{l.label}</span>
              </Link>
            ))}

            <Link
              href="/interviews"
              role="menuitem"
              onClick={handleClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-base dark:bg-emerald-950/60">💬</span>
              <span>
                <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">Interview experiences</span>
                <span className="block text-xs text-zinc-400 dark:text-zinc-500">Real stories shared anonymously</span>
              </span>
            </Link>
          </div>
        </NavDropdown>

        {/* ── Certifications dropdown ──────────────────────────────── */}
        <NavDropdown
          id="certifications"
          label="Certifications"
          open={openMenu === "certifications"}
          onOpen={handleOpen}
          onClose={handleClose}
          menuId="nav-certifications-menu"
        >
          <div className="w-56 p-2">
            <Link
              href="/certifications"
              role="menuitem"
              onClick={handleClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-base dark:bg-amber-950/60">
                📝
              </span>
              <span>
                <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">Certifications</span>
                <span className="block text-xs text-zinc-400 dark:text-zinc-500">Coding exams by language</span>
              </span>
            </Link>

            <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />

            {PRACTICE_LANGS.map((l) => (
              <Link
                key={l.slug}
                href={`/certifications/${l.slug}`}
                role="menuitem"
                onClick={handleClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
              >
                <span className="w-6 text-center text-base">{l.icon}</span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{l.label}</span>
              </Link>
            ))}
          </div>
        </NavDropdown>
      </nav>
    );
  }

  return null;
}
