"use client";
// Navbar component (client) - responsive navigation with modern styling
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  const links = [
    { href: '/#beranda', label: 'Beranda' },
    { href: '/#profil', label: 'Profil' },
    { href: '/#berita', label: 'Berita' },
    { href: '/#kegiatan', label: 'Kegiatan' },
    { href: '/#galeri', label: 'Galeri' },
    { href: '/#kontak', label: 'Kontak' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-3 md:px-6">
      <div className="mx-auto mt-3 max-w-6xl rounded-lg border border-[var(--line)] bg-white/92 px-3 py-3 shadow-[0_10px_24px_rgba(22,36,28,0.1)] backdrop-blur md:px-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/#beranda" className="flex min-w-0 items-center gap-3">
            <img 
              src="/mertelu.png" 
              alt="Padukuhan Mertelu Logo"
              className="h-10 w-10 shrink-0 object-contain"
            />
            <div className="min-w-0">
              <div className="truncate text-[0.95rem] font-semibold leading-none text-[var(--brand)]">Padukuhan Mertelu</div>
              <div className="mt-1 truncate text-xs text-[var(--muted)]">Profil Digital Masyarakat</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] p-1 md:flex">
            {user ? (
              <>
                <Link href="/admin" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] hover:bg-white hover:text-[var(--brand)]">Dashboard</Link>
                <button
                  onClick={signOut}
                  className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] hover:bg-white hover:text-[var(--brand)]"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/admin" className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-2)]">Admin</Link>
              </>
            )}
          </nav>

          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              aria-label="menu"
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--brand)]"
            >
              {open ? 'Tutup' : 'Menu'}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-lg border border-[var(--line)] bg-white p-3 shadow-md md:hidden">
          <div className="flex flex-col gap-1">
            {user ? (
              <>
                <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--brand)]" onClick={() => setOpen(false)}>Dashboard</Link>
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--brand)]"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/admin" className="mt-1 rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white" onClick={() => setOpen(false)}>Admin</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
