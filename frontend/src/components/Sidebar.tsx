"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Perfil } from "@/types";

type NavItem = {
  label: string;
  icon: string;
  image: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Painel", icon: "🏠", image: "/icon-painel.png" },
  { label: "Clientes", icon: "👥", image: "/icon-clientes.png" },
  { label: "Pesquisa", icon: "🔍", image: "/icon-pesquisar.png" },
  { label: "Agenda", icon: "📅", image: "/icon-agenda.png" },
  { label: "Financeiro", icon: "💳", image: "/icon-financeiro.png" },
  { label: "Relatórios", icon: "📊", image: "/icon-relatorio.png" },
  { label: "Anotações", icon: "📝", image: "/icon-anotação.png" },
];

type SidebarProps = {
  activeSection: string;
  setActiveSection: (section: string) => void;
  perfil: Perfil;
};

export default function Sidebar({ activeSection, setActiveSection, perfil }: SidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  return (
    <aside
      className={`${expanded ? "w-56" : "w-20"} shrink-0 bg-[#0f0a1f] border-r border-white/10 flex flex-col py-6 gap-2 transition-all duration-300 ease-in-out relative group`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-500 transition-all"
        title={expanded ? "Recolher menu" : "Expandir menu"}
      >
        <svg
          className={`h-4 w-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Logo/Brand */}
      <div className={`flex items-center ${expanded ? "px-4" : "justify-center"} mb-4`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-900/50">
          <span className="text-lg font-bold text-white">O</span>
        </div>
        {expanded && <span className="ml-3 text-lg font-bold text-white animate-fade-in">Ordenate</span>}
      </div>

      {/* Divider */}
      <div className={`h-px bg-white/10 ${expanded ? "mx-4" : "mx-3"} mb-2`} />

      {/* Navigation Items */}
      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActiveSection(item.label)}
              className={`flex items-center ${expanded ? "px-3" : "justify-center"} h-12 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-900/50"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
              title={!expanded ? item.label : undefined}
            >
              <div className="flex h-8 w-8 items-center justify-center">
                {item.image && !imageErrors[item.label] ? (
                  <Image
                    src={item.image}
                    alt={item.label}
                    width={20}
                    height={20}
                    className="object-contain brightness-0 invert"
                    onError={() => setImageErrors((prev) => ({ ...prev, [item.label]: true }))}
                  />
                ) : (
                  <span aria-hidden className="text-base">
                    {item.icon}
                  </span>
                )}
              </div>
              {expanded && <span className="ml-2 whitespace-nowrap animate-fade-in">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section - Profile */}
      <div className="mt-auto px-2">
        <div className={`h-px bg-white/10 ${expanded ? "mx-2" : "mx-1"} mb-3`} />
        <Link
          href="/inicio/perfil"
          className={`flex items-center ${expanded ? "px-3" : "justify-center"} h-12 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200`}
          title={!expanded ? "Perfil" : undefined}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white overflow-hidden">
            {perfil.foto ? (
              <Image src={perfil.foto} alt="Foto de perfil" width={32} height={32} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold">{perfil.nome?.charAt(0) || "U"}</span>
            )}
          </div>
          {expanded && (
            <div className="ml-2 overflow-hidden animate-fade-in">
              <p className="text-sm font-medium text-white truncate">{perfil.nome || "Usuário"}</p>
              <p className="text-xs text-slate-400">Ver perfil</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}

