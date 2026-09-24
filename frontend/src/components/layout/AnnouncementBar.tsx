import React from 'react';
import { Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { useStoreConfigStore } from '../../stores/storeConfigStore';
import { useLanguage } from '../../context/LanguageContext';
import { price } from '../../utils/currency';

export const AnnouncementBar: React.FC = () => {
  const { config } = useStoreConfigStore();
  const { language } = useLanguage();

  const announcementText = 
    language === 'hi' ? config.announcementTextHi || config.announcementText :
    language === 'te' ? config.announcementTextTe || config.announcementText :
    config.announcementText;

  return (
    <div className="bg-clay-800 text-cream-200 text-xs py-2 px-4 border-b border-clay-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center space-x-2 text-clay-400">
          <ShieldCheck className="w-3.5 h-3.5 text-sage-500" />
          <span>BIS-certified food-safe glazes • 100% Lead-free</span>
        </div>

        <div className="flex items-center justify-center space-x-2 w-full md:w-auto text-center font-medium">
          <Truck className="w-3.5 h-3.5 text-terracotta-400 shrink-0" />
          <span>{announcementText}</span>
        </div>

        <div className="hidden md:flex items-center space-x-1.5 text-clay-400">
          <Sparkles className="w-3.5 h-3.5 text-ochre-400 shrink-0" />
          <span>Code <strong className="text-cream-50 font-mono">{config.promoCode}</strong> for {config.promoDiscountPercent}% off</span>
        </div>
      </div>
    </div>
  );
};
