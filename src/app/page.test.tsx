import { render, screen } from '@testing-library/react';
import Home from './page';
import { expect, test, vi } from 'vitest';

// Mock Link since it's a Next.js component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

test('Home page renders the title and tool cards', () => {
  render(<Home />);
  
  // Check for the main title
  expect(screen.getByText('KaldiFlow')).toBeInTheDocument();
  
  // Check for tool cards
  expect(screen.getByText('Kaldi-Edit')).toBeInTheDocument();
  expect(screen.getByText('Kaldi-Kapture')).toBeInTheDocument();
  expect(screen.getByText('Kaldi-Ops')).toBeInTheDocument();
  
  // Check for the Download for Mac button
  expect(screen.getByText('Download Desktop')).toBeInTheDocument();
});
