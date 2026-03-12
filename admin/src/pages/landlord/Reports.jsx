import { BarChart2 } from 'lucide-react';
import Layout from '../../components/Layout';

const Reports = () => (
  <Layout>
    <main className="flex-1 p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <BarChart2 size={32} className="text-blue-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Reports</h2>
        <p className="text-sm text-gray-400 max-w-xs">
          Financial reports, occupancy analytics, and rental summaries will be available here. Coming soon.
        </p>
      </div>
    </main>
  </Layout>
);

export default Reports;
