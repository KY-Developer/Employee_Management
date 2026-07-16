// import React, { useEffect, useState, useMemo } from 'react';
// import {
//   getInvestments,
//   addInvestment,
//   updateInvestment,
//   deleteInvestment,
// } from '../../services/companyService';
// import { format, parseISO, getYear } from 'date-fns';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import {
//   ResponsiveContainer,
//   ComposedChart,
//   Bar,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   CartesianGrid,
// } from 'recharts';
// import clsx from 'clsx';

// const DEFAULT_TYPES = ['Equity', 'Debt', 'RealEstate', 'Other'];

// const emptyForm = {
//   date: '',
//   investmentType: '',
//   amount: '',
// };

// const normalizeDate = (d) => {
//   const dt = typeof d === 'string' ? parseISO(d) : new Date(d);
//   return dt;
// };

// const formatMonthKey = (date) => {
//   const dt = normalizeDate(date);
//   return format(dt, 'yyyy-MM'); // e.g., 2025-08
// };

// const prettyPeriod = (key) => {
//   if (key.includes('-')) {
//     const [y, m] = key.split('-');
//     const dt = new Date(Number(y), Number(m) - 1);
//     return format(dt, 'MMM yyyy');
//   }
//   return key;
// };

// const Investment = () => {
//   const [form, setForm] = useState(emptyForm);
//   const [editingId, setEditingId] = useState(null);
//   const [investments, setInvestments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [filterTimeframe, setFilterTimeframe] = useState('all');
//   const [filterMonth, setFilterMonth] = useState('');
//   const [filterYear, setFilterYear] = useState('');
//   const [searchType, setSearchType] = useState('');
//   const [customTypes, setCustomTypes] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem('customInvTypes') || '[]');
//     } catch {
//       return [];
//     }
//   });
//   const [refreshToggle, setRefreshToggle] = useState(false);

//   const allTypes = useMemo(() => {
//     const merged = [...DEFAULT_TYPES, ...customTypes];
//     return Array.from(new Set(merged.map((t) => t.trim()).filter(Boolean)));
//   }, [customTypes]);

//   const fetchInvestments = async () => {
//     try {
//       setLoading(true);
//       const data = await getInvestments();
//       setInvestments(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('fetchInvestments error', err);
//       toast.error(err?.response?.data?.message || 'Failed to load investments');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchInvestments();
//   }, [refreshToggle]);

//   useEffect(() => {
//     localStorage.setItem('customInvTypes', JSON.stringify(customTypes));
//   }, [customTypes]);

//   const resetForm = () => {
//     setForm(emptyForm);
//     setEditingId(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.date || !form.investmentType || form.amount === '') {
//       toast.warn('All fields are required');
//       return;
//     }
//     if (isNaN(Number(form.amount)) || Number(form.amount) < 0) {
//       toast.warn('Amount must be a non-negative number');
//       return;
//     }

//     try {
//       if (editingId) {
//         await updateInvestment(editingId, {
//           date: form.date,
//           investmentType: form.investmentType,
//           amount: Number(form.amount),
//         });
//         toast.success('Investment updated');
//       } else {
//         await addInvestment({
//           date: form.date,
//           investmentType: form.investmentType,
//           amount: Number(form.amount),
//         });
//         toast.success('Investment added');
//       }
//       resetForm();
//       setRefreshToggle((v) => !v);
//     } catch (err) {
//       console.error('submit error', err);
//       toast.error(err?.response?.data?.message || 'Operation failed');
//     }
//   };

//   const startEdit = (inv) => {
//     setEditingId(inv._id);
//     setForm({
//       date: format(new Date(inv.date), 'yyyy-MM-dd'),
//       investmentType: inv.investmentType,
//       amount: inv.amount,
//     });
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleDelete = async (invId) => {
//     if (!window.confirm('Are you sure you want to delete this investment?')) return;
//     try {
//       await deleteInvestment(invId);
//       toast.success('Deleted');
//       setRefreshToggle((v) => !v);
//     } catch (err) {
//       console.error('delete error', err);
//       toast.error(err?.response?.data?.message || 'Delete failed');
//     }
//   };

//   // Filtering
//   const filteredByType = useMemo(() => {
//     if (!searchType) return investments;
//     return investments.filter((i) => i.investmentType === searchType);
//   }, [investments, searchType]);

//   const filteredByTime = useMemo(() => {
//     let data = [...filteredByType];
//     if (filterTimeframe === 'monthly' && filterMonth) {
//       data = data.filter((inv) => prettyPeriod(formatMonthKey(inv.date)) === filterMonth);
//     }
//     if (filterTimeframe === 'yearly' && filterYear) {
//       data = data.filter(
//         (inv) => getYear(normalizeDate(inv.date)).toString() === filterYear
//       );
//     }
//     return data.sort((a, b) => new Date(b.date) - new Date(a.date));
//   }, [filteredByType, filterTimeframe, filterMonth, filterYear]);

//   // Aggregations
//   const monthlyAggregation = useMemo(() => {
//     const map = {};
//     investments.forEach((inv) => {
//       const key = formatMonthKey(inv.date);
//       if (!map[key]) map[key] = 0;
//       map[key] += Number(inv.amount);
//     });
//     return Object.entries(map)
//       .sort(([a], [b]) => (a > b ? 1 : -1))
//       .map(([key, total]) => ({
//         period: prettyPeriod(key),
//         total: parseFloat(total.toFixed(2)),
//         raw: key,
//       }));
//   }, [investments]);

//   const yearlyAggregation = useMemo(() => {
//     const map = {};
//     investments.forEach((inv) => {
//       const yr = getYear(normalizeDate(inv.date));
//       if (!map[yr]) map[yr] = 0;
//       map[yr] += Number(inv.amount);
//     });
//     return Object.entries(map)
//       .sort(([a], [b]) => Number(a) - Number(b))
//       .map(([year, total]) => ({
//         period: year,
//         total: parseFloat(total.toFixed(2)),
//         raw: year,
//       }));
//   }, [investments]);

//   const chartData = useMemo(() => {
//     let base = [];
//     if (filterTimeframe === 'yearly') {
//       base = yearlyAggregation;
//     } else {
//       base = monthlyAggregation;
//       if (filterTimeframe === 'monthly' && filterMonth) {
//         base = monthlyAggregation.filter((d) => d.period === filterMonth);
//       }
//     }

//     if (searchType) {
//       const map = {};
//       filteredByTime.forEach((inv) => {
//         const key =
//           filterTimeframe === 'yearly'
//             ? getYear(normalizeDate(inv.date)).toString()
//             : prettyPeriod(formatMonthKey(inv.date));
//         if (!map[key]) map[key] = 0;
//         map[key] += Number(inv.amount);
//       });
//       base = Object.entries(map)
//         .sort(([a], [b]) => {
//           if (filterTimeframe === 'yearly') return Number(a) - Number(b);
//           return new Date(a) - new Date(b);
//         })
//         .map(([period, total]) => ({
//           period,
//           total: parseFloat(total.toFixed(2)),
//           raw: period,
//         }));
//     }

//     return base;
//   }, [
//     monthlyAggregation,
//     yearlyAggregation,
//     filterTimeframe,
//     filterMonth,
//     searchType,
//     filteredByTime,
//   ]);

//   const totalInvestment = useMemo(
//     () => filteredByTime.reduce((sum, i) => sum + Number(i.amount), 0),
//     [filteredByTime]
//   );

//   const availableMonths = useMemo(
//     () => Array.from(new Set(monthlyAggregation.map((d) => d.period))),
//     [monthlyAggregation]
//   );
//   const availableYears = useMemo(
//     () => Array.from(new Set(yearlyAggregation.map((d) => d.period))),
//     [yearlyAggregation]
//   );

//   return (
//     <div className="max-w-7xl mx-auto p-0 md:p-4 overflow-x-hidden">
//       <ToastContainer position="top-right" />

// {/* Top entry + filters */}
// <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
//   <div className="flex flex-col gap-6">
//     {/* Entry row */}
//     <div className="flex flex-wrap gap-4 items-end">
//       {/* Date */}
//       <div className="flex flex-col flex-1 min-w-[140px] max-w-[220px]">
//         <label className="text-sm font-medium mb-1">Date</label>
//         <input
//           type="date"
//           className="border rounded px-3 py-2 w-full focus:outline-none focus:ring"
//           value={form.date}
//           onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
//           required
//         />
//       </div>

//       {/* Investment Type + Add Type */}
//       <div className="flex flex-col flex-1 min-w-[200px] max-w-[320px]">
//         <label className="text-sm font-medium mb-1">Investment Type</label>
//         <div className="flex flex-col sm:flex-row gap-2">
//           <div className="flex flex-1 min-w-[120px]">
//             <input
//               list="types"
//               className="border rounded px-3 py-2 w-full"
//               value={form.investmentType}
//               placeholder="Type or select"
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, investmentType: e.target.value }))
//               }
//               required
//             />
//             <datalist id="types">
//               {allTypes.map((t) => (
//                 <option key={t} value={t} />
//               ))}
//             </datalist>
//           </div>
//           <button
//             type="button"
//             onClick={() => {
//               const val = form.investmentType.trim();
//               if (val && !allTypes.includes(val)) {
//                 setCustomTypes((prev) => [...prev, val]);
//                 toast.success(`Added new type \"${val}\"`);
//               }
//             }}
//             className="px-4 py-2 bg-indigo-600 text-white rounded whitespace-nowrap flex-shrink-0"
//           >
//             Add Type
//           </button>
//         </div>
//       </div>

//       {/* Amount */}
//       <div className="flex flex-col flex-1 min-w-[140px] max-w-[200px]">
//         <label className="text-sm font-medium mb-1">Amount</label>
//         <input
//           type="number"
//           min="0"
//           step="any"
//           className="border rounded px-3 py-2 w-full focus:outline-none focus:ring"
//           value={form.amount}
//           onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
//           required
//         />
//       </div>

//       {/* Actions */}
//       <div className="flex gap-2 flex-shrink-0">
//         <button
//           onClick={handleSubmit}
//           className={clsx(
//             'px-6 py-3 rounded-lg font-medium transition whitespace-nowrap',
//             editingId ? 'bg-yellow-500 text-white' : 'bg-green-600 text-white'
//           )}
//         >
//           {editingId ? 'Update' : 'Add'}
//         </button>
//         {editingId && (
//           <button
//             onClick={resetForm}
//             className="px-6 py-3 rounded-2xl border border-gray-300 text-gray-700 whitespace-nowrap"
//           >
//             Cancel
//           </button>
//         )}
//       </div>
//     </div>

//     {/* Filter row */}
//     <div className="flex flex-wrap gap-6 items-end">
//       <div className="flex flex-col min-w-[140px]">
//         <label className="text-xs font-medium mb-1">Filter Month</label>
//         <select
//           className="border rounded px-3 py-2"
//           value={filterMonth}
//           onChange={(e) => {
//             setFilterTimeframe('monthly');
//             setFilterMonth(e.target.value);
//             setFilterYear('');
//           }}
//         >
//           <option value="">All months</option>
//           {availableMonths.map((m) => (
//             <option key={m} value={m}>
//               {m}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="flex flex-col min-w-[120px]">
//         <label className="text-xs font-medium mb-1">Filter Year</label>
//         <select
//           className="border rounded px-3 py-2"
//           value={filterYear}
//           onChange={(e) => {
//             setFilterTimeframe('yearly');
//             setFilterYear(e.target.value);
//             setFilterMonth('');
//           }}
//         >
//           <option value="">All years</option>
//           {availableYears.map((y) => (
//             <option key={y} value={y}>
//               {y}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="flex flex-col min-w-[160px]">
//         <label className="text-xs font-medium mb-1">Filter Type</label>
//         <select
//           className="border rounded px-3 py-2"
//           value={searchType}
//           onChange={(e) => setSearchType(e.target.value)}
//         >
//           <option value="">All Types</option>
//           {allTypes.map((t) => (
//             <option key={t} value={t}>
//               {t}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="flex items-center">
//         <button
//           onClick={() => {
//             setFilterTimeframe('all');
//             setFilterMonth('');
//             setFilterYear('');
//             setSearchType('');
//           }}
//           className="text-sm underline"
//         >
//           Clear
//         </button>
//       </div>
//     </div>




    
//   </div>
// </div>


//       {/* Summary */}
//       <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
//           <div className="bg-indigo-50 rounded-xl p-4 flex flex-col">
//             <span className="text-xs uppercase font-medium text-indigo-600">
//               Total Investment
//             </span>
//             <span className="text-2xl font-semibold mt-1">
//               ₹ {totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//             </span>
//           </div>
//           <div className="bg-green-50 rounded-xl p-4 flex flex-col">
//             <span className="text-xs uppercase font-medium text-green-600">
//               Distinct Types
//             </span>
//             <span className="text-2xl font-semibold mt-1">
//               {new Set(filteredByTime.map((i) => i.investmentType)).size}
//             </span>
//           </div>
//           <div className="bg-yellow-50 rounded-xl p-4 flex flex-col">
//             <span className="text-xs uppercase font-medium text-yellow-700">
//               Entries
//             </span>
//             <span className="text-2xl font-semibold mt-1">
//               {filteredByTime.length}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Chart */}
//       <div className="bg-white shadow rounded-2xl p-4 mb-6">
//         <h3 className="text-lg font-semibold mb-2">
//           Investment Trend{' '}
//           {filterTimeframe === 'yearly'
//             ? '(Yearly)'
//             : filterTimeframe === 'monthly' && filterMonth
//             ? `( ${filterMonth} )`
//             : '(Monthly)'}
//         </h3>
//         {chartData.length === 0 ? (
//           <div className="py-16 text-center text-gray-500">No data to display</div>
//         ) : (
//           <div style={{ width: '100%', height: 360 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <ComposedChart
//                 data={chartData}
//                 margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   dataKey="period"
//                   tick={{ fontSize: 12 }}
//                   interval={0}
//                   angle={-30}
//                   textAnchor="end"
//                   height={60}
//                 />
//                 <YAxis
//                   tickFormatter={(val) => {
//                     if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
//                     if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
//                     return val;
//                   }}
//                 />
//                 <Tooltip
//                   formatter={(value) => `₹ ${Number(value).toLocaleString()}`}
//                   labelFormatter={(label) => label}
//                 />
//                 <Legend verticalAlign="top" />
//                 <Bar
//                   dataKey="total"
//                   name="Total"
//                   barSize={30}
//                   radius={[6, 6, 0, 0]}
//                   fill="#6366f1"
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="total"
//                   name="Trend"
//                   stroke="#10b981"
//                   strokeWidth={2}
//                   dot={{ r: 4 }}
//                 />
//               </ComposedChart>
//             </ResponsiveContainer>
//           </div>
//         )}
//       </div>

//       {/* Table */}
//       <div className="bg-white shadow rounded-2xl overflow-x-auto">
//         <div className="p-4 flex flex-col md:flex-row md:justify-between items-start md:items-center">
//           <h3 className="text-xl font-semibold mb-2 md:mb-0">
//             All Investments ({filteredByTime.length})
//           </h3>
//           <div className="text-sm text-gray-500">
//             Last updated: {format(new Date(), 'PPP p')}
//           </div>
//         </div>
//         <div className="min-w-full overflow-auto">
//           <table className="w-full table-auto border-collapse">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-4 py-2 text-left text-xs font-medium">Date</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium">Type</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium">Amount</th>
//                 <th className="px-4 py-2 text-left text-xs font-medium">Year</th>
//                 <th className="px-4 py-2 text-center text-xs font-medium">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="5" className="p-4 text-center">
//                     Loading...
//                   </td>
//                 </tr>
//               ) : filteredByTime.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="p-4 text-center text-gray-500">
//                     No investments yet.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredByTime.map((inv) => (
//                   <tr key={inv._id} className="border-b hover:bg-gray-50 transition">
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       {format(new Date(inv.date), 'dd MMM yyyy')}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">{inv.investmentType}</td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       ₹ {Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       {getYear(new Date(inv.date))}
//                     </td>
//                     <td className="px-4 py-3 text-center flex gap-2 justify-center flex-wrap">
//                       <button
//                         onClick={() => startEdit(inv)}
//                         className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:opacity-90"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(inv._id)}
//                         className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:opacity-90"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Investment;




import React, { useEffect, useState, useMemo } from 'react';
import {
  getInvestments,
  addInvestment,
  updateInvestment,
  deleteInvestment,
} from '../../services/companyService';
import { format, parseISO, getYear } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import clsx from 'clsx';
import { FiPlus, FiChevronDown, FiDollarSign, FiCalendar, FiType, FiFilter } from 'react-icons/fi';

const DEFAULT_TYPES = ['Equity', 'Debt', 'RealEstate', 'Other'];

const emptyForm = {
  date: '',
  investmentType: '',
  amount: '',
};

const normalizeDate = (d) => {
  const dt = typeof d === 'string' ? parseISO(d) : new Date(d);
  return dt;
};

const formatMonthKey = (date) => {
  const dt = normalizeDate(date);
  return format(dt, 'MM'); // Just the month number now
};

const prettyPeriod = (key) => {
  if (key.includes('-')) {
    const [y, m] = key.split('-');
    const dt = new Date(Number(y), Number(m) - 1);
    return format(dt, 'MMM');
  }
  return format(new Date(2000, Number(key) - 1), 'MMM'); // Use a dummy year
};

const Investment = () => {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterTimeframe, setFilterTimeframe] = useState('all');
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [filterYear, setFilterYear] = useState('');
  const [searchType, setSearchType] = useState('');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [customTypes, setCustomTypes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('customInvTypes') || '[]');
    } catch {
      return [];
    }
  });
  const [refreshToggle, setRefreshToggle] = useState(false);

  const allTypes = useMemo(() => {
    const merged = [...DEFAULT_TYPES, ...customTypes];
    return Array.from(new Set(merged.map((t) => t.trim()).filter(Boolean)));
  }, [customTypes]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const data = await getInvestments();
      setInvestments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchInvestments error', err);
      toast.error(err?.response?.data?.message || 'Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [refreshToggle]);

  useEffect(() => {
    localStorage.setItem('customInvTypes', JSON.stringify(customTypes));
  }, [customTypes]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.investmentType || form.amount === '') {
      toast.warn('All fields are required');
      return;
    }
    if (isNaN(Number(form.amount)) || Number(form.amount) < 0) {
      toast.warn('Amount must be a non-negative number');
      return;
    }

    try {
      if (editingId) {
        await updateInvestment(editingId, {
          date: form.date,
          investmentType: form.investmentType,
          amount: Number(form.amount),
        });
        toast.success('Investment updated');
      } else {
        await addInvestment({
          date: form.date,
          investmentType: form.investmentType,
          amount: Number(form.amount),
        });
        toast.success('Investment added');
      }
      resetForm();
      setRefreshToggle((v) => !v);
    } catch (err) {
      console.error('submit error', err);
      toast.error(err?.response?.data?.message || 'Operation failed');
    }
  };

  const startEdit = (inv) => {
    setEditingId(inv._id);
    setForm({
      date: format(new Date(inv.date), 'yyyy-MM-dd'),
      investmentType: inv.investmentType,
      amount: inv.amount,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (invId) => {
    if (!window.confirm('Are you sure you want to delete this investment?')) return;
    try {
      await deleteInvestment(invId);
      toast.success('Deleted');
      setRefreshToggle((v) => !v);
    } catch (err) {
      console.error('delete error', err);
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  // Filtering
  const filteredByType = useMemo(() => {
    if (!searchType) return investments;
    return investments.filter((i) => i.investmentType === searchType);
  }, [investments, searchType]);

  const filteredByTime = useMemo(() => {
    let data = [...filteredByType];
    
    if (filterTimeframe === 'monthly' && selectedMonths.length > 0) {
      data = data.filter((inv) => {
        const month = format(normalizeDate(inv.date), 'MM'); // Get month number
        return selectedMonths.includes(month);
      });
    }
    
    if (filterTimeframe === 'yearly' && filterYear) {
      data = data.filter(
        (inv) => getYear(normalizeDate(inv.date)).toString() === filterYear
      );
    }
    
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredByType, filterTimeframe, selectedMonths, filterYear]);

  // Aggregations
  const monthlyAggregation = useMemo(() => {
    const map = {};
    investments.forEach((inv) => {
      const key = format(normalizeDate(inv.date), 'MM'); // Just month number
      if (!map[key]) map[key] = 0;
      map[key] += Number(inv.amount);
    });
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([key, total]) => ({
        period: prettyPeriod(key),
        total: parseFloat(total.toFixed(2)),
        raw: key,
      }));
  }, [investments]);

  const yearlyAggregation = useMemo(() => {
    const map = {};
    investments.forEach((inv) => {
      const yr = getYear(normalizeDate(inv.date));
      if (!map[yr]) map[yr] = 0;
      map[yr] += Number(inv.amount);
    });
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, total]) => ({
        period: year,
        total: parseFloat(total.toFixed(2)),
        raw: year,
      }));
  }, [investments]);

  const chartData = useMemo(() => {
    let base = [];
    if (filterTimeframe === 'yearly') {
      base = yearlyAggregation;
    } else {
      base = monthlyAggregation;
      if (filterTimeframe === 'monthly' && selectedMonths.length > 0) {
        base = monthlyAggregation.filter((d) => selectedMonths.includes(d.raw));
      }
    }

    if (searchType) {
      const map = {};
      filteredByTime.forEach((inv) => {
        const key =
          filterTimeframe === 'yearly'
            ? getYear(normalizeDate(inv.date)).toString()
            : format(normalizeDate(inv.date), 'MM');
        if (!map[key]) map[key] = 0;
        map[key] += Number(inv.amount);
      });
      base = Object.entries(map)
        .sort(([a], [b]) => {
          if (filterTimeframe === 'yearly') return Number(a) - Number(b);
          return Number(a) - Number(b); // Sort months numerically
        })
        .map(([period, total]) => ({
          period: filterTimeframe === 'yearly' ? period : prettyPeriod(period),
          total: parseFloat(total.toFixed(2)),
          raw: period,
        }));
    }

    return base;
  }, [
    monthlyAggregation,
    yearlyAggregation,
    filterTimeframe,
    selectedMonths,
    searchType,
    filteredByTime,
  ]);

  const totalInvestment = useMemo(
    () => filteredByTime.reduce((sum, i) => sum + Number(i.amount), 0),
    [filteredByTime]
  );

  // All 12 months
  const allMonths = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = (i + 1).toString().padStart(2, '0');
      return {
        value: monthNum,
        label: prettyPeriod(monthNum)
      };
    });
  }, []);

  const availableYears = useMemo(
    () => Array.from(new Set(yearlyAggregation.map((d) => d.period))),
    [yearlyAggregation]
  );

  const toggleMonthSelection = (month) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month) 
        : [...prev, month]
    );
    setFilterTimeframe('monthly');
  };

  const handleYearChange = (year) => {
    setFilterYear(year);
    if (year) {
      setFilterTimeframe('yearly');
    } else {
      setFilterTimeframe('all');
    }
  };

  const clearFilters = () => {
    setFilterTimeframe('all');
    setSelectedMonths([]);
    setFilterYear('');
    setSearchType('');
  };

  return (
    <div className="max-w-7xl mx-auto p-0 md:p-4 overflow-x-hidden">
      <ToastContainer position="top-right" />

      {/* Top entry + filters */}
      <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-6">
        {/* <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Add Investment</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
          >
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            <svg
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div> */}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
    Add Investment
  </h2>
  <button
    onClick={() => setShowFilters(!showFilters)}
    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
  >
    <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
    <svg
      className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>
</div>

        
      <div className="space-y-6">
  {/* Entry row */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
    {/* Date */}
    <div className="flex flex-col space-y-1.5">
      <label className="text-sm font-medium text-gray-700">Date</label>
      <input
        type="date"
        className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        value={form.date}
        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        required
      />
    </div>

    {/* Investment Type + Add Type */}
    <div className="flex flex-col sm:col-span-2 space-y-1.5">
      <label className="text-sm font-medium text-gray-700">Investment Type</label>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 relative">
          <input
            list="types"
            className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            value={form.investmentType}
            placeholder="Type or select"
            onChange={(e) =>
              setForm((f) => ({ ...f, investmentType: e.target.value }))
            }
            required
          />
          <datalist id="types">
            {allTypes.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
        <button
          type="button"
          onClick={() => {
            const val = form.investmentType.trim();
            if (val && !allTypes.includes(val)) {
              setCustomTypes((prev) => [...prev, val]);
              toast.success(`Added new type \"${val}\"`);
            }
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg whitespace-nowrap flex-shrink-0 transition shadow-sm"
        >
          Add Type
        </button>
      </div>
    </div>

    {/* Amount */}
    <div className="flex flex-col space-y-1.5">
      <label className="text-sm font-medium text-gray-700">Amount</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
        <input
          type="number"
          min="0"
          step="any"
          className="border border-gray-300 rounded-lg pl-8 px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          required
        />
      </div>
    </div>
  </div>

  {/* Actions */}
  <div className="flex gap-3 flex-wrap">
    <button
      onClick={handleSubmit}
      className={clsx(
        'px-5 py-2.5 rounded-lg font-medium transition whitespace-nowrap shadow-sm hover:shadow-md',
        editingId 
          ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
          : 'bg-green-600 hover:bg-green-700 text-white'
      )}
    >
      {editingId ? 'Update Investment' : 'Add Investment'}
    </button>
    {editingId && (
      <button
        onClick={resetForm}
        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap transition"
      >
        Cancel
      </button>
    )}
  </div>

  {/* Filter row - Collapsible */}
  {showFilters && (
    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Filters</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
        {/* Month Filter */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Months</label>
          <div className="relative">
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 w-full text-left flex justify-between items-center bg-white hover:bg-gray-50 transition"
            >
              <span className="truncate">
                {selectedMonths.length === 0
                  ? 'All months'
                  : selectedMonths.length === 1
                  ? prettyPeriod(selectedMonths[0])
                  : `${selectedMonths.length} months selected`}
              </span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform text-gray-500 ${
                  showMonthDropdown ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showMonthDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                <div className="p-2 grid grid-cols-2 gap-2">
                  {allMonths.map((month) => (
                    <div key={month.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`month-${month.value}`}
                        checked={selectedMonths.includes(month.value)}
                        onChange={() => toggleMonthSelection(month.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`month-${month.value}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                        {month.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Year Filter */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Year</label>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
            value={filterYear}
            onChange={(e) => handleYearChange(e.target.value)}
          >
            <option value="">All years</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Investment Type</label>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="">All Types</option>
            {allTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end h-full">
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 w-full text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  )}
</div>
      </div>


      {/* Summary */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
          <div className="bg-indigo-50 rounded-xl p-4 flex flex-col">
            <span className="text-xs uppercase font-medium text-indigo-600">
              Total Investment
            </span>
            <span className="text-2xl font-semibold mt-1">
              ₹ {totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-green-50 rounded-xl p-4 flex flex-col">
            <span className="text-xs uppercase font-medium text-green-600">
              Distinct Types
            </span>
            <span className="text-2xl font-semibold mt-1">
              {new Set(filteredByTime.map((i) => i.investmentType)).size}
            </span>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 flex flex-col">
            <span className="text-xs uppercase font-medium text-yellow-700">
              Entries
            </span>
            <span className="text-2xl font-semibold mt-1">
              {filteredByTime.length}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white shadow rounded-2xl p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">
          Investment Trend{' '}
          {filterTimeframe === 'yearly'
            ? '(Yearly)'
            : filterTimeframe === 'monthly' && selectedMonths.length > 0
            ? `( ${selectedMonths.length} month${selectedMonths.length > 1 ? 's' : ''} selected )`
            : '(Monthly)'}
        </h3>
        {chartData.length === 0 ? (
          <div className="py-16 text-center text-gray-500">No data to display</div>
        ) : (
          <div style={{ width: '100%', height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickFormatter={(val) => {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
                    return val;
                  }}
                />
                <Tooltip
                  formatter={(value) => `₹ ${Number(value).toLocaleString()}`}
                  labelFormatter={(label) => label}
                />
                <Legend verticalAlign="top" />
                <Bar
                  dataKey="total"
                  name="Total"
                  barSize={30}
                  radius={[6, 6, 0, 0]}
                  fill="#6366f1"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Trend"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-2xl overflow-x-auto">
        <div className="p-4 flex flex-col md:flex-row md:justify-between items-start md:items-center">
          <h3 className="text-xl font-semibold mb-2 md:mb-0">
            All Investments ({filteredByTime.length})
          </h3>
          <div className="text-sm text-gray-500">
            Last updated: {format(new Date(), 'PPP p')}
          </div>
        </div>
        <div className="min-w-full overflow-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium">Year</th>
                <th className="px-4 py-2 text-center text-xs font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredByTime.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No investments yet.
                  </td>
                </tr>
              ) : (
                filteredByTime.map((inv) => (
                  <tr key={inv._id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {format(new Date(inv.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{inv.investmentType}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      ₹ {Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getYear(new Date(inv.date))}
                    </td>
                    <td className="px-4 py-3 text-center flex gap-2 justify-center flex-wrap">
                      <button
                        onClick={() => startEdit(inv)}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:opacity-90"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(inv._id)}
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:opacity-90"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Investment;