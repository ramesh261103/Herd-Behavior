import { useState } from "react";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import TopProducts from "./components/TopProducts";
import Pricing from "./components/Pricing";

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <TopProducts />;
      case 'pricing':
        return <Pricing />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  );
}
