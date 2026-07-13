"use client";

import { Heart, ExternalLink, CheckCircle, Users, Zap } from "lucide-react";

export default function ProgramPosyandu() {
  return (
    <section className="fade-up mt-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8" style={{ animationDelay: "0.25s" }}>
      <div className="grid gap-8 md:grid-cols-3 md:gap-12">
        {/* Left: Main Content */}
        <div className="md:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <Heart size={24} className="text-red-600" fill="currentColor" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Program KKN</p>
              <h3 className="text-2xl font-bold text-gray-900 md:text-3xl">Program Posyandu</h3>
            </div>
          </div>
          
          <p className="mb-4 text-sm font-medium text-red-600">SIPOTELU - Sistem Informasi Posyandu Terintegrasi</p>
          <p className="mb-6 max-w-lg text-sm leading-relaxed text-gray-600">
            Sistem digital untuk pencatatan dan monitoring data posyandu. Kerjasama program KKN dalam memberikan akses informasi kesehatan yang lebih baik.
          </p>

          {/* Features */}
          <div className="space-y-2.5">
            <div className="flex gap-3">
              <CheckCircle size={18} className="mt-0.5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-gray-700">Sistem terintegrasi yang mudah digunakan</p>
            </div>
            <div className="flex gap-3">
              <Users size={18} className="mt-0.5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-gray-700">Kolaborasi tim lintas sektor kesehatan</p>
            </div>
            <div className="flex gap-3">
              <Zap size={18} className="mt-0.5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-gray-700">Monitoring data real-time dan akurat</p>
            </div>
          </div>
        </div>

        {/* Right: Button & Info */}
        <div className="flex flex-col justify-between md:col-span-1">
          <a
            href="https://sites.google.com/view/sipotelu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-3 font-semibold text-white transition-colors hover:bg-[var(--brand-2)]"
          >
            <span>Buka Program</span>
            <ExternalLink size={16} />
          </a>

          {/* Tags */}
          <div className="mt-6 flex flex-wrap gap-2">
            {["Kesehatan", "Monitoring", "Komunitas"].map((tag) => (
              <span key={tag} className="inline-flex rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
