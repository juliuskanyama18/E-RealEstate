import { CreditCard } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

const Payments = () => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar title="Payments" />
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <CreditCard size={32} className="text-blue-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Payments</h2>
          <p className="text-sm text-gray-400 max-w-xs">
            Payment tracking and rent collection will be available here. Coming soon.
          </p>
        </div>
      </main>
    </div>
  </div>
);

export default Payments;
