import { createRootRoute, Outlet } from '@tanstack/react-router';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

export const Route = createRootRoute({
  component: () => (
    <>
      <SignedOut>
        <Outlet />
      </SignedOut>
      <SignedIn>
        <Outlet />
      </SignedIn>
    </>
  ),
});

