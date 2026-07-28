import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient , QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom';
import { initAuth } from './features/authentication/lib/initAuth';
import { router } from './router'
import './index.css'

const queryClient = new QueryClient();

async function bootstrap()
{
  await initAuth();
  createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router = {router} />
    </QueryClientProvider>
  </StrictMode>,
  );
}

void bootstrap();