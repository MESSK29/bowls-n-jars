import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useLanguage } from '../context/LanguageContext';
import { useStoreConfigStore } from '../stores/storeConfigStore';
import { AuthModal } from '../components/common/AuthModal';
import { BowlsNJarsText } from '../components/common/BowlsNJarsText';
import { Volume2, VolumeX, ChevronDown, ArrowRight, MapPin, Mail, Phone, Clock } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../landing.css';

gsap.registerPlugin(ScrollTrigger);

const videos = [
  '/videos/video1.mp4',
  '/videos/video2.mp4'
];

// Working ceramic images
const images = [
  '/images/bowls.png',
  '/images/plates.png',
  '/images/dinner-set.png',
  '/images/casserole.png',
  '/images/spoons.png',
  '/images/mugs.png',
  '/images/trays.png',
  '/images/tea-sets.png',
];

export const LandingPage: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { config } = useStoreConfigStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log("Autoplay prevented:", err);
      });
    }
  }, [currentVideoIndex]);

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      if (!videoRef.current.muted && videoRef.current.paused) {
        videoRef.current.play().catch(() => { });
      }
    }
  };

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  // GSAP Animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(".small-team .word > span", { y: "105%" });
      gsap.set(".big-results .letter", { y: 80, opacity: 0 });
      gsap.set(".g-card", { opacity: 0 });
      gsap.set(".stats-inner", { opacity: 0 });

      // Apply initial rotations and positions for cards
      const cards = gsap.utils.toArray('.anim-card') as HTMLElement[];
      cards.forEach((card) => {
        const rot = parseFloat(card.dataset.rot || '0');
        card.dataset.restRot = rot.toString();
        gsap.set(card, { y: -800, rotation: rot + 25, opacity: 0, scale: 0.7 });
      });

      // Intro Timeline (Triggered when scrolled into view)
      ScrollTrigger.create({
        trigger: ".hero-animated",
        start: "top 60%",
        onEnter: () => {
          const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
          intro
            .to(".small-team .word > span", { y: "0%", duration: 0.9, stagger: 0.08 }, 0.1)
            .to(".big-results .letter", { y: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: "back.out(1.6)" }, 0.3)
            .to(".anim-card", {
              y: 0,
              opacity: 1,
              scale: 1,
              rotation: (i, el) => parseFloat(el.dataset.restRot || '0'),
              duration: 1.1,
              stagger: { each: 0.08, from: "center" },
              ease: "back.out(1.4)"
            }, 0.5)
            .add(() => {
              // Float animation after intro
              cards.forEach((card, i) => {
                const rot = parseFloat(card.dataset.restRot || '0');
                gsap.to(card, {
                  y: `+=${8 + (i % 3) * 5}`,
                  rotation: rot + (i % 2 === 0 ? 1.5 : -1.5),
                  duration: 3 + (i % 4) * 0.5,
                  delay: i * 0.1,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: -1
                });
              });
            });
        },
        once: true
      });

      // Scroll fanning out effect (scaled dynamically for mobile/tablet to avoid overflow)
      ScrollTrigger.create({
        trigger: ".hero-animated",
        start: "top top",
        end: "bottom top",
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(".big-results", { scale: 1 + 0.12 * p, opacity: 1 - 0.4 * p });
          gsap.set(".small-team", { y: -50 * p, opacity: 1 - p * 1.5 });

          // Scale moves down on mobile & tablet so cards never push past screen edges
          const screenWidth = window.innerWidth;
          const moveScale = screenWidth < 640 ? 0.32 : screenWidth < 1024 ? 0.65 : 1;

          const moves = [
            { x: -260, y: -40, rot: -25 },
            { x: -200, y: 20, rot: -18 },
            { x: -120, y: 80, rot: -10 },
            { x: -40, y: 120, rot: -4 },
            { x: 40, y: 120, rot: 4 },
            { x: 120, y: 80, rot: 12 },
            { x: 200, y: 20, rot: 22 },
            { x: 260, y: -40, rot: 28 }
          ];

          cards.forEach((card, i) => {
            const m = moves[i];
            const rest = parseFloat(card.dataset.restRot || '0');
            gsap.set(card, {
              x: m.x * p * moveScale,
              y: m.y * p * moveScale,
              rotation: rest + m.rot * p * (screenWidth < 640 ? 0.5 : 1)
            });
          });
        }
      });

      // Gallery Grid Reveal
      gsap.from(".eyebrow, .gallery-head h2, .gallery-head p", {
        opacity: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".gallery-head", start: "top 80%" }
      });

      gsap.to(".g-card", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".gallery-grid", start: "top 80%" }
      });
      gsap.from(".g-card", {
        y: 60,
        scale: 0.92,
        rotation: (i) => (i % 2 === 0 ? -2 : 2),
        duration: 1,
        stagger: 0.08,
        ease: "back.out(1.3)",
        scrollTrigger: { trigger: ".gallery-grid", start: "top 80%" }
      });

      // Stats Reveal
      gsap.to(".stats-inner", {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ".stats", start: "top 80%" }
      });
      gsap.from(".stats-inner", {
        y: 40,
        scale: 0.97,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ".stats", start: "top 80%" }
      });

      ScrollTrigger.create({
        trigger: ".stats",
        start: "top 75%",
        onEnter: () => {
          document.querySelectorAll(".stat-block .num").forEach((el) => {
            const targetEl = el as HTMLElement;
            const target = parseFloat(targetEl.dataset.count || '0');
            const span = targetEl.querySelector("span");
            if (span) {
              gsap.to({ v: 0 }, {
                v: target,
                duration: 2,
                ease: "power2.out",
                onUpdate: function () {
                  span.textContent = Math.floor(this.targets()[0].v).toLocaleString();
                }
              });
            }
          });
        },
        once: true
      });

    }, containerRef); // Scope to container

    // Parallax Logic - only on fine pointer devices (desktops/laptops with mouse)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    let mx = 0, my = 0, tx = 0, ty = 0;
    let rafId: number | null = null;

    const onMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const r = heroRef.current.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      }
    };
    const onMouseLeave = () => { mx = 0; my = 0; };

    const parallax = () => {
      tx += (mx - tx) * 0.05;
      ty += (my - ty) * 0.05;

      const cards = containerRef.current?.querySelectorAll('.anim-card');
      if (cards) {
        cards.forEach((c) => {
          const card = c as HTMLElement;
          const d = parseFloat(card.dataset.depth || '8');
          card.style.translate = `${tx * d}px ${ty * d * 0.5}px`;
        });
      }
      rafId = requestAnimationFrame(parallax);
    };

    if (isFinePointer && heroRef.current) {
      heroRef.current.addEventListener('mousemove', onMouseMove);
      heroRef.current.addEventListener('mouseleave', onMouseLeave);
      rafId = requestAnimationFrame(parallax);
    }

    // Card Hover Logic - Desktop only (Elegant, organic 'flower opening' effect)
    const animCards = containerRef.current?.querySelectorAll('.anim-card');
    
    const onCardEnter = (card: HTMLElement) => {
      const img = card.querySelector('img');
      if (!img) return;
      
      // Bring container to front
      gsap.set(card, { zIndex: 20 });
      
      // 'Bloom' effect on the image itself, avoiding conflict with container's float animation
      gsap.to(img, {
        scale: 1.12,
        rotation: 3,
        y: -10,
        duration: 0.8,
        ease: "power3.out",
        overwrite: "auto"
      });
    };
    
    const onCardLeave = (card: HTMLElement) => {
      const img = card.querySelector('img');
      if (!img) return;
      
      // 'Close' effect
      gsap.to(img, {
        scale: 1,
        rotation: 0,
        y: 0,
        duration: 0.9,
        ease: "power2.inOut",
        overwrite: "auto",
        onComplete: () => {
          gsap.set(card, { zIndex: 1 });
        }
      });
    };

    if (isFinePointer && animCards) {
      animCards.forEach((c) => {
        const card = c as HTMLElement;
        card.addEventListener('mouseenter', () => onCardEnter(card));
        card.addEventListener('mouseleave', () => onCardLeave(card));
      });
    }

    return () => {
      ctx.revert();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (heroRef.current) {
        heroRef.current.removeEventListener('mousemove', onMouseMove);
        heroRef.current.removeEventListener('mouseleave', onMouseLeave);
      }
      if (animCards) {
        animCards.forEach((c) => {
          const card = c as HTMLElement;
          card.removeEventListener('mouseenter', () => onCardEnter(card));
          card.removeEventListener('mouseleave', () => onCardLeave(card));
        });
      }
    };
  }, []);


  return (
    <div className="font-sans" ref={containerRef}>

      {/* SECTION 1: Full-Screen Video Background */}
      <div className="relative h-[100dvh] w-full flex flex-col justify-end items-center overflow-hidden bg-clay-950">

        {/* Background Video */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-clay-950">
          {videos.map((src, index) => {
            return (
              <video
                key={src}
                ref={index === currentVideoIndex ? videoRef : null}
                muted={isMuted}
                playsInline
                onEnded={index === currentVideoIndex ? handleVideoEnded : undefined}
                className={`absolute inset-0 w-full h-[100dvh] object-contain md:object-cover transition-opacity duration-1000 ${
                  index === currentVideoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <source src={src} type="video/mp4" />
              </video>
            );
          })}
        </div>

        {/* Audio Toggle Overlay */}
        <div className="absolute bottom-6 right-6 z-30">
          <button
            onClick={toggleMute}
            className="min-h-[44px] min-w-[44px] p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all shadow-lg border border-white/20 flex items-center justify-center space-x-2"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider pr-1">Unmute</span>
              </>
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <button
            onClick={scrollToContent}
            className="min-h-[44px] min-w-[44px] p-2 text-white/80 hover:text-white transition-colors flex flex-col items-center justify-center"
            aria-label="Scroll down to content"
          >
            <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase mb-1 drop-shadow-md">Scroll to Explore</span>
            <ChevronDown className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-lg" />
          </button>
        </div>

      </div>

      {/* SECTION 2: GSAP ANIMATED CONTENT */}
      <div className="landing-body">

        {/* HERO ANIMATED */}
        <section className="hero-animated" ref={heroRef}>
          <h1 className="small-team">
            <span className="word"><span>Handcrafted,</span></span>&nbsp;<span className="word"><span>timeless</span></span>
          </h1>

          <div className="big-results-wrap">
            <div className="big-results">
              <span className="letter">c</span><span className="letter">e</span><span className="letter">r</span><span className="letter">a</span><span className="letter">m</span><span className="letter">i</span><span className="letter">c</span><span className="letter">s</span>
            </div>
          </div>

          {/* Card row of images */}
          <div className="cards-row">
            <div className="anim-card anim-card-1" data-rot="-9" data-depth="14">
              <img src={images[0]} alt="" />
            </div>
            <div className="anim-card anim-card-2" data-rot="-5" data-depth="10">
              <img src={images[1]} alt="" />
            </div>
            <div className="anim-card anim-card-3" data-rot="-2" data-depth="8">
              <img src={images[2]} alt="" />
            </div>
            <div className="anim-card anim-card-4" data-rot="3" data-depth="12">
              <img src={images[3]} alt="" />
            </div>
            <div className="anim-card anim-card-5" data-rot="0" data-depth="6">
              <img src={images[4]} alt="" />
            </div>
            <div className="anim-card anim-card-6" data-rot="4" data-depth="11">
              <img src={images[5]} alt="" />
            </div>
            <div className="anim-card anim-card-7" data-rot="7" data-depth="9">
              <img src={images[6]} alt="" />
            </div>
            <div className="anim-card anim-card-8" data-rot="-4" data-depth="13">
              <img src={images[7]} alt="" />
            </div>
          </div>
        </section>

        {/* GALLERY GRID */}
        <section id="bestsellers" className="gallery-section">
          <div className="gallery-head">
            <div>
              <div className="eyebrow">ARTISANAL COLLECTION</div>
              <h2>Earthy Tones <br />of <em>Stoneware</em> and <em>Porcelain</em>.</h2>
            </div>
            <p>Explore our curated collections designed to bring warmth, intention, and enduring quality to your everyday rituals.</p>
          </div>

          <div className="gallery-grid">
            <div className="g-card">
              <img src={images[0]} alt="Bowls" />
              <div className="g-meta">
                <div className="nm">Bowls</div>
              </div>
            </div>
            <div className="g-card">
              <img src={images[1]} alt="Plates" />
              <div className="g-meta">
                <div className="nm">Plates</div>
              </div>
            </div>
            <div className="g-card">
              <img src={images[2]} alt="Dinner Set" />
              <div className="g-meta">
                <div className="nm">Dinner Set</div>
              </div>
            </div>
            <div className="g-card">
              <img src={images[3]} alt="Casserole" />
              <div className="g-meta">
                <div className="nm">Casserole</div>
              </div>
            </div>
            <div className="g-card">
              <img src={images[4]} alt="Spoons" />
              <div className="g-meta">
                <div className="nm">Spoons</div>
              </div>
            </div>
            <div className="g-card">
              <img src={images[5]} alt="Mugs" />
              <div className="g-meta">
                <div className="nm">Mugs</div>
              </div>
            </div>
            <div className="g-card">
              <img src={images[6]} alt="Trays" />
              <div className="g-meta">
                <div className="nm">Trays</div>
              </div>
            </div>
            <div className="g-card">
              <img src={images[7]} alt="Tea Sets" />
              <div className="g-meta">
                <div className="nm">Tea Sets</div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="stats">
          <div className="stats-inner">
            <h3>Handcrafted<br /> <em>Excellence</em>.</h3>
            <div className="stat-block">
              <div className="num" data-count="1200"><span>0</span><small>°C</small></div>
              <div className="lbl">High-Fired</div>
            </div>
            <div className="stat-block">
              <div className="num" data-count="100"><span>0</span><small>%</small></div>
              <div className="lbl">Lead-Free</div>
            </div>
            <div className="stat-block">
              <div className="num" data-count="5"><span>0</span><small>★</small></div>
              <div className="lbl">Avg Rating</div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="pb-24 sm:pb-32 pt-8 px-4 flex justify-center relative z-10">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full max-w-sm sm:w-auto inline-flex items-center justify-center gap-3 bg-clay-900 hover:bg-black text-cream-50 border-none px-8 sm:px-10 py-4 sm:py-5 min-h-[48px] rounded-full font-sans text-base sm:text-lg font-bold cursor-pointer shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all group"
          >
            <span>{t('landing.enter', 'Enter the Shop')}</span>
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-terracotta-400 to-terracotta-600 flex items-center justify-center text-white transition-transform group-hover:rotate-45 shrink-0">
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </section>

        {/* Cinematic Footer Section */}
        <section className="bg-clay-900 text-cream-50 pt-16 sm:pt-20 pb-12 px-4 sm:px-6 relative z-10 border-t-8 border-terracotta-500 overflow-hidden">
          <BowlsNJarsText />
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 relative z-10">
            
            {/* Brand Column */}
            <div className="space-y-4">
              <h3 className="font-heading text-2xl sm:text-3xl font-bold tracking-wide">Bowls 'N' Jars</h3>
              <p className="text-clay-400 text-sm leading-relaxed max-w-xs">
                Handcrafted Ceramics for Everyday Living. Grounding, natural, and built to outlive fast-fashion consumption.
              </p>
            </div>

            {/* Address Column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 text-terracotta-400 mb-1">
                <MapPin className="w-5 h-5 shrink-0" />
                <h4 className="font-heading text-lg font-semibold text-white">Our Office Address</h4>
              </div>
              <p className="text-clay-400 text-sm leading-relaxed max-w-xs whitespace-pre-line">
                {config.storeAddress}
              </p>
            </div>

            {/* Contact Column */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-terracotta-400 mb-1">
                  <Phone className="w-5 h-5 shrink-0" />
                  <h4 className="font-heading text-lg font-semibold text-white">Call Us</h4>
                </div>
                <div className="flex flex-col space-y-1 text-clay-400 text-sm font-sans tracking-wide">
                  <a href={`tel:${config.contactPhone1.replace(/[^0-9+]/g, '')}`} className="min-h-[44px] flex items-center hover:text-terracotta-400 transition-colors w-max">{config.contactPhone1}</a>
                  <a href={`tel:${config.contactPhone2.replace(/[^0-9+]/g, '')}`} className="min-h-[44px] flex items-center hover:text-terracotta-400 transition-colors w-max">{config.contactPhone2}</a>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 text-terracotta-400 mb-1">
                  <Mail className="w-5 h-5 shrink-0" />
                  <h4 className="font-heading text-lg font-semibold text-white">General Enquiries</h4>
                </div>
                <a href={`mailto:${config.contactEmail}`} className="min-h-[44px] flex items-center text-clay-400 text-sm font-sans hover:text-terracotta-400 transition-colors w-max">
                  {config.contactEmail}
                </a>
              </div>
            </div>

            {/* Timings Column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 text-terracotta-400 mb-1">
                <Clock className="w-5 h-5 shrink-0" />
                <h4 className="font-heading text-lg font-semibold text-white">Our Timing</h4>
              </div>
              <p className="text-clay-400 text-sm bg-clay-800 p-3 rounded-xl border border-clay-700 inline-block whitespace-pre-line">
                {config.storeTimings}
              </p>
            </div>

          </div>
          
          <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-clay-800 text-center text-clay-500 text-xs relative z-10">
            &copy; {new Date().getFullYear()} Bowls 'N' Jars. All rights reserved.
          </div>
        </section>
      </div>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
};
