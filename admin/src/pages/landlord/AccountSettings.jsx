import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';

const Row = ({ label, linkText, onClick }) => (
  <div className="flex items-start py-4 border-b border-gray-100 last:border-0">
    <span className="w-32 text-right text-sm font-semibold text-gray-700 pr-6 pt-0.5 flex-shrink-0">{label}</span>
    <button
      onClick={onClick}
      className="text-sm text-red-600 hover:underline text-left"
    >
      {linkText}
    </button>
  </div>
);

const AccountSettings = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <main className="flex-1 p-6">
        <div className="max-w-2xl bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">My Account</h3>
          </div>

          {/* Rows */}
          <div className="px-6 py-2">
            <Row label="Profile"  linkText="Update your profile"  onClick={() => {}} />
            <Row label="Password" linkText="Change your password" onClick={() => {}} />
            <Row label="Email"    linkText="Change your email"    onClick={() => {}} />
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default AccountSettings;
