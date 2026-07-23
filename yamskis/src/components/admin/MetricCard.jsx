import { motion } from 'framer-motion';

export default function MetricCard({ title, value, detail, icon: Icon, accent = 'from-emerald-500 to-cyan-500', isDarkMode = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-3xl border p-5 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
          <p className={`mt-3 text-3xl font-semibold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>{value}</p>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className={`mt-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{detail}</p>
    </motion.div>
  );
}
