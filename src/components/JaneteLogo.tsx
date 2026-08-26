import React, { useState } from 'react';

interface JaneteLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  variant?: 'full' | 'badge' | 'inline';
}

export const JaneteLogo: React.FC<JaneteLogoProps> = ({
  className = '',
  size = 48,
  variant = 'badge'
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div 
      className={`inline-flex items-center justify-center select-none flex-shrink-0 relative ${className}`}
      style={{ width: size, height: size }}
    >
      {!imgError ? (
        <img
          src="/assets/images/logo_hortifruti_janete_hd_1787334921152.jpg"
          alt="Hortifruti da Janete"
          className="w-full h-full object-contain rounded-full drop-shadow-md hover:scale-105 transition-transform duration-200"
          width={typeof size === 'number' ? size : undefined}
          height={typeof size === 'number' ? size : undefined}
          loading="eager"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wood hoop outer ring */}
          <circle cx="100" cy="100" r="96" fill="#FDFBF7" stroke="#C5A059" strokeWidth="8" />
          <circle cx="100" cy="100" r="92" stroke="#8C682D" strokeWidth="1" strokeDasharray="3 3" />

          {/* Strawberry Illustration */}
          <g id="strawberry" transform="translate(60, 20)">
            {/* Strawberry Leaf Top */}
            <path
              d="M26 12 C24 5, 20 2, 17 4 C15 7, 18 11, 23 13 C18 11, 12 11, 10 14 C9 17, 14 18, 22 16 C16 19, 13 23, 15 25 C18 26, 23 23, 26 18 C28 23, 33 26, 36 24 C38 22, 35 18, 28 16 C35 18, 41 16, 41 13 C40 10, 34 11, 28 13 C32 10, 34 6, 31 4 C28 3, 27 7, 26 12 Z"
              fill="#527953"
              stroke="#38302B"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Strawberry Body */}
            <path
              d="M24 16 C10 17, 3 30, 8 46 C12 58, 21 67, 26 70 C31 67, 40 58, 44 46 C48 30, 40 17, 26 16 Z"
              fill="#D92338"
              stroke="#38302B"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Strawberry Seeds */}
            <ellipse cx="18" cy="30" rx="1.5" ry="2.2" fill="#FFE5E8" />
            <ellipse cx="26" cy="27" rx="1.5" ry="2.2" fill="#FFE5E8" />
            <ellipse cx="34" cy="31" rx="1.5" ry="2.2" fill="#FFE5E8" />
            <ellipse cx="15" cy="42" rx="1.5" ry="2.2" fill="#FFE5E8" />
            <ellipse cx="23" cy="40" rx="1.5" ry="2.2" fill="#FFE5E8" />
            <ellipse cx="31" cy="43" rx="1.5" ry="2.2" fill="#FFE5E8" />
            <ellipse cx="20" cy="53" rx="1.5" ry="2.2" fill="#FFE5E8" />
            <ellipse cx="27" cy="54" rx="1.5" ry="2.2" fill="#FFE5E8" />
          </g>

          {/* Lemon Illustration */}
          <g id="lemon" transform="translate(102, 34)">
            {/* Lemon Body */}
            <path
              d="M12 28 C14 16, 26 7, 40 10 C54 13, 62 26, 58 40 C55 52, 42 61, 28 58 C14 55, 9 42, 12 28 Z"
              fill="#F5C518"
              stroke="#38302B"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M42 9 C46 7, 50 8, 48 12" stroke="#38302B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M12 45 C9 48, 8 52, 12 51" stroke="#38302B" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* "hortifruti" text in Dark Warm Brown */}
          <text
            x="100"
            y="108"
            textAnchor="middle"
            fill="#38302B"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="28"
            letterSpacing="-0.5"
          >
            hortifruti
          </text>

          {/* "da" badge circle in Dark Warm Brown */}
          <g transform="translate(34, 115)">
            <circle cx="12" cy="12" r="11" fill="#38302B" />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="cursive, 'Brush Script MT', 'Dancing Script', sans-serif"
              fontStyle="italic"
              fontWeight="bold"
              fontSize="12"
            >
              da
            </text>
          </g>

          {/* "Janete" calligraphy text in Dark Warm Brown */}
          <text
            x="108"
            y="154"
            textAnchor="middle"
            fill="#38302B"
            fontFamily="'Brush Script MT', 'Pacifico', cursive"
            fontWeight="bold"
            fontSize="46"
          >
            Janete
          </text>

          {/* Mint / Teal Leaf Accents on the right */}
          <g id="leaf-accents" transform="translate(156, 118)">
            <path
              d="M6 3 C12 1, 16 7, 14 12 C10 14, 4 10, 6 3 Z"
              fill="#2FA896"
              stroke="#38302B"
              strokeWidth="1.5"
            />
            <path
              d="M10 21 C16 19, 20 24, 18 29 C14 31, 8 27, 10 21 Z"
              fill="#2FA896"
              stroke="#38302B"
              strokeWidth="1.5"
            />
          </g>
        </svg>
      )}
    </div>
  );
};

