import Link from "next/link";
import { MessageCircle, Scale, Users, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950 relative overflow-y-auto overflow-x-hidden px-4">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--color-saffron)] blur-[100px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--color-deep-blue)] blur-[100px]" />
      </div>

      <main className="z-10 flex flex-col items-center text-center w-full max-w-5xl py-4 md:py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-[var(--color-deep-blue)] text-sm font-semibold mb-6 lg:mb-8 border border-blue-100 shadow-sm">
          <Scale className="w-4 h-4" />
          Free & Accessible Legal Aid
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-5xl font-extrabold text-[#111] dark:text-white tracking-tight mb-4 leading-tight">
          You don't have to face your <br className="hidden md:block"/>
          <span className="text-[var(--color-saffron)] px-1 relative">
            legal battles alone
          </span>
        </h1>
        
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl font-light">
          We simplify complex legal language, connect you with authorized legal aid centers, and protect your rights. Free, confidential, and completely in your language.
        </p>

        <Link 
          href="/chat"
          className="group flex items-center gap-3 bg-[var(--color-deep-blue)] text-white px-8 py-4 rounded-full text-lg md:text-xl font-semibold shadow-xl shadow-blue-900/20 hover:bg-blue-900 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          Describe Your Problem
        </Link>
        
        <div className="mt-10 lg:mt-16 w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="flex flex-col items-center p-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-transform hover:-translate-y-1">
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-[var(--color-saffron)]" />
            </div>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">1.4B</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Citizens Enabled</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-transform hover:-translate-y-1">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
              <Scale className="w-5 h-5 text-[var(--color-deep-blue)] dark:text-blue-400" />
            </div>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">1.5M</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Lawyers in India</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-transform hover:-translate-y-1">
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-[var(--color-saffron)]" />
            </div>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">100%</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Free Guidance</p>
          </div>
        </div>
      </main>
    </div>
  );
}
