import React from "react";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-800/70 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/70 hover:bg-slate-800">
      <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-sky-500/10 via-transparent to-cyan-400/10" />
      <div className="mb-4 inline-flex rounded-xl border border-sky-400/25 bg-slate-900/80 p-3 text-sky-300">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-sky-300">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        {description}
      </p>
    </article>
  );
};

export default FeatureCard;
