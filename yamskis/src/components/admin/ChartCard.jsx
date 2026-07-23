import { motion } from 'framer-motion';

export function ChartCard({ title, subtitle, children, isDarkMode = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-[1.75rem] border p-5 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>{title}</h3>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}
