import { Outlet } from 'react-router-dom';
import CompanySidebar from '../components/company/CompanySidebar';
import HeaderCompany from '../components/common/HeaderCompany';

const CompanyLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderCompany />
      </div>

      <div className="flex flex-1 pt-16">
        {/* Sidebar: Hidden on small screens, visible on md+ */}
        <div className="hidden md:block fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] z-40">
          <CompanySidebar />
        </div>

        {/* Main content area */}
        <main className="flex-1 md:ml-64 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CompanyLayout;
