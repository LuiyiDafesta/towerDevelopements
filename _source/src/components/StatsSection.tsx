import { useEffect, useState, useRef } from "react";

const stats = [
  { value: 25, suffix: "+", label: "Años de Experiencia" },
  { value: 50, suffix: "+", label: "Proyectos Completados" },
  { value: 30, suffix: "+", label: "Unidades Entregadas" },
];

const Counter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-5xl md:text-6xl font-serif font-bold text-primary">
      {count.toLocaleString("es-AR")}{suffix}
    </div>
  );
};

const StatsSection = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <Counter target={stat.value} suffix={stat.suffix} />
              <p className="mt-3 text-sm text-muted-foreground tracking-wider uppercase font-sans">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
