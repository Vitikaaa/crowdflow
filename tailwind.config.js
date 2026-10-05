export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { ink: '#190933', coral: '#EE9E8E', peach: '#FFDBC3', cream: '#FFF5E0' },
    fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
    boxShadow: { soft: '0 8px 30px -12px rgba(25,9,51,0.18)' },
    borderRadius: { card: '24px' }
  } },
  plugins: []
}
