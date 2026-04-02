import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { userId: 1, username: 'chef@example.com' },
    logout: jest.fn(),
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const renderLayout = (title?: string) =>
  render(
    <MemoryRouter>
      <Layout title={title}>
        <div>Content</div>
      </Layout>
    </MemoryRouter>
  );

describe('Layout', () => {
  it('renders the title', () => {
    renderLayout('My Recipes');
    expect(screen.getByText('My Recipes')).toBeInTheDocument();
  });

  it('navigates to "/" when the page title is clicked', () => {
    renderLayout('My Recipes');
    fireEvent.click(screen.getByText('My Recipes'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to "/" when the logo is clicked', () => {
    renderLayout('My Recipes');
    fireEvent.click(screen.getByAltText('Recipe Manager'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
