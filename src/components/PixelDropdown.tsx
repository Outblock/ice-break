'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  emoji: string;
}

interface PixelDropdownProps {
  options: Option[];
  selectedValues: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const PixelDropdown = ({ options, selectedValues, onChange, disabled, className, style }: PixelDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const getDisplayText = () => {
    if (selectedValues.includes('ALL')) return 'ALL';
    if (selectedValues.length === 0) return 'SELECT';
    if (selectedValues.length === 1) {
      const opt = options.find(o => o.value === selectedValues[0]);
      return opt ? `${opt.emoji} ${opt.label}` : selectedValues[0];
    }
    return `${selectedValues.length} SEL`;
  };

  return (
    <div
      className={`pixel-dropdown-container ${className || ''}`}
      ref={dropdownRef}
      style={{
        position: 'relative',
        width: '150px', // Default reduced width
        fontFamily: 'var(--font-press-start-2p)',
        ...style
      }}
    >
      {/* Dropdown Toggle Button */}
      <div
        onClick={toggleDropdown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: isHovered && !disabled ? '#333' : '#222', // Dark background with hover
          border: '4px solid #000',
          padding: '8px 12px', // Reduced padding
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: isOpen ? 'inset 3px 3px 0px #000' : '4px 4px 0px #000',
          transform: isOpen ? 'translate(3px, 3px)' : 'none',
          transition: 'all 0.1s',
          color: '#fff', // Light text
          fontSize: '0.6rem', // Smaller font
          userSelect: 'none',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getDisplayText()}
        </span>
        <span style={{ marginLeft: '8px', fontSize: '0.5rem' }}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0, // Align to right
            minWidth: '100%',
            marginTop: '4px',
            backgroundColor: '#222', // Dark background
            border: '4px solid #000',
            boxShadow: '6px 6px 0px rgba(0,0,0,0.8)',
            zIndex: 100,
            maxHeight: '200px', // Reduced height
            overflowY: 'auto',
          }}
        >
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={() => onChange(option.value)}
                style={{
                  padding: '8px 12px', // Reduced padding
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: isSelected ? 'var(--neon-green, #0f0)' : '#222',
                  color: isSelected ? '#000' : '#fff', // Dynamic text color
                  borderBottom: '1px dashed #444',
                  fontSize: '0.6rem', // Smaller font
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#333';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#222';
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid #000', // Darker border
                    marginRight: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected ? '#000' : '#444',
                    flexShrink: 0,
                  }}
                >
                  {isSelected && <div style={{ width: '6px', height: '6px', backgroundColor: '#fff' }}></div>}
                </div>
                <span style={{ marginRight: '8px', fontSize: '0.8rem' }}>{option.emoji}</span>
                <span>{option.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PixelDropdown;
