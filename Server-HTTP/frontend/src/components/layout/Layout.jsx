
import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* <Navbar /> */}
      <main className="flex-grow mx-auto px-4 py-8 pt-24 max-w-[1600px] w-full">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
};


export default Layout;
