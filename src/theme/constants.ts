export const LIGHT_THEME = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#1B4332', 
  secondary: '#2D6A4F',
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#94A3B8'
  },
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444'
};

export const DARK_THEME = {
  background: '#0F172A', // Slate 900
  surface: '#1E293B',    // Slate 800
  card: '#1E293B',
  primary: '#52B788',    // Un verde más brillante para contraste en oscuro
  secondary: '#40916C',
  text: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    muted: '#64748B'
  },
  border: '#334155',    // Slate 700
  success: '#34D399',
  error: '#F87171'
};

// Mantenemos COLORS apuntando a LIGHT_THEME por defecto para no romper componentes existentes
// mientras migramos a usar el hook useTheme
export const COLORS = LIGHT_THEME;

export const MOCK_DATA = {
  feed: [
    { id: '1', user: 'Finca La Esperanza', time: 'hace 2h', text: 'Excelente lote de novillos Angus para subasta este sábado.', image: 'https://arreos.fregodesigns.com/api/media/community/img_pub1.jpg' },
    { id: '2', user: 'Ganadería Del Norte', time: 'hace 5h', text: 'Nueva llegada de toros Brahman de alto registro.', image: 'https://arreos.fregodesigns.com/api/media/community/img_pub2.jpg' }
  ],
  marketplace: [
    { id: '1', title: 'Novillos Angus Negros', price: '$25,000', location: 'Chihuahua, MX', weight: '450kg', fat: '7%', breed: 'Angus', image: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=400&auto=format&fit=crop' },
    { id: '2', title: 'Vaquillas Brahman', price: '$18,500', location: 'Veracruz, MX', weight: '380kg', fat: '5%', breed: 'Brahman', image: 'https://images.unsplash.com/photo-1558229854-058205f27464?q=80&w=400&auto=format&fit=crop' },
    { id: '3', title: 'Toros Hereford', price: '$42,000', location: 'Sonora, MX', weight: '850kg', fat: '8%', breed: 'Hereford', image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=400&auto=format&fit=crop' }
  ]
};
