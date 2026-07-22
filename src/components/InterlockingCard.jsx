import React from 'react';

/**
 * InterlockingCard component
 * Creates Neo Brutalism cards with interlocking puzzle tabs matching the reference design image.
 */
export default function InterlockingCard({
  children,
  bgColor = '#74C8FF',
  textColor = '#162235',
  notchTop = false,
  notchBottom = false,
  notchPosition = 'center', // 'left' | 'center' | 'right'
  className = '',
  style = {}
}) {
  const notchOffset = notchPosition === 'left' ? '20%' : notchPosition === 'right' ? '80%' : '50%';

  return (
    <div 
      className={`relative w-full overflow-visible transition-all duration-300 ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        border: '2.5px solid var(--color-border)',
        borderRadius: '32px',
        boxShadow: '4px 4px 0px var(--color-border)',
        ...style
      }}
    >
      {/* Top Interlocking Puzzle Tab Notch */}
      {notchTop && (
        <div 
          className="absolute -top-[15px] z-20"
          style={{ left: notchOffset, transform: 'translateX(-50%)' }}
        >
          <svg width="48" height="16" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M 2 16 C 2 8 8 2 16 2 L 32 2 C 40 2 46 8 46 16 Z" 
              fill={bgColor}
              stroke="var(--color-border)" 
              strokeWidth="2.5"
            />
          </svg>
        </div>
      )}

      {/* Main Content inside the Card */}
      <div className="p-5 sm:p-6 relative z-10">
        {children}
      </div>

      {/* Bottom Interlocking Puzzle Tab Notch */}
      {notchBottom && (
        <div 
          className="absolute -bottom-[15px] z-20 pointer-events-none"
          style={{ left: notchOffset, transform: 'translateX(-50%)' }}
        >
          <svg width="48" height="16" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M 2 0 C 2 8 8 14 16 14 L 32 14 C 40 14 46 8 46 0 Z" 
              fill={bgColor}
              stroke="var(--color-border)" 
              strokeWidth="2.5"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
