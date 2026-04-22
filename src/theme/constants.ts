export const COLORS = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  primary: '#1B4332', // Forest Green (Acento)
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    muted: '#94A3B8'
  },
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444'
};

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
