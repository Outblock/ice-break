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
}

const PixelDropdown = ({ options, selectedValues, onChange, disabled }: PixelDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
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
    if (selectedValues.includes('ALL')) return 'ALL CATEGORIES';
    if (selectedValues.length === 0) return 'SELECT CATEGORY';
    if (selectedValues.length === 1) {
      const opt = options.find(o => o.value === selectedValues[0]);
      return opt ? `${opt.emoji} ${opt.label}` : selectedValues[0];
    }
    return `${selectedValues.length} SELECTED`;
  };

  return (
    <div className="pixel-dropdown-container" ref={dropdownRef} style={{ position: 'relative', width: '220px', margin: '0 auto 20px auto', fontFamily: 'var(--font-press-start-2p)' }}>
      {/* Dropdown Toggle Button */}
      <div
        onClick={toggleDropdown}
        style={{
          backgroundColor: '#fff',
          border: '4px solid #333',
          padding: '12px 16px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: isOpen ? 'inset 4px 4px 0px #ccc' : '4px 4px 0px #000',
          transform: isOpen ? 'translate(4px, 4px)' : 'none',
          transition: 'all 0.1s',
          color: '#333',
          fontSize: '0.8rem',
          userSelect: 'none',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getDisplayText()}
        </span>
        <span style={{ marginLeft: '10px' }}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            backgroundColor: '#fff',
            border: '4px solid #333',
            boxShadow: '8px 8px 0px rgba(0,0,0,0.5)',
            zIndex: 100,
            maxHeight: '300px',
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
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: isSelected ? 'var(--neon-green, #0f0)' : '#fff',
                  color: '#333',
                  borderBottom: '2px dashed #eee',
                  fontSize: '0.7rem',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#fff';
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #333',
                    marginRight: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected ? '#333' : '#fff',
                    flexShrink: 0,
                  }}
                >
                  {isSelected && <div style={{ width: '8px', height: '8px', backgroundColor: '#fff' }}></div>}
                </div>
                <span style={{ marginRight: '8px', fontSize: '1rem' }}>{option.emoji}</span>
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
