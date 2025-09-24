import React from 'react';

export const ExportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 10.5v6m-3-3h6M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5M5.25 6.75C5.25 5.645 6.145 4.75 7.25 4.75h9.5c1.105 0 2 .895 2 2v10.5c0 1.105-.895 2-2 2h-9.5c-1.105 0-2-.895-2-2V6.75Z" 
    />
     <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M7.5 15h9M7.5 9h9" 
    />
     <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M9 12h6" 
    />
  </svg>
);
