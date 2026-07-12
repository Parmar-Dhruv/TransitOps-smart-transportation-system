import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

export const AuthLayout = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black p-4 overflow-hidden">
      {/* Animated Floating Shapes */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl md:-top-80">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-[#9089fc] sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 0.2, x: 0 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[15deg] bg-gradient-to-tr from-accent to-[#ff80b5] sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
        />
      </div>
      
      {/* Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-[2rem] p-8 sm:p-10 shadow-2xl relative backdrop-blur-xl border border-white/10 dark:border-white/5">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
};
