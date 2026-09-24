import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoreConfig {
  announcementText: string;
  announcementTextHi: string;
  announcementTextTe: string;
  freeShippingThreshold: number;
  promoCode: string;
  promoDiscountPercent: number;
  heroBadgeText: string;
  heroHeadline: string;
  heroSubheadline: string;
  studioCity: string;
  leadTimeDays: string;
  enableCod: boolean;
  contactEmail: string;
  contactPhone1: string;
  contactPhone2: string;
  storeAddress: string;
  storeTimings: string;
}

interface StoreConfigState {
  config: StoreConfig;
  updateConfig: (updates: Partial<StoreConfig>) => void;
  resetConfig: () => void;
}

const defaultConfig: StoreConfig = {
  announcementText: 'Pan-India Free Shipping on orders above ₹4,999 • Artisanal Lead-Free Ceramics',
  announcementTextHi: 'अखिल भारतीय डिलीवरी • ₹4,999 से अधिक पर मुफ्त शिपिंग • 100% सीसा रहित',
  announcementTextTe: 'భారతదేశం అంతటా ఉచిత డెలివరీ • ₹4,999 పైగా ఆర్డర్లపై ఉచితం • 100% లెడ్ రహితం',
  freeShippingThreshold: 4999,
  promoCode: 'FESTIVE15',
  promoDiscountPercent: 15,
  heroBadgeText: 'Handcrafted in Jaipur & Khurja • 100% Pure Stoneware',
  heroHeadline: 'Handcrafted Ceramics for Everyday Living',
  heroSubheadline: 'Mindfully crafted stoneware bowls, spice jars, and eco-friendly school essentials. High-fired at 1200°C for chip-resistant longevity.',
  studioCity: 'Jaipur & Khurja Craft Guild',
  leadTimeDays: '2-4 business days dispatch',
  enableCod: true,
  contactEmail: 'bowlsnjars@gmail.com',
  contactPhone1: '+91-9866309229',
  contactPhone2: '+91-7306966999',
  storeAddress: 'Door No:- 74-1-16, Opposite Auto Nagar Gate, Mg Road, Auto Nagar, Vijayawada, Andhra Pradesh 520007',
  storeTimings: 'Mon - Sun : 10:00 AM - 10:00 PM',
};

export const useStoreConfigStore = create<StoreConfigState>()(
  persist(
    (set) => ({
      config: defaultConfig,
      updateConfig: (updates) =>
        set((state) => ({
          config: { ...state.config, ...updates },
        })),
      resetConfig: () => set({ config: defaultConfig }),
    }),
    {
      name: 'bnj_store_config',
    }
  )
);
