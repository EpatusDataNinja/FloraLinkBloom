import React from 'react';
import { Link } from 'react-router-dom';

const HomePageServices = ({ services }) => {
  return (
    <section className="my-12">
      <h2 className="text-3xl font-bold mb-4 text-green-700">Our Services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl">
            <span className="text-4xl">{service.icon}</span>
            <h3 className="text-xl font-semibold text-green-700 mt-4">{service.name}</h3>
            <p className="mt-2">{service.description}</p>
            <Link
              to={`/services/${service.id}`}
              className="text-green-600 hover:text-green-800 mt-4 inline-block"
            >
              Read More
            </Link>
          </div>
        ))}
      </div>

      <style jsx="true">{`
        .text-green-700 {
          color: #15803d;
        }
        .text-green-600 {
          color: #16a34a;
        }
        .hover\\:text-green-800:hover {
          color: #166534;
        }
        .shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .hover\\:shadow-xl:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
        .grid {
          display: grid;
          gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </section>
  );
};

export default HomePageServices; 