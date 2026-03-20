import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Calendar, 
  Users, 
  ChevronRight, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Camera,
  Search,
  MessageSquare
} from 'lucide-react';
import { AppProvider, useApp, Customer, EMI } from './context';

type Screen = 'DASHBOARD' | 'ADD_CUSTOMER' | 'CUSTOMER_DETAILS' | 'TODAY_DUE' | 'ALL_CUSTOMERS';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function Dashboard({ onNavigate }: { onNavigate: (screen: Screen, data?: any) => void }) {
  const { totalGiven, totalCollected, totalPending } = useApp();

  return (
    <div className="space-y-6 p-4">
      {/* Stats Section */}
      <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-xl border border-white/5">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Total Given</p>
            <p className="text-4xl font-bold mt-1">{formatCurrency(totalGiven)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-zinc-500 text-xs font-medium uppercase">Collected</p>
              <p className="text-xl font-semibold text-emerald-400">{formatCurrency(totalCollected)}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-medium uppercase">Pending</p>
              <p className="text-xl font-semibold text-orange-400">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-4">
        <button 
          id="add-customer-btn"
          onClick={() => onNavigate('ADD_CUSTOMER')}
          className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <Plus size={24} />
            </div>
            <span className="text-lg font-semibold text-zinc-800">Add Customer</span>
          </div>
          <ChevronRight className="text-zinc-300" />
        </button>

        <button 
          id="today-due-btn"
          onClick={() => onNavigate('TODAY_DUE')}
          className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
              <Calendar size={24} />
            </div>
            <span className="text-lg font-semibold text-zinc-800">Today Due</span>
          </div>
          <ChevronRight className="text-zinc-300" />
        </button>

        <button 
          id="all-customers-btn"
          onClick={() => onNavigate('ALL_CUSTOMERS')}
          className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <Users size={24} />
            </div>
            <span className="text-lg font-semibold text-zinc-800">All Customers</span>
          </div>
          <ChevronRight className="text-zinc-300" />
        </button>
      </div>
    </div>
  );
}

function AddCustomer({ onBack }: { onBack: () => void }) {
  const { addCustomer } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    productName: '',
    totalPrice: '',
    downPayment: '',
    months: '12',
  });

  const emiPerMonth = useMemo(() => {
    const total = parseFloat(formData.totalPrice) || 0;
    const down = parseFloat(formData.downPayment) || 0;
    const months = parseInt(formData.months) || 1;
    return Math.round((total - down) / months);
  }, [formData.totalPrice, formData.downPayment, formData.months]);

  const handleSave = () => {
    const total = parseFloat(formData.totalPrice);
    const down = parseFloat(formData.downPayment);
    const months = parseInt(formData.months);
    const emiAmount = emiPerMonth;
    
    const emis: EMI[] = Array.from({ length: months }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i + 1);
      return {
        id: Math.random().toString(36).substr(2, 9),
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        amount: emiAmount,
        isPaid: false,
        dueDate: date.toISOString(),
      };
    });

    const newCustomer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      productName: formData.productName,
      totalPrice: total,
      downPayment: down,
      months: months,
      emiAmount: emiAmount,
      remainingAmount: total - down,
      emis: emis,
      createdAt: new Date().toISOString(),
    };

    addCustomer(newCustomer);
    onBack();
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <div className="bg-white p-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-zinc-900">
          {step === 1 ? 'Customer Info' : 'Product & EMI'}
        </h1>
      </div>

      <div className="p-4 space-y-6">
        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-600">Full Name</label>
              <input 
                type="text" 
                placeholder="Enter name"
                className="w-full p-4 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-600">Phone Number</label>
              <input 
                type="tel" 
                placeholder="Enter 10 digit number"
                className="w-full p-4 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-600">Address</label>
              <textarea 
                placeholder="Enter full address"
                rows={3}
                className="w-full p-4 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-600">Aadhaar Photo (Optional)</label>
              <div className="w-full p-8 rounded-xl bg-zinc-100 border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 cursor-pointer">
                <Camera size={32} />
                <span className="text-sm mt-2">Click to take photo</span>
              </div>
            </div>
            <button 
              id="next-step-btn"
              onClick={() => setStep(2)}
              disabled={!formData.name || !formData.phone}
              className="w-full bg-zinc-900 text-white p-4 rounded-xl font-bold text-lg disabled:opacity-50 active:scale-95 transition-transform"
            >
              Next
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-600">Product Name</label>
              <input 
                type="text" 
                placeholder="e.g. Bed, Table, Sofa"
                className="w-full p-4 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                value={formData.productName}
                onChange={e => setFormData({...formData, productName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600">Total Price</label>
                <input 
                  type="number" 
                  placeholder="₹"
                  className="w-full p-4 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                  value={formData.totalPrice}
                  onChange={e => setFormData({...formData, totalPrice: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-600">Down Payment</label>
                <input 
                  type="number" 
                  placeholder="₹"
                  className="w-full p-4 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                  value={formData.downPayment}
                  onChange={e => setFormData({...formData, downPayment: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-600">Tenure (Months)</label>
              <select 
                className="w-full p-4 rounded-xl bg-white border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                value={formData.months}
                onChange={e => setFormData({...formData, months: e.target.value})}
              >
                {[3, 6, 9, 12, 18, 24].map(m => (
                  <option key={m} value={m}>{m} Months</option>
                ))}
              </select>
            </div>

            <div className="bg-zinc-900 text-white p-6 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Monthly EMI</span>
                <span className="text-2xl font-bold">{formatCurrency(emiPerMonth)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <span className="text-zinc-400">Remaining Amount</span>
                <span className="font-semibold">{formatCurrency(parseFloat(formData.totalPrice || '0') - parseFloat(formData.downPayment || '0'))}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 bg-white text-zinc-900 p-4 rounded-xl font-bold border border-zinc-200 active:scale-95 transition-transform"
              >
                Back
              </button>
              <button 
                id="save-customer-btn"
                onClick={handleSave}
                disabled={!formData.productName || !formData.totalPrice}
                className="flex-[2] bg-zinc-900 text-white p-4 rounded-xl font-bold text-lg disabled:opacity-50 active:scale-95 transition-transform"
              >
                Save Customer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerDetails({ customer, onBack }: { customer: Customer, onBack: () => void }) {
  const { markAsPaid } = useApp();

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <div className="bg-white p-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-zinc-900">Customer Details</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">{customer.name}</h2>
              <p className="text-zinc-500 flex items-center gap-1 mt-1">
                <Phone size={14} /> {customer.phone}
              </p>
            </div>
            <a 
              href={`tel:${customer.phone}`}
              className="bg-zinc-900 text-white p-3 rounded-full active:scale-90 transition-transform"
            >
              <Phone size={20} />
            </a>
          </div>
          
          <div className="pt-4 border-t border-zinc-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-medium">Product</p>
              <p className="font-semibold text-zinc-800">{customer.productName}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase font-medium">Monthly EMI</p>
              <p className="font-semibold text-zinc-800">{formatCurrency(customer.emiAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase font-medium">Remaining</p>
              <p className="font-bold text-orange-600">{formatCurrency(customer.remainingAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase font-medium">Total Price</p>
              <p className="font-semibold text-zinc-800">{formatCurrency(customer.totalPrice)}</p>
            </div>
          </div>
        </div>

        {/* EMI List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider px-1">EMI Schedule</h3>
          {customer.emis.map((emi) => (
            <div 
              key={emi.id}
              className={`bg-white p-4 rounded-2xl flex items-center justify-between border ${emi.isPaid ? 'border-emerald-100 bg-emerald-50/30' : 'border-zinc-100'}`}
            >
              <div className="flex items-center gap-3">
                {emi.isPaid ? (
                  <CheckCircle2 className="text-emerald-500" size={24} />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-zinc-200" />
                )}
                <div>
                  <p className={`font-semibold ${emi.isPaid ? 'text-emerald-700' : 'text-zinc-800'}`}>
                    {emi.month}
                  </p>
                  <p className="text-xs text-zinc-400">{formatCurrency(emi.amount)}</p>
                </div>
              </div>
              
              {!emi.isPaid && (
                <button 
                  onClick={() => markAsPaid(customer.id, emi.id)}
                  className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform"
                >
                  Mark Paid
                </button>
              )}
              {emi.isPaid && (
                <span className="text-emerald-600 text-xs font-bold uppercase">Paid</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TodayDue({ onBack, onSelectCustomer }: { onBack: () => void, onSelectCustomer: (c: Customer) => void }) {
  const { customers, markAsPaid } = useApp();
  
  const dueToday = useMemo(() => {
    const today = new Date();
    return customers.filter(c => {
      return c.emis.some(e => {
        const dueDate = new Date(e.dueDate);
        return !e.isPaid && 
               dueDate.getMonth() === today.getMonth() && 
               dueDate.getFullYear() === today.getFullYear();
      });
    }).map(c => {
      const currentEmi = c.emis.find(e => {
        const dueDate = new Date(e.dueDate);
        return !e.isPaid && 
               dueDate.getMonth() === today.getMonth() && 
               dueDate.getFullYear() === today.getFullYear();
      });
      return { ...c, currentEmi };
    });
  }, [customers]);

  const sendReminder = (customer: Customer) => {
    const message = `Hi ${customer.name}, your EMI of ${formatCurrency(customer.emiAmount)} for ${customer.productName} is due. Please pay soon.`;
    const url = `https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <div className="bg-white p-4 flex items-center gap-4 border-b sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-zinc-900">Today's Due</h1>
      </div>

      <div className="p-4 space-y-4">
        {dueToday.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <CheckCircle2 size={64} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">No dues for today!</p>
          </div>
        ) : (
          dueToday.map(c => (
            <div key={c.id} className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100 space-y-4">
              <div className="flex justify-between items-start">
                <div onClick={() => onSelectCustomer(c)} className="cursor-pointer">
                  <h3 className="text-lg font-bold text-zinc-900">{c.name}</h3>
                  <p className="text-zinc-500 text-sm">{c.productName} • {c.currentEmi?.month}</p>
                </div>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(c.emiAmount)}</p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => c.currentEmi && markAsPaid(c.id, c.currentEmi.id)}
                  className="flex-1 bg-emerald-500 text-white py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                >
                  Mark Paid
                </button>
                <button 
                  onClick={() => sendReminder(c)}
                  className="flex-1 bg-zinc-100 text-zinc-900 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <MessageSquare size={16} /> Reminder
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AllCustomers({ onBack, onSelectCustomer }: { onBack: () => void, onSelectCustomer: (c: Customer) => void }) {
  const { customers } = useApp();
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <div className="bg-white p-4 space-y-4 border-b sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-zinc-900">All Customers</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text"
            placeholder="Search name or phone..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-zinc-100 border-none outline-none focus:ring-2 focus:ring-zinc-900"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map(c => (
          <div 
            key={c.id} 
            onClick={() => onSelectCustomer(c)}
            className="bg-white p-4 rounded-2xl flex items-center justify-between border border-zinc-100 active:bg-zinc-50 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 font-bold text-lg">
                {c.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">{c.name}</h3>
                <p className="text-xs text-zinc-500">{c.productName} • {c.phone}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-zinc-900">{formatCurrency(c.emiAmount)}/mo</p>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Remaining: {formatCurrency(c.remainingAmount)}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-zinc-400">
            <p>No customers found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AppContent() {
  const [screen, setScreen] = useState<Screen>('DASHBOARD');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const navigate = (s: Screen, data?: any) => {
    if (data) setSelectedCustomer(data);
    setScreen(s);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'DASHBOARD':
        return <Dashboard onNavigate={navigate} />;
      case 'ADD_CUSTOMER':
        return <AddCustomer onBack={() => setScreen('DASHBOARD')} />;
      case 'CUSTOMER_DETAILS':
        return selectedCustomer ? (
          <CustomerDetails 
            customer={selectedCustomer} 
            onBack={() => setScreen('ALL_CUSTOMERS')} 
          />
        ) : null;
      case 'TODAY_DUE':
        return (
          <TodayDue 
            onBack={() => setScreen('DASHBOARD')} 
            onSelectCustomer={(c) => navigate('CUSTOMER_DETAILS', c)}
          />
        );
      case 'ALL_CUSTOMERS':
        return (
          <AllCustomers 
            onBack={() => setScreen('DASHBOARD')} 
            onSelectCustomer={(c) => navigate('CUSTOMER_DETAILS', c)}
          />
        );
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-zinc-50 min-h-screen font-sans selection:bg-zinc-900 selection:text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen + (selectedCustomer?.id || '')}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}