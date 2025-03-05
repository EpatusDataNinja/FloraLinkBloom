import React from 'react';

const HomePageHero = () => {
  return (
    <section className="text-center text-white hero-section mb-4">
      <div className="hero-content">
        <h1 className="hero-title">
          Bloom with{' '}
          <span className="nature-beauty">Nature's Beauty</span>
        </h1>
        <p className="hero-description">
          Connecting buyers with growers and florists for fresh and vibrant flowers.
        </p>
      </div>

      <style jsx="true">{`
        .hero-section {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(21, 128, 61, 0.9) 100%);
          padding: 4rem 2rem;
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="80">🌸</text></svg>') center/50px repeat;
          opacity: 0.1;
          animation: floatingFlowers 60s linear infinite;
        }

        @keyframes floatingFlowers {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-50%) rotate(360deg);
          }
        }

        .hero-content {
          position: relative;
          z-index: 1;
          background: radial-gradient(circle at center, transparent, rgba(0, 0, 0, 0.2));
          padding: 2rem;
          border-radius: 8px;
        }

        .hero-title {
          font-size: 3rem;
          line-height: 1.2;
          font-weight: 800;
          margin-bottom: 1.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .nature-beauty {
          display: inline-block;
          background: linear-gradient(120deg, #dcfce7, #86efac);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          position: relative;
          padding: 0 0.5rem;
          font-weight: 900;
          text-shadow: 
            3px 3px 0 #166534,
            -1px -1px 0 #166534,
            1px -1px 0 #166534,
            -1px 1px 0 #166534,
            1px 1px 0 #166534;
          animation: glowing 2s ease-in-out infinite;
        }

        .nature-beauty::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -4px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #dcfce7, transparent);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .hero-title:hover .nature-beauty::after {
          transform: scaleX(1);
        }

        @keyframes glowing {
          0%, 100% {
            filter: brightness(100%) drop-shadow(0 0 10px rgba(220, 252, 231, 0.3));
          }
          50% {
            filter: brightness(120%) drop-shadow(0 0 15px rgba(220, 252, 231, 0.5));
          }
        }

        .hero-description {
          font-size: 1.25rem;
          max-width: 600px;
          margin: 0 auto;
          opacity: 0.9;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
          font-weight: 500;
        }

        @media (min-width: 768px) {
          .hero-title {
            font-size: 3.5rem;
          }
          .hero-description {
            font-size: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .hero-section {
            padding: 6rem 2rem;
          }
          .hero-title {
            font-size: 4rem;
          }
        }
      `}</style>
    </section>
  );
};

export default HomePageHero; 