import React from 'react';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { AppRouter } from '@/app/router/AppRouter';

export const App: React.FC = () => {
  return (
    <QueryProvider>
      <AppRouter />
    </QueryProvider>
  );
};

export default App;
