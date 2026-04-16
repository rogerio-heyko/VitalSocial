import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Heart, Globe, Navigation, Search, Activity, ShieldCheck, 
  MapPin, Smartphone, PieChart, MessageCircle
} from 'lucide-react';

export default function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  return (
    <div className="min-h-screen text-white relative">
      
      {/* Header Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-header">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-accent-500 fill-accent-500" />
            <span className="font-display font-bold text-2xl tracking-tight">Vital<span className="text-accent-500">Social</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
              {['pt', 'en', 'es'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    i18n.language === lang ? 'bg-primary-600 shadow-md' : 'hover:text-primary-500 opacity-60 hover:opacity-100'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <a href="#download" className="hidden md:flex bg-white text-dark-bg px-5 py-2 rounded-full font-semibold hover:bg-accent-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              {t('nav.downloadApp')}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 min-h-[90vh] flex items-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          
          {/* First Column (Left): Emotional Image with Slogan */}
          <motion.div 
            className="relative order-1 lg:order-1"
            initial={{ opacity: 0, scale: 0.9, x: -20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Decorative Elements around image */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary-500/20 to-accent-500/20 blur-2xl rounded-[3rem] opacity-50" />
            
            <div className="relative glass-panel p-3 rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              <img 
                src="/og-image.png" 
                alt="Família feliz Vital Social" 
                className="w-full aspect-[4/5] lg:aspect-auto lg:h-[600px] object-cover rounded-[2rem] transform transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Floating Badge - SLOGAN HERE */}
              <div className="absolute bottom-8 left-8 right-8 z-20 backdrop-blur-md bg-black/40 border border-white/10 p-5 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-500 flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white leading-tight">
                      {t('hero.slogan')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shield badge */}
            <motion.div 
              className="absolute -top-6 -left-6 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl hidden lg:block shadow-xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary-400" />
                <span className="text-xs font-bold tracking-widest text-primary-200 uppercase">Tecnologia Segura</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Second Column (Right): Text Content */}
          <motion.div className="text-left order-2 lg:order-2" {...fadeInUp}>
            <h1 className="text-5xl md:text-7xl font-black font-display leading-[1.05] mb-8 text-white">
              {t('hero.headline')}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed mb-10">
              {t('hero.subheadline')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <a href="#download" className="w-full sm:w-auto px-10 py-4 bg-accent-500 text-white font-bold rounded-2xl hover:bg-accent-600 transition-all shadow-[0_8px_30px_rgb(245,158,11,0.3)] hover:-translate-y-1 active:translate-y-0 text-center">
                {t('hero.cta.ngo')}
              </a>
              <a href="#download" className="w-full sm:w-auto px-10 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all hover:border-white/20 text-center">
                {t('hero.cta.donate')}
              </a>
            </div>
          </motion.div>

        </div>
      </section>

      {/* The Bridge (Vision) */}
      <section className="py-24 px-6 relative bg-primary-900/30 border-y border-white/5">
        <motion.div className="max-w-4xl mx-auto text-center" {...fadeInUp}>
          <Globe className="w-12 h-12 text-primary-500 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-8">
            {t('vision.title')}
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light">
            {t('vision.text')}
          </p>
        </motion.div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">{t('pillars.title')}</h2>
          <div className="w-24 h-1 bg-accent-500 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Pillar 1: NGO */}
          <motion.div 
            className="glass-panel rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary-500/20 text-primary-500 flex items-center justify-center mb-6">
              <PieChart className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-display mb-2">{t('pillars.ngo.title')}</h3>
            <p className="text-accent-500 font-medium mb-4">{t('pillars.ngo.subtitle')}</p>
            <p className="text-gray-400 mb-8">{t('pillars.ngo.description')}</p>
            
            <ul className="space-y-6">
              {(t('pillars.ngo.features', { returnObjects: true }) as any[]).map((f: any, i: number) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1 bg-white/10 p-1.5 rounded-full"><Activity className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-semibold text-white">{f.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{f.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Pillar 2: Donor */}
          <motion.div 
            className="glass-panel rounded-3xl p-8 border-accent-500/30 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl -mt-10 -mr-10" />
            <div className="w-16 h-16 rounded-2xl bg-accent-500/20 text-accent-500 flex items-center justify-center mb-6 relative z-10">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-display mb-2 relative z-10">{t('pillars.donor.title')}</h3>
            <p className="text-primary-500 font-medium mb-4 relative z-10">{t('pillars.donor.subtitle')}</p>
            <p className="text-gray-400 mb-8 relative z-10">{t('pillars.donor.description')}</p>
            
            <ul className="space-y-6 relative z-10">
              {(t('pillars.donor.features', { returnObjects: true }) as any[]).map((f: any, i: number) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1 bg-white/10 p-1.5 rounded-full"><Search className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-semibold text-white">{f.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{f.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Pillar 3: Beneficiary */}
          <motion.div 
            className="glass-panel rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-display mb-2">{t('pillars.beneficiary.title')}</h3>
            <p className="text-blue-400 font-medium mb-4">{t('pillars.beneficiary.subtitle')}</p>
            <p className="text-gray-400 mb-8">{t('pillars.beneficiary.description')}</p>
            
            <ul className="space-y-6">
              {(t('pillars.beneficiary.features', { returnObjects: true }) as any[]).map((f: any, i: number) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1 bg-white/10 p-1.5 rounded-full"><Navigation className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-semibold text-white">{f.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{f.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Tech Section */}
      <section className="py-24 px-6 bg-black/40 border-y border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 opacity-5 pointer-events-none">
          <ShieldCheck className="w-[600px] h-[600px]" />
        </div>
        <motion.div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10" {...fadeInUp}>
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">{t('tech.title')}</h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">{t('tech.text')}</p>
            <div className="flex gap-4">
              <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-mono tracking-widest text-primary-500">_SECURE</div>
              <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-mono tracking-widest text-accent-500">_GLOBAL</div>
              <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-mono tracking-widest text-blue-400">_SCALE</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer & Final Call to Action */}
      <footer id="download" className="relative pt-32 pb-12 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-6">
            {t('footer.headline')}
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            {t('footer.subheadline')}
          </p>

          {/* QR Code and App Download Box */}
          <div className="max-w-2xl mx-auto glass-panel p-8 md:p-12 rounded-3xl flex flex-col md:flex-row items-center gap-10">
            <div className="bg-white p-4 rounded-2xl shadow-2xl shrink-0">
              {/* Utiliza a Imagem QR passada pelo usuário */}
              <img src="/qr-apk.png" alt="QR Code Vital Social" className="w-48 h-48 rounded-lg" />
            </div>
            
            <div className="text-left flex-1">
              <h3 className="text-2xl font-bold font-display mb-2">{t('footer.scanQr')}</h3>
              <p className="text-gray-400 mb-6 text-sm">
                Escaneie com a câmera do seu celular para baixar a versão oficial do APK e se conectar à rede segura.
              </p>
              
              <a href="https://expo.dev/artifacts/eas/sv22DbDqBTiLFoV3F7HzKo.apk" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-500 transition-colors shadow-lg">
                <Smartphone className="w-5 h-5" />
                {t('footer.cta.download')}
              </a>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Disponível para dispositivos Android compatíveis.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Heart className="w-4 h-4 text-accent-500" />
            <span className="font-bold text-gray-400">Vital<span className="text-accent-500">Social</span></span>
          </div>
          <p>{t('footer.rights')}</p>
        </div>
      </footer>
      
      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://wa.me/5581996066014"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[100] bg-[#25D366] p-4 rounded-full shadow-[0_10px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_35px_rgba(37,211,102,0.6)] transition-shadow group flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-8 h-8 text-white fill-white group-hover:animate-pulse" />
      </motion.a>

    </div>
  );
}
