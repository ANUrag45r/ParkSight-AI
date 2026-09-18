import { useState } from 'react';
import { Sparkles, Activity, BarChart3 } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'AI Powered Predictions', subtitle: '(CatBoost Model)', tooltip: 'Uses CatBoost gradient boosting for accurate predictions' },
  { icon: Activity, title: 'Real-time Insights', subtitle: '(Location + Time)', tooltip: 'Combines location and temporal data for real-time analysis' },
  { icon: BarChart3, title: 'Smart City Analytics', subtitle: '(Bangalore)', tooltip: 'Comprehensive analytics dashboard for Bangalore city' },
];

const taglines = [
  { text: 'Safer Parking', tooltip: 'Reducing illegal parking and accidents' },
  { text: 'Smoother Traffic', tooltip: 'Optimizing traffic flow in congested areas' },
  { text: 'Smarter Cities', tooltip: 'AI-driven urban planning and management' },
];

const FeatureStrip = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hoveredTagline, setHoveredTagline] = useState<number | null>(null);

  return (
    <div className="glass-card-sm py-3 px-5 flex items-center justify-between w-full">
      <div className="flex items-center gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isHovered = hoveredFeature === index;
          return (
            <div key={feature.title} className="flex items-center gap-2">
              {index > 0 && <div className="w-1 h-1 rounded-full bg-slate-600 -ml-3 mr-0.5" />}
              <button
                className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer outline-none p-1 -m-1 rounded-lg transition-all duration-200"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                title={feature.tooltip}
                style={{
                  background: isHovered ? 'rgba(37,99,255,0.08)' : 'transparent',
                }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isHovered ? 'bg-[rgba(37,99,255,0.25)] shadow-[0_0_12px_rgba(37,99,255,0.2)]' : 'bg-[rgba(37,99,255,0.15)]'
                }`}>
                  <Icon size={14} className={`transition-colors duration-200 ${isHovered ? 'text-[#22D3EE]' : 'text-[#2563FF]'}`} />
                </div>
                <div className="flex flex-col text-left">
                  <span className={`text-xs font-semibold transition-colors duration-200 ${isHovered ? 'text-[#22D3EE]' : 'text-white'}`}>{feature.title}</span>
                  <span className="text-[11px] text-slate-500">{feature.subtitle}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        {taglines.map((tagline, index) => (
          <div key={tagline.text} className="flex items-center gap-3">
            {index > 0 && <div className="w-px h-4 bg-slate-700" />}
            <span 
              className={`text-xs cursor-default select-none transition-colors duration-200 ${
                hoveredTagline === index ? 'text-slate-300' : 'text-slate-500'
              }`}
              onMouseEnter={() => setHoveredTagline(index)}
              onMouseLeave={() => setHoveredTagline(null)}
              title={tagline.tooltip}
            >
              {tagline.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureStrip;
