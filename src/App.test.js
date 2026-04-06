import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app loading screen', () => {
  render(<App />);
  const loadingTitle = screen.getByText(/Cargando SmartMaint/i);
  expect(loadingTitle).toBeInTheDocument();
});
