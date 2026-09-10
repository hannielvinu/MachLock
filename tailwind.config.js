/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/frontend/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Crisp Light Aerospace Telemetry palette
        'app-bg': '#F8FAFC',
        'app-card': '#FFFFFF',
        'app-sidebar': '#FFFFFF',
        'app-border': '#E2E8F0',
        'app-border-subtle': '#F1F5F9',
        
        // High-contrast, beautifully balanced Light Theme Typography
        'text-primary': '#0F172A',
        'text-secondary': '#334155',
        'text-muted': '#64748B',
        
        // Brand & Accents
        'aviation-blue': '#0284C7',
        'aviation-cyan': '#0EA5E9',
        'aviation-indigo': '#4F46E5',
        'status-success': '#15803D',
        'status-warning': '#B45309',
        'status-critical': '#B91C1C',
      },
      fontFamily: {
        // Satoshi strictly for all standard text / headings / UI
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
        // JetBrains Mono strictly for telemetry digits, code, timestamps, epochs
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
        'blue-glow': '0 0 16px rgba(2, 132, 199, 0.25)',
      }
    },
  },
  plugins: [],
}
