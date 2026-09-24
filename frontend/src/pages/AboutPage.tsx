import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Leaf, Shield, HeartHandshake, ArrowRight, Flame, Droplet, Mountain } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero */}
      <section className="bg-sand-100 py-16 sm:py-24 border-b border-sand-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600 block">
            Our Studio Heritage
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-clay-900 leading-tight">
            Handcrafted for Everyday Living.
          </h1>
          <p className="text-base sm:text-lg text-clay-600 leading-relaxed max-w-2xl mx-auto">
            We believe the vessels we drink from, eat our daily meals in, and carry to study or work should feel grounding, natural, and built to outlive fast-fashion consumption.
          </p>
        </div>
      </section>

      {/* Origin Story Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden aspect-4/3 shadow-warm-md border border-sand-300">
              <img
                src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000&auto=format&fit=crop"
                alt="Studio pottery pieces drying"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600 block">
              Where It Began
            </span>
            <h2 className="font-heading text-3xl font-bold text-clay-900 leading-snug">
              From a single kick-wheel in Vijayawada to kitchen tables worldwide.
            </h2>
            <p className="text-sm text-clay-600 leading-relaxed">
              Bowls &apos;N&apos; Jars started in 2021 with Elena Vance, a ceramic artist determined to make durable pottery accessible without losing the tactile warmth of human hands.
            </p>
            <p className="text-sm text-clay-600 leading-relaxed">
              Every curve of our ribbed bowls and the airtight seal of our cork storage jars was designed to elevate simple morning rituals — a steaming cup of pour-over coffee, a bowl of warmed oats, or fresh sea salt on a rustic tapas platter.
            </p>
          </div>
        </div>
      </section>

      {/* Why School & Workspace Essentials */}
      <section className="bg-cream-100 py-16 border-y border-sand-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
              <span className="text-xs font-bold uppercase tracking-widest text-sage-600 block">
                The Dual Philosophy
              </span>
              <h2 className="font-heading text-3xl font-bold text-clay-900 leading-snug">
                Why School &amp; Workspace Essentials?
              </h2>
              <p className="text-sm text-clay-600 leading-relaxed">
                Many asked why a ceramic studio ventured into everyday school and desk goods. The answer was simple: the plastic containers and synthetic bags people carry to school and work felt disposable and cold.
              </p>
              <p className="text-sm text-clay-600 leading-relaxed">
                We engineered our <strong>Ceramic-Lined Bento Lunchboxes</strong> and <strong>Heavy Waxed Canvas Pouches</strong> to carry that same grounding comfort outside the home. Ceramic interiors preserve pure taste without microplastics or lingering metallic odors.
              </p>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="rounded-3xl overflow-hidden aspect-4/3 shadow-warm-md border border-sand-300">
                <img
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop"
                  alt="Minimalist workspace essentials with notebook and pencil case"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The 5-Step Craft Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600 block mb-1">
            The Studio Process
          </span>
          <h2 className="font-heading text-3xl font-bold text-clay-900">
            Formed by Earth, Water, and Fire
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-sand-200 space-y-3 shadow-warm-sm">
            <span className="font-mono text-terracotta-500 font-bold text-lg">01</span>
            <h4 className="font-heading font-bold text-base text-clay-900">Clay Wedging</h4>
            <p className="text-xs text-clay-500 leading-relaxed">
              Oregon stoneware blends are hand-wedged to expel air bubbles and align mineral grains.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-sand-200 space-y-3 shadow-warm-sm">
            <span className="font-mono text-terracotta-500 font-bold text-lg">02</span>
            <h4 className="font-heading font-bold text-base text-clay-900">Wheel Throwing</h4>
            <p className="text-xs text-clay-500 leading-relaxed">
              Sculpted by hand on the potter&apos;s wheel with intentional finger ribs and weighted bases.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-sand-200 space-y-3 shadow-warm-sm">
            <span className="font-mono text-terracotta-500 font-bold text-lg">03</span>
            <h4 className="font-heading font-bold text-base text-clay-900">Bisque Firing</h4>
            <p className="text-xs text-clay-500 leading-relaxed">
              Fired at 900°C for 14 hours to transition raw clay into porous ceramic ready for glazing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-sand-200 space-y-3 shadow-warm-sm">
            <span className="font-mono text-terracotta-500 font-bold text-lg">04</span>
            <h4 className="font-heading font-bold text-base text-clay-900">Natural Glazes</h4>
            <p className="text-xs text-clay-500 leading-relaxed">
              Dipped in custom recipes made from feldspar, wood ash, and iron oxides without lead.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-sand-200 space-y-3 shadow-warm-sm">
            <span className="font-mono text-terracotta-500 font-bold text-lg">05</span>
            <h4 className="font-heading font-bold text-base text-clay-900">High-Fire (1200°C)</h4>
            <p className="text-xs text-clay-500 leading-relaxed">
              Vitrified into dense, chip-resistant dinnerware that will last for generations.
            </p>
          </div>
        </div>
      </section>

      {/* Care Guide Anchor */}
      <section id="care" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-sand-100 p-8 sm:p-12 rounded-3xl border border-sand-300 space-y-6">
        <h3 className="font-heading text-2xl font-bold text-clay-900 text-center">
          Ceramic Care 101
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-clay-700">
          <div className="p-4 bg-white/80 rounded-2xl border border-sand-200 space-y-1">
            <span className="font-bold text-clay-900 block text-sm">Dishwasher &amp; Microwave Safe</span>
            <p>Our stoneware is non-porous and withstands modern dishwasher detergents and everyday microwave heating.</p>
          </div>
          <div className="p-4 bg-white/80 rounded-2xl border border-sand-200 space-y-1">
            <span className="font-bold text-clay-900 block text-sm">Prevent Thermal Shock</span>
            <p>Avoid taking chilled bowls straight from the refrigerator into a preheated 400°F oven. Gradual warming prevents hairline stress.</p>
          </div>
          <div className="p-4 bg-white/80 rounded-2xl border border-sand-200 space-y-1">
            <span className="font-bold text-clay-900 block text-sm">Cork &amp; Wood Accents</span>
            <p>For storage jars with natural Portuguese cork lids, wipe the lid with a damp towel and allow to air dry.</p>
          </div>
          <div className="p-4 bg-white/80 rounded-2xl border border-sand-200 space-y-1">
            <span className="font-bold text-clay-900 block text-sm">Waxed Canvas Care</span>
            <p>Never machine-wash waxed cotton pouches. Use cold water and a soft brush to spot clean surface smudges.</p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-2xl font-semibold text-xs shadow-warm-sm transition-all"
          >
            <span>Explore The Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
};
