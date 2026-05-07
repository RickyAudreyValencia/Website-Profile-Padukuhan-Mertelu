"use client";
// Navbar component (client) - responsive navigation with modern styling
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  const links = [
    { href: '#', label: 'Beranda' },
    { href: '#profil', label: 'Profil' },
    { href: '#berita', label: 'Berita' },
    { href: '#kegiatan', label: 'Kegiatan' },
    { href: '#galeri', label: 'Galeri' },
    { href: '#kontak', label: 'Kontak' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 md:px-6">
      <div className="mx-auto mt-4 max-w-6xl rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3 shadow-[0_10px_24px_rgba(22,36,28,0.1)] backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">PM</div>
          <div>
              <div className="text-[0.95rem] font-semibold leading-none text-[var(--brand)]">Padukuhan Mertelu</div>
              <div className="mt-1 text-xs text-[var(--muted)]">Profil Digital Masyarakat</div>
            </div>
          </a>

          <nav className="hidden items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] p-1 md:flex">
            {user ? (
              <>
                <a href="/admin" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] hover:bg-white hover:text-[var(--brand)]">Dashboard</a>
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
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] hover:bg-white hover:text-[var(--brand)]"
                  >
                    {link.label}
                  </a>
                ))}
                <a href="/admin" className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-2)]">Admin</a>
              </>
            )}
          </nav>

          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              aria-label="menu"
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--brand)]"
            >
              {open ? 'Tutup' : 'Menu'}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-[var(--line)] bg-white p-3 shadow-md md:hidden">
          <div className="flex flex-col gap-1">
            {user ? (
              <>
                <a href="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--brand)]" onClick={() => setOpen(false)}>Dashboard</a>
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
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--brand)]"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <a href="/admin" className="mt-1 rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white" onClick={() => setOpen(false)}>Admin</a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
