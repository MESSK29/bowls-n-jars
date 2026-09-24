import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-lg mx-auto"
      >
        <h1 className="font-heading text-8xl font-bold text-terracotta-500">404</h1>
        <h2 className="font-heading text-3xl font-semibold text-clay-900">
          Page Not Found
        </h2>
        <p className="text-clay-600">
          It looks like the page you are looking for has been moved or no longer exists.
        </p>
        
        <div className="pt-4">
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-terracotta-500 text-white font-semibold rounded-xl hover:bg-terracotta-600 transition-colors shadow-warm-sm"
          >
            <Home className="w-5 h-5" />
            <span>Return to Shop</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
