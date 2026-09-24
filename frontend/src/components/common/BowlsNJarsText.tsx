"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export const BowlsNJarsText = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({
    cx: "50%",
    cy: "50%",
  });

  useEffect(() => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();

      const x = ((cursor.x - rect.left) / rect.width) * 100;
      const y = ((cursor.y - rect.top) / rect.height) * 100;

      setMaskPosition({
        cx: `${x}%`,
        cy: `${y}%`,
      });
    }
  }, [cursor]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center opacity-30 z-0 pointer-events-none sm:pointer-events-auto">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 500 100"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={(e) =>
          setCursor({
            x: e.clientX,
            y: e.clientY,
          })
        }
        className="select-none min-w-[300px] md:min-w-[800px] w-full"
      >
        <defs>
          <linearGradient
            id="bowlsGradient"
            gradientUnits="userSpaceOnUse"
          >
            {hovered && (
              <>
                <stop offset="0%" stopColor="#C86D51" />  {/* terracotta-500 */}
                <stop offset="25%" stopColor="#8A9A86" /> {/* sage-500 */}
                <stop offset="50%" stopColor="#D9856A" /> {/* terracotta-400 */}
                <stop offset="75%" stopColor="#E5DAC1" /> {/* sand-200 */}
                <stop offset="100%" stopColor="#5B6E57" /> {/* dark sage */}
              </>
            )}
          </linearGradient>

          <motion.radialGradient
            id="bowlsMaskGradient"
            gradientUnits="userSpaceOnUse"
            r="20%"
            initial={{
              cx: "50%",
              cy: "50%",
            }}
            animate={maskPosition}
            transition={{
              duration: 0,
              ease: "easeOut",
            }}
          >
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </motion.radialGradient>

          <mask id="bowlsTextMask">
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#bowlsMaskGradient)"
            />
          </mask>
        </defs>

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          strokeWidth="0.5"
          className="fill-transparent stroke-clay-700 font-heading font-bold text-7xl opacity-50"
          style={{
            opacity: hovered ? 0.4 : 0,
          }}
        >
          Bowls 'N' Jars
        </text>

        <motion.text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          strokeWidth="1"
          className="fill-transparent stroke-terracotta-500 font-heading font-bold text-7xl"
          initial={{
            strokeDashoffset: 1000,
            strokeDasharray: 1000,
          }}
          whileInView={{
            strokeDashoffset: 0,
            strokeDasharray: 1000,
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          Bowls 'N' Jars
        </motion.text>

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          stroke="url(#bowlsGradient)"
          strokeWidth="1"
          mask="url(#bowlsTextMask)"
          className="fill-transparent font-heading font-bold text-7xl"
        >
          Bowls 'N' Jars
        </text>
      </svg>
    </div>
  );
};
