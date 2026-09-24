import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    let title = "Bowls 'N' Jars | Handcrafted Ceramics for Everyday Living";

    switch (location.pathname) {
      case '/':
        title = "Bowls 'N' Jars | Handcrafted Ceramics for Everyday Living";
        break;
      case '/shop':
        title = "Shop | Bowls 'N' Jars";
        break;
      case '/products':
        title = "All Products | Bowls 'N' Jars";
        break;
      case '/about':
        title = "Our Story | Bowls 'N' Jars";
        break;
      case '/contact':
        title = "Contact Us | Bowls 'N' Jars";
        break;
      case '/account':
        title = "My Account | Bowls 'N' Jars";
        break;
      case '/checkout':
        title = "Checkout | Bowls 'N' Jars";
        break;
      case '/admin':
        title = "Admin Dashboard | Bowls 'N' Jars";
        break;
      default:
        if (location.pathname.startsWith('/product/')) {
          // Dynamic titles are hard without data, fallback to generic
          title = "Product Details | Bowls 'N' Jars";
        } else {
          title = "Page Not Found | Bowls 'N' Jars";
        }
    }

    document.title = title;
  }, [location.pathname]);

  return null;
};
