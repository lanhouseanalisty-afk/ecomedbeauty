import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Youtube, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#2b0f54] text-white pt-16 pb-8 relative overflow-hidden">
      {/* Background Pattern/Overlay */}
      <div className="absolute inset-0 bg-[url('/medbeauty/footer-bg.jpg')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <div className="mb-6">
              {/* Recreating logo in white for footer */}
              <Link to="/" className="group cursor-pointer flex items-center">
                <span className="font-sans text-3xl font-medium tracking-wide text-white uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ECB546] self-baseline mt-2"></span>
                  MEDBEAUTY
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ECB546] self-start mb-2"></span>
                </span>
              </Link>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              A Medbeauty é especializada em soluções estéticas de alta performance, desenvolvidas com tecnologia e foco em resultados naturais e seguros.
            </p>
            <div className="flex gap-4 pt-2">
              {[
                { icon: Instagram, href: "https://instagram.com/medbeauty" },
                { icon: Facebook, href: "https://facebook.com/medbeauty" },
                { icon: Linkedin, href: "https://linkedin.com/company/medbeauty" },
                { icon: Youtube, href: "https://youtube.com/medbeauty" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-[#ECB546] hover:text-[#2b0f54] p-2 rounded-full transition-all duration-300"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6 text-[#ECB546]">Navegação</h3>
            <ul className="space-y-3">
              {[
                { label: "Home", path: "/" },
                { label: "Sobre Nós", path: "/sobre" },
                { label: "Produtos", path: "/produtos" },
                { label: "Área do Aluno", path: "/area-do-aluno" },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link to={item.path} className="text-gray-300 hover:text-[#ECB546] transition-colors flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#ECB546]" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Certificação */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6 text-[#ECB546]">Certificação</h3>
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-8">
              <p className="text-sm text-gray-300 flex-1">
                A Medbeauty é certificada com os mais rigorosos selos de qualidade e segurança do mercado global, garantindo excelência em cada formulação.
              </p>
              <div className="flex justify-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                <div className="border border-white/20 px-4 py-2 rounded-lg text-xs font-bold tracking-widest">ANVISA</div>
                <div className="border border-white/20 px-4 py-2 rounded-lg text-xs font-bold tracking-widest">ISO 9001</div>
                <div className="border border-white/20 px-4 py-2 rounded-lg text-xs font-bold tracking-widest">GMP</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} MedBeauty. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link to="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
            <Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
