import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  CheckSquare,
  Clock,
  Calendar as CalendarIcon,
  Brain,
  LayoutDashboard,
  Plus,
  Trash2,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  X,
  BookMarked,
  Image as ImageIcon,
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Coffee,
  Server,
  Play,
  Pause,
  RotateCcw,
  WifiOff,
  MoreVertical,
  PieChart,
} from "lucide-react";

// --- CONFIGURATION ---
const API_URL = "https://dse-backend.onrender.com/api";

// --- TIMETABLE DATA ---
const TIME_SLOTS = [
  { p: 1, start: "08:30", end: "09:10" },
  { p: 2, start: "09:10", end: "09:50" },
  { p: "Break", start: "09:50", end: "10:05" },
  { p: 3, start: "10:05", end: "10:45" },
  { p: 4, start: "10:45", end: "11:25" },
  { p: "Break", start: "11:25", end: "11:40" },
  { p: 5, start: "11:40", end: "12:20" },
  { p: 6, start: "12:20", end: "13:00" },
  { p: "Lunch", start: "13:00", end: "14:15" },
  { p: 7, start: "14:15", end: "14:55" },
  { p: 8, start: "14:55", end: "15:35" },
  { p: 9, start: "16:10", end: "16:40" },
  { p: 10, start: "16:40", end: "17:10" },
];

const INITIAL_TIMETABLE = {
  1: [
    { p: 1, s: "English", r: "506" },
    { p: 2, s: "Maths", r: "506" },
    { p: 3, s: "Chinese", r: "506" },
    { p: 4, s: "Chinese", r: "506" },
    { p: 5, s: "ICT (X1)", r: "CPU-R" },
    { p: 6, s: "ICT (X1)", r: "CPU-R" },
    { p: 7, s: "Chem (X3)", r: "CHM-L" },
    { p: 8, s: "Chem (X3)", r: "CHM-L" },
  ],
  2: [
    { p: 1, s: "Maths", r: "506" },
    { p: 2, s: "Chinese", r: "506" },
    { p: 3, s: "Phy (X2)", r: "PHY-L" },
    { p: 4, s: "Phy (X2)", r: "PHY-L" },
    { p: 5, s: "ICT (X1)", r: "CPU-R" },
    { p: 6, s: "CSD", r: "506" },
    { p: 7, s: "English", r: "506" },
    { p: 8, s: "English", r: "506" },
    { p: 9, s: "M1 (X4)", r: "506" },
    { p: 10, s: "M1 (X4)", r: "506" },
  ],
  3: [
    { p: 1, s: "English", r: "506" },
    { p: 2, s: "Phy (X2)", r: "PHY-L" },
    { p: 3, s: "Chinese", r: "506" },
    { p: 4, s: "Chinese", r: "506" },
    { p: 5, s: "CSD", r: "506" },
    { p: 6, s: "CSD", r: "506" },
    { p: 7, s: "Maths", r: "506" },
    { p: 8, s: "Maths", r: "506" },
  ],
  4: [
    { p: 1, s: "English", r: "506" },
    { p: 2, s: "Chem (X3)", r: "506" },
    { p: 3, s: "Chinese", r: "506" },
    { p: 4, s: "Maths", r: "506" },
    { p: 5, s: "Phy (X2)", r: "506" },
    { p: 6, s: "Phy (X2)", r: "506" },
    { p: 7, s: "ICT (X1)", r: "CPU-R" },
    { p: 8, s: "ICT (X1)", r: "CPU-R" },
  ],
  5: [
    { p: 1, s: "Chinese", r: "506" },
    { p: 2, s: "Chinese", r: "506" },
    { p: 3, s: "PE", r: "PLYG" },
    { p: 4, s: "PE", r: "PLYG" },
    { p: 5, s: "CSD", r: "506" },
    { p: 6, s: "Maths", r: "506" },
    { p: 7, s: "Chem (X3)", r: "CHM-L" },
    { p: 8, s: "Chem (X3)", r: "CHM-L" },
    { p: 9, s: "M1 (X4)", r: "506" },
    { p: 10, s: "M1 (X4)", r: "506" },
  ],
  6: [
    { p: 1, s: "ICT (X1)", r: "CPU-R" },
    { p: 2, s: "ICT (X1)", r: "CPU-R" },
    { p: 3, s: "English", r: "506" },
    { p: 4, s: "English", r: "506" },
    { p: 5, s: "Phy (X2)", r: "PHY-L" },
    { p: 6, s: "Phy (X2)", r: "PHY-L" },
    { p: 7, s: "Chem (X3)", r: "506" },
    { p: 8, s: "LWL", r: "506" },
  ],
};

// --- HELPER FUNCTIONS ---
const getMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const getCurrentLessonStatus = (cycleDay) => {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const slot = TIME_SLOTS.find(
    (s) => mins >= getMinutes(s.start) && mins < getMinutes(s.end)
  );

  if (!slot)
    return {
      status: "Free Time",
      color: "bg-slate-100 text-slate-500",
      progress: 0,
    };

  // Calculate progress % of current lesson
  const startMins = getMinutes(slot.start);
  const endMins = getMinutes(slot.end);
  const progress = ((mins - startMins) / (endMins - startMins)) * 100;

  if (typeof slot.p === "string")
    return { status: slot.p, color: "bg-green-100 text-green-700", progress };

  const lesson = INITIAL_TIMETABLE[cycleDay]?.find((l) => l.p === slot.p);
  if (lesson)
    return {
      status: `Pd ${lesson.p}: ${lesson.s}`,
      room: lesson.r,
      color: "bg-blue-600 text-white",
      progress,
    };

  return {
    status: "Free Period",
    color: "bg-slate-100 text-slate-500",
    progress: 0,
  };
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

// --- COMPONENTS ---

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { id: "diary", label: "Diary", icon: <BookMarked size={20} /> },
    { id: "tasks", label: "Tasks", icon: <CheckSquare size={20} /> },
    { id: "finance", label: "$$ Tracker", icon: <DollarSign size={20} /> },
    { id: "timetable", label: "Timetable", icon: <MapPin size={20} /> },
    { id: "calendar", label: "Calendar", icon: <CalendarIcon size={20} /> },
    { id: "focus", label: "Pomodoro", icon: <Clock size={20} /> },
    { id: "revision", label: "Q Bank", icon: <Brain size={20} /> },
    { id: "notes", label: "Notes", icon: <BookOpen size={20} /> },
  ];
  return (
    <div className="w-20 md:w-64 bg-slate-900 text-slate-300 h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50 transition-all duration-300">
      <div className="p-6 border-b border-slate-800 hidden md:block">
        <h1 className="text-2xl font-black text-white tracking-tight">
          DSE <span className="text-blue-500">Fighter</span>
        </h1>
        <p className="text-xs mt-2 flex items-center gap-2 text-emerald-400 font-mono bg-emerald-400/10 px-2 py-1 rounded w-fit">
          <Server size={10} /> MySQL Online
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center md:space-x-3 px-3 py-3 rounded-xl transition-all duration-200 justify-center md:justify-start group ${
              activeTab === item.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            <div
              className={`${
                activeTab === item.id
                  ? "text-white"
                  : "text-slate-400 group-hover:text-white"
              }`}
            >
              {item.icon}
            </div>
            <span className="font-medium hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const Dashboard = ({ tasks, questions, cycleDay, setCycleDay, homeworks }) => {
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const dueReviews = questions.filter(
    (q) => new Date(q.next_review) <= new Date()
  ).length;
  const urgentHomework = homeworks.filter(
    (h) =>
      !h.completed &&
      new Date(h.due_date) <= new Date(Date.now() + 86400000 * 2)
  ).length;
  const todaysClasses = INITIAL_TIMETABLE[cycleDay] || [];
  const [currentStatus, setCurrentStatus] = useState(
    getCurrentLessonStatus(cycleDay)
  );

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentStatus(getCurrentLessonStatus(cycleDay)),
      60000
    );
    return () => clearInterval(timer);
  }, [cycleDay]);

  const daysLeft = Math.ceil(
    (new Date("2026-04-21") - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            {getGreeting()}, Polarpear.
          </h2>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <Target size={16} className="text-blue-500" /> Goal: 5** in
            Electives
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              DSE Countdown
            </span>
            <div className="text-3xl font-black text-slate-800 leading-none">
              {daysLeft}{" "}
              <span className="text-sm font-medium text-slate-400">days</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-200"></div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
            <span className="text-slate-500 font-bold text-sm">Cycle Day</span>
            <select
              value={cycleDay}
              onChange={(e) => setCycleDay(Number(e.target.value))}
              className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg outline-none cursor-pointer hover:bg-blue-100 transition-colors text-lg"
            >
              {[1, 2, 3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Live Status Bar */}
      <div
        className={`w-full p-1 rounded-2xl shadow-lg overflow-hidden relative ${
          currentStatus.color.includes("blue")
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            : "bg-white border border-slate-200 text-slate-800"
        }`}
      >
        <div
          className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-1000"
          style={{ width: `${currentStatus.progress}%` }}
        ></div>
        <div className="p-5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${
                currentStatus.color.includes("blue")
                  ? "bg-white/20 backdrop-blur-sm"
                  : "bg-slate-100"
              }`}
            >
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-70 font-bold mb-0.5">
                Happening Now
              </p>
              <h3 className="text-xl font-bold">{currentStatus.status}</h3>
            </div>
          </div>
          {currentStatus.room && (
            <div className="px-4 py-2 rounded-lg text-sm font-bold bg-white/20 backdrop-blur-md shadow-sm">
              Room {currentStatus.room}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <AlertCircle size={20} />
              </div>
            </div>
            <h3 className="text-4xl font-black text-slate-800">
              {urgentHomework}
            </h3>
            <p className="text-slate-500 font-medium mt-1">
              Urgent Assignments
            </p>
            <p className="text-xs text-red-500 mt-2 font-bold">
              Due within 48h
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Brain size={20} />
              </div>
            </div>
            <h3 className="text-4xl font-black text-slate-800">{dueReviews}</h3>
            <p className="text-slate-500 font-medium mt-1">Flashcards Due</p>
            <p className="text-xs text-blue-500 mt-2 font-bold">
              Keep the streak alive!
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <CheckSquare size={20} />
              </div>
            </div>
            <h3 className="text-4xl font-black text-slate-800">
              {pendingTasks}
            </h3>
            <p className="text-slate-500 font-medium mt-1">Pending Tasks</p>
            <p className="text-xs text-emerald-500 mt-2 font-bold">
              Get them done.
            </p>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <CalendarIcon size={20} className="text-blue-600" /> Today's Schedule
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {todaysClasses.map((cls, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center hover:bg-blue-50 hover:border-blue-100 transition-colors group"
            >
              <div className="text-xs font-bold text-blue-500 mb-1 group-hover:text-blue-600">
                Pd {cls.p}
              </div>
              <div className="font-bold text-slate-700 text-sm truncate mb-1">
                {cls.s}
              </div>
              <div className="text-[10px] text-slate-400 font-mono bg-white rounded py-0.5 mx-2">
                {cls.r}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Diary = ({ homeworks, refresh }) => {
  const [newHW, setNewHW] = useState({
    subject: "",
    description: "",
    dueDate: "",
    type: "Homework",
  });

  const add = async () => {
    if (!newHW.subject || !newHW.dueDate) return;
    await fetch(`${API_URL}/diary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newHW),
    });
    setNewHW({ subject: "", description: "", dueDate: "", type: "Homework" });
    refresh();
  };
  const toggle = async (hw) => {
    await fetch(`${API_URL}/diary/${hw.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !hw.completed }),
    });
    refresh();
  };
  const del = async (id) => {
    if (confirm("Delete?")) {
      await fetch(`${API_URL}/diary/${id}`, { method: "DELETE" });
      refresh();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
      <div className="md:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit flex flex-col">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BookMarked size={20} className="text-blue-600" /> New Entry
        </h2>
        <div className="space-y-4 flex-1">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            {["Homework", "Assessment"].map((type) => (
              <button
                key={type}
                onClick={() => setNewHW({ ...newHW, type })}
                className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
                  newHW.type === type
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <input
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Subject (e.g. Maths)"
            value={newHW.subject}
            onChange={(e) => setNewHW({ ...newHW, subject: e.target.value })}
          />
          <textarea
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Details..."
            value={newHW.description}
            onChange={(e) =>
              setNewHW({ ...newHW, description: e.target.value })
            }
          />
          <input
            type="date"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={newHW.dueDate}
            onChange={(e) => setNewHW({ ...newHW, dueDate: e.target.value })}
          />
        </div>
        <button
          onClick={add}
          className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold mt-4 transition-colors shadow-lg shadow-slate-900/20"
        >
          Add Entry
        </button>
      </div>
      <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Assignments</h2>
        <div className="space-y-3">
          {homeworks.map((hw) => (
            <div
              key={hw.id}
              className={`p-4 rounded-xl border flex gap-4 transition-all hover:shadow-md ${
                hw.completed
                  ? "bg-slate-50 opacity-60 border-slate-100"
                  : "bg-white border-slate-200"
              }`}
            >
              <button
                onClick={() => toggle(hw)}
                className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  hw.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-slate-300 hover:border-green-500"
                }`}
              >
                {hw.completed && <CheckSquare size={14} />}
              </button>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      hw.type === "Assessment"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {hw.type}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Due {new Date(hw.due_date).toLocaleDateString()}
                  </span>
                </div>
                <h3
                  className={`font-bold text-lg ${
                    hw.completed
                      ? "line-through text-slate-400"
                      : "text-slate-800"
                  }`}
                >
                  {hw.subject}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{hw.description}</p>
              </div>
              <button
                onClick={() => del(hw.id)}
                className="text-slate-300 hover:text-red-500 p-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FinanceTracker = () => {
  const [txs, setTxs] = useState([]);
  const [newTx, setNewTx] = useState({
    desc: "",
    amount: "",
    type: "expense",
    category: "Food",
  });

  const load = async () => {
    const res = await fetch(`${API_URL}/finance`);
    setTxs(await res.json());
  };
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!newTx.desc || !newTx.amount) return;
    await fetch(`${API_URL}/finance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: newTx.desc,
        amount: newTx.amount,
        type: newTx.type,
        category: newTx.category,
      }),
    });
    setNewTx({ desc: "", amount: "", type: "expense", category: "Food" });
    load();
  };
  const del = async (id) => {
    await fetch(`${API_URL}/finance/${id}`, { method: "DELETE" });
    load();
  };

  const income = txs
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const expense = txs
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const totalVolume = income + expense;

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      <div className="md:w-80 space-y-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-900/20">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Total Balance
          </p>
          <h2 className="text-4xl font-black mt-2">
            ${(income - expense).toFixed(1)}
          </h2>

          {/* Visual Bar */}
          <div className="w-full h-2 bg-slate-700 rounded-full mt-6 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{
                width: `${
                  totalVolume > 0 ? (income / totalVolume) * 100 : 50
                }%`,
              }}
            ></div>
            <div className="bg-rose-500 h-full flex-1"></div>
          </div>
          <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
            <span>
              {(totalVolume > 0 ? (income / totalVolume) * 100 : 0).toFixed(0)}%
              In
            </span>
            <span>
              {(totalVolume > 0 ? (expense / totalVolume) * 100 : 0).toFixed(0)}
              % Out
            </span>
          </div>

          <div className="flex mt-6 gap-4 pt-6 border-t border-slate-700">
            <div>
              <span className="text-emerald-400 text-xs flex items-center gap-1 mb-1">
                <TrendingUp size={12} /> Income
              </span>
              <p className="font-bold text-xl">${income}</p>
            </div>
            <div>
              <span className="text-rose-400 text-xs flex items-center gap-1 mb-1">
                <TrendingDown size={12} /> Expense
              </span>
              <p className="font-bold text-xl">${expense}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Plus size={18} className="text-blue-500" /> Add Transaction
          </h3>
          <div className="flex gap-2 mb-3 p-1 bg-slate-50 rounded-lg">
            <button
              onClick={() => setNewTx({ ...newTx, type: "expense" })}
              className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
                newTx.type === "expense"
                  ? "bg-white text-rose-500 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setNewTx({ ...newTx, type: "income" })}
              className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
                newTx.type === "income"
                  ? "bg-white text-emerald-500 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Income
            </button>
          </div>
          <input
            className="w-full p-2 border border-slate-200 rounded-lg mb-2 text-sm outline-none focus:border-blue-500"
            placeholder="Description"
            value={newTx.desc}
            onChange={(e) => setNewTx({ ...newTx, desc: e.target.value })}
          />
          <input
            type="number"
            className="w-full p-2 border border-slate-200 rounded-lg mb-2 text-sm outline-none focus:border-blue-500"
            placeholder="Amount"
            value={newTx.amount}
            onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
          />
          <select
            className="w-full p-2 border border-slate-200 rounded-lg mb-4 text-sm outline-none focus:border-blue-500"
            value={newTx.category}
            onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
          >
            <option>Food</option>
            <option>Transport</option>
            <option>Stationery</option>
            <option>Ent.</option>
            <option>Pocket Money</option>
          </select>
          <button
            onClick={add}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors"
          >
            Add Transaction
          </button>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 overflow-y-auto custom-scrollbar shadow-sm">
        <h3 className="font-bold mb-4 text-slate-800">History</h3>
        <div className="space-y-3">
          {txs.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    t.type === "income"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {t.type === "income" ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-700">
                    {t.description}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    {t.category} •{" "}
                    {new Date(t.transaction_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`font-bold font-mono ${
                    t.type === "income" ? "text-emerald-600" : "text-slate-800"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}${t.amount}
                </span>
                <button
                  onClick={() => del(t.id)}
                  className="text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const QuestionBank = ({ questions, refresh }) => {
  const [view, setView] = useState("list");
  const [newQ, setNewQ] = useState({
    subject: "",
    topic: "",
    question: "",
    answer: "",
    image: "",
  });
  const [currIndex, setCurrIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const dueQuestions = questions.filter(
    (q) => new Date(q.next_review) <= new Date()
  );

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (f) {
      const r = new FileReader();
      r.onloadend = () => setNewQ({ ...newQ, image: r.result });
      r.readAsDataURL(f);
    }
  };
  const add = async () => {
    await fetch(`${API_URL}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQ),
    });
    refresh();
    setView("list");
  };
  const review = async (days) => {
    await fetch(`${API_URL}/questions/${dueQuestions[currIndex].id}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval: days }),
    });
    setShowAnswer(false);
    if (currIndex < dueQuestions.length - 1) setCurrIndex(currIndex + 1);
    else {
      setView("list");
      refresh();
    }
  };

  return (
    <div className="bg-white h-full rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800">Q-Bank</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView("add")}
            className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-sm transition-colors"
          >
            + Add New
          </button>
          <button
            onClick={() => {
              if (dueQuestions.length) {
                setCurrIndex(0);
                setView("review");
              } else alert("No cards due");
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-500/20"
          >
            Start Review ({dueQuestions.length})
          </button>
        </div>
      </div>
      {view === "list" && (
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
          {questions.map((q) => (
            <div
              key={q.id}
              className="p-4 border border-slate-100 rounded-xl flex gap-4 hover:shadow-md transition-shadow bg-slate-50/50 group"
            >
              {q.image_data && (
                <img
                  src={q.image_data}
                  className="w-20 h-20 object-cover rounded-lg bg-white border border-slate-200 shadow-sm"
                />
              )}
              <div className="flex-1">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 bg-blue-50 w-fit px-2 py-0.5 rounded">
                  {q.subject}
                </div>
                <div className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                  {q.question_text}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {view === "add" && (
        <div className="space-y-4 max-w-2xl mx-auto w-full">
          <input
            className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="Subject"
            onChange={(e) => setNewQ({ ...newQ, subject: e.target.value })}
          />
          <textarea
            className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all h-32"
            placeholder="Question"
            onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
          />
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
            <input
              type="file"
              onChange={handleImage}
              className="hidden"
              id="img-up"
            />
            <label
              htmlFor="img-up"
              className="cursor-pointer text-slate-500 flex flex-col items-center gap-2"
            >
              <ImageIcon />
              <span className="text-sm font-bold">Upload Diagram</span>
            </label>
          </div>
          <textarea
            className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="Answer"
            onChange={(e) => setNewQ({ ...newQ, answer: e.target.value })}
          />
          <div className="flex gap-4">
            <button
              onClick={add}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors"
            >
              Save Card
            </button>
            <button
              onClick={() => setView("list")}
              className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {view === "review" && dueQuestions.length > 0 && (
        <div className="text-center mt-10 max-w-3xl mx-auto">
          {dueQuestions[currIndex].image_data && (
            <img
              src={dueQuestions[currIndex].image_data}
              className="max-h-64 mx-auto mb-8 rounded-xl shadow-lg border border-slate-200"
            />
          )}
          <h3 className="text-3xl font-bold mb-12 text-slate-800 leading-relaxed">
            {dueQuestions[currIndex].question_text}
          </h3>
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="bg-slate-800 hover:bg-slate-900 text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-xl"
            >
              Show Answer
            </button>
          ) : (
            <div className="animate-fade-in w-full">
              <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100 text-emerald-800 mb-10 text-lg font-medium shadow-sm">
                {dueQuestions[currIndex].answer_text}
              </div>
              <div className="flex justify-center gap-6">
                <button
                  onClick={() => review(1)}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-rose-500/30"
                >
                  Hard (1 Day)
                </button>
                <button
                  onClick={() => review(4)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/30"
                >
                  Easy (4 Days)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [curDate, setCurDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selDay, setSelDay] = useState(null);
  const [title, setTitle] = useState("");

  const load = async () => {
    const res = await fetch(`${API_URL}/events`);
    setEvents(await res.json());
  };
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const dateStr = `${curDate.getFullYear()}-${String(
      curDate.getMonth() + 1
    ).padStart(2, "0")}-${String(selDay).padStart(2, "0")}`;
    await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date: dateStr }),
    });
    setModalOpen(false);
    setTitle("");
    load();
  };
  const del = async (id, e) => {
    e.stopPropagation();
    if (confirm("Del?")) {
      await fetch(`${API_URL}/events/${id}`, { method: "DELETE" });
      load();
    }
  };

  const daysInMonth = new Date(
    curDate.getFullYear(),
    curDate.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(
    curDate.getFullYear(),
    curDate.getMonth(),
    1
  ).getDay();
  const todayDate = new Date();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="text-blue-600" />{" "}
          {curDate.toLocaleString("default", { month: "long" })}{" "}
          {curDate.getFullYear()}
        </h2>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-full">
          <button
            onClick={() =>
              setCurDate(
                new Date(curDate.getFullYear(), curDate.getMonth() - 1)
              )
            }
            className="p-2 hover:bg-white rounded-full transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() =>
              setCurDate(
                new Date(curDate.getFullYear(), curDate.getMonth() + 1)
              )
            }
            className="p-2 hover:bg-white rounded-full transition-all shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-4">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div
            key={d}
            className="text-center font-bold text-slate-400 text-xs tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr gap-1">
        {[...Array(firstDay)].map((_, i) => (
          <div key={`e-${i}`}></div>
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateStr = `${curDate.getFullYear()}-${String(
            curDate.getMonth() + 1
          ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const evs = events.filter((e) => e.event_date.startsWith(dateStr));
          const isToday =
            day === todayDate.getDate() &&
            curDate.getMonth() === todayDate.getMonth() &&
            curDate.getFullYear() === todayDate.getFullYear();

          return (
            <div
              key={day}
              onClick={() => {
                setSelDay(day);
                setModalOpen(true);
              }}
              className={`rounded-xl p-2 cursor-pointer transition-all relative group border ${
                isToday
                  ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-offset-2 z-10"
                  : "bg-white border-slate-100 hover:border-blue-300 hover:shadow-md"
              }`}
            >
              <div
                className={`text-sm font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? "bg-blue-600 text-white" : "text-slate-600"
                }`}
              >
                {day}
              </div>
              <div className="space-y-1">
                {evs.map((e) => (
                  <div
                    key={e.id}
                    className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium truncate flex justify-between items-center group/ev"
                  >
                    {e.title}
                    <button
                      onClick={(ev) => del(e.id, ev)}
                      className="hidden group-hover/ev:block text-red-500 ml-1 hover:bg-red-100 rounded px-0.5"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {modalOpen && (
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center rounded-2xl z-50">
          <div className="bg-white p-6 rounded-2xl w-72 shadow-2xl animate-fade-in">
            <h3 className="font-bold mb-4 text-lg text-slate-800">
              Add Event ({selDay})
            </h3>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-slate-200 p-3 w-full rounded-xl mb-4 outline-none focus:border-blue-500"
              placeholder="Event Name"
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <button
              onClick={add}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg font-bold transition-colors"
            >
              Save Event
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 w-full text-sm mt-3 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Notebook = () => {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const load = async () => {
    const res = await fetch(`${API_URL}/notes`);
    setNotes(await res.json());
  };
  useEffect(() => {
    load();
  }, []);
  const add = async () => {
    const res = await fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled", body: "" }),
    });
    const n = await res.json();
    setActiveId(n.id);
    load();
  };
  const update = async (k, v) => {
    const n = notes.find((x) => x.id === activeId);
    if (n) {
      await fetch(`${API_URL}/notes/${activeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: k === "title" ? v : n.title,
          body: k === "body" ? v : n.body,
        }),
      });
      load();
    }
  };
  const active = notes.find((n) => n.id === activeId);
  return (
    <div className="bg-white h-[calc(100vh-100px)] rounded-2xl shadow-sm border border-slate-100 flex overflow-hidden">
      <div className="w-1/3 border-r border-slate-100 bg-slate-50 flex flex-col">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-bold text-slate-700">My Notes</h2>
          <button
            onClick={add}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {notes.map((n) => (
            <div
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                activeId === n.id
                  ? "bg-white border-l-4 border-l-blue-600 shadow-sm"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <div className="font-bold text-sm truncate">
                {n.title || "Untitled Note"}
              </div>
            </div>
          ))}
        </div>
      </div>
      {active ? (
        <div className="flex-1 flex flex-col bg-white">
          <input
            className="p-8 text-3xl font-bold border-b border-slate-100 outline-none text-slate-800 placeholder:text-slate-300"
            value={active.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Note Title"
          />
          <textarea
            className="flex-1 p-8 resize-none outline-none text-lg text-slate-600 leading-relaxed placeholder:text-slate-300"
            value={active.body}
            onChange={(e) => update("body", e.target.value)}
            placeholder="Start typing..."
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
          <FileText size={64} className="opacity-20" />
          <p>Select a note to view</p>
        </div>
      )}
    </div>
  );
};

const FocusMode = () => {
  const [time, setTime] = useState(1500);
  const [active, setActive] = useState(false);
  const [init, setInit] = useState(1500);
  useEffect(() => {
    let i;
    if (active && time > 0) i = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(i);
  }, [active, time]);
  const setMode = (t) => {
    setActive(false);
    setTime(t);
    setInit(t);
  };
  const dash = 2 * Math.PI * 120;
  const off = dash - ((init - time) / init) * dash;
  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-900 rounded-3xl text-white relative overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900"></div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex gap-3 mb-10 bg-slate-800/50 p-1.5 rounded-xl backdrop-blur-sm border border-slate-700">
          <button
            onClick={() => setMode(1500)}
            className="bg-blue-600 px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20"
          >
            Focus
          </button>
          <button
            onClick={() => setMode(300)}
            className="hover:bg-slate-700 px-6 py-2 rounded-lg font-bold text-slate-400 hover:text-white transition-colors"
          >
            Break
          </button>
        </div>
        <div className="relative w-80 h-80 flex items-center justify-center">
          <svg className="transform -rotate-90 w-full h-full filter drop-shadow-2xl">
            <circle
              cx="160"
              cy="160"
              r="120"
              stroke="#1e293b"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="160"
              cy="160"
              r="120"
              stroke="#3b82f6"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={dash}
              strokeDashoffset={off}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute text-7xl font-black font-mono tracking-tighter">
            {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, "0")}
          </div>
        </div>
        <div className="flex gap-6 mt-12">
          <button
            onClick={() => setActive(!active)}
            className="w-20 h-20 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-white/10"
          >
            {active ? (
              <Pause size={32} fill="currentColor" />
            ) : (
              <Play size={32} fill="currentColor" className="ml-1" />
            )}
          </button>
          <button
            onClick={() => setTime(init)}
            className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskList = ({ tasks, refresh }) => {
  const [input, setInput] = useState("");
  const add = async () => {
    if (input) {
      await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      setInput("");
      refresh();
    }
  };
  const toggle = async (t) => {
    await fetch(`${API_URL}/tasks/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !t.completed }),
    });
    refresh();
  };
  const del = async (id) => {
    await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
    refresh();
  };
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-[500px]">
      <h2 className="text-2xl font-bold mb-8 text-slate-800">My Tasks</h2>
      <div className="flex gap-3 mb-8">
        <input
          className="flex-1 p-4 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          placeholder="What needs to be done?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          onClick={add}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus />
        </button>
      </div>
      <div className="space-y-2">
        {tasks.map((t) => (
          <div
            key={t.id}
            className={`flex items-center p-4 rounded-xl transition-all group ${
              t.completed
                ? "bg-slate-50"
                : "hover:bg-slate-50 border border-transparent hover:border-slate-100"
            }`}
          >
            <button
              onClick={() => toggle(t)}
              className={`w-6 h-6 border-2 rounded-lg mr-4 flex items-center justify-center transition-all ${
                t.completed
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-slate-300 hover:border-blue-400"
              }`}
            >
              {t.completed && <CheckSquare size={14} />}
            </button>
            <span
              className={`font-medium transition-colors ${
                t.completed ? "line-through text-slate-400" : "text-slate-700"
              }`}
            >
              {t.text}
            </span>
            <button
              onClick={() => del(t.id)}
              className="ml-auto text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [cycleDay, setCycleDay] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [homeworks, setHomeworks] = useState([]);

  const refreshData = async () => {
    try {
      const [resT, resQ, resH] = await Promise.all([
        fetch(`${API_URL}/tasks`),
        fetch(`${API_URL}/questions`),
        fetch(`${API_URL}/diary`),
      ]);
      setTasks(await resT.json());
      setQuestions(await resQ.json());
      setHomeworks(await resH.json());
    } catch (e) {
      console.error("API Error (Make sure server.js is running!)");
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 md:ml-64 p-4 md:p-8 h-screen overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar pr-2">
            {activeTab === "dashboard" && (
              <Dashboard
                tasks={tasks}
                questions={questions}
                cycleDay={cycleDay}
                setCycleDay={setCycleDay}
                homeworks={homeworks}
              />
            )}
            {activeTab === "diary" && (
              <Diary homeworks={homeworks} refresh={refreshData} />
            )}
            {activeTab === "finance" && <FinanceTracker />}
            {activeTab === "focus" && <FocusMode />}
            {activeTab === "revision" && (
              <QuestionBank questions={questions} refresh={refreshData} />
            )}
            {activeTab === "tasks" && (
              <TaskList tasks={tasks} refresh={refreshData} />
            )}
            {activeTab === "notes" && <Notebook />}
            {activeTab === "calendar" && <EventCalendar />}
            {activeTab === "timetable" && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-slate-800">
                  <MapPin className="text-blue-600" /> Full Timetable
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((day) => (
                    <div
                      key={day}
                      className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-black text-blue-600 mb-4 border-b border-slate-100 pb-2 flex justify-between items-center">
                        Day {day}{" "}
                        <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-1 rounded">
                          8 Classes
                        </span>
                      </h3>
                      <ul className="space-y-3 text-sm">
                        {INITIAL_TIMETABLE[day].map((t, i) => (
                          <li
                            key={i}
                            className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <div>
                              <span className="font-bold text-slate-400 mr-3 w-4 inline-block">
                                {t.p}.
                              </span>
                              <span className="font-bold text-slate-700">
                                {t.s}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                              {t.r}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default App;
