import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function MainPage() {
  const linkRef = useRef(null);

  const preloadContent = async () => {
    try {
      const response = await fetch('/DreamsDonutsPage');
      const text = await response.text();
      await caches.open('dreams-donuts-cache').then(cache => 
        cache.put('/DreamsDonutsPage', new Response(text))
      );
      console.log('DreamsDonutsPage preloaded');
    } catch (error) {
      console.error('Error preloading content:', error);
    }
  };

  useEffect(() => {
    const link = linkRef.current;
    if (link) {
      link.addEventListener('mouseover', preloadContent);
      link.addEventListener('touchstart', preloadContent);
    }
    return () => {
      if (link) {
        link.removeEventListener('mouseover', preloadContent);
        link.removeEventListener('touchstart', preloadContent);
      }
    };
  }, []);

  return (
    <div>
      <h1>Main Page</h1>
      <Link to="/DreamsDonutsPage" ref={linkRef}>Dreams Donuts</Link>
    </div>
  );
}

export default MainPage;