export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#130722',
        coral: '#FF9E80',
        peach: '#FFAE96',
        cream: '#FAF7F2'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 4px 24px -6px rgba(19,7,34,0.06)'
      },
      borderRadius: {
        card: '24px'
      }
    }
  },
  plugins: []
}
