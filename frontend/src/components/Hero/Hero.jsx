import FeatureCard from "./FeatureCard.jsx";
import "./Hero.css";

import animation1 from "../../assets/lottie/animation.json";
import animation2 from "../../assets/lottie/animation.json";
import animation3 from "../../assets/lottie/animation.json";
import animation4 from "../../assets/lottie/animation.json";
import animation5 from "../../assets/lottie/animation.json";
import animation6 from "../../assets/lottie/animation.json";

const features = [
  {
    title: "Fast Development",
    description: "Ship features quickly with a streamlined, modern workflow.",
    animation: animation1,
  },
  {
    title: "Modern Design",
    description: "Clean, premium UI components built for today's products.",
    animation: animation2,
  },
  {
    title: "Cloud Ready",
    description: "Deploy anywhere with infrastructure that scales with you.",
    animation: animation3,
  },
  {
    title: "Secure",
    description: "Enterprise-grade security baked into every layer.",
    animation: animation4,
  },
  {
    title: "Analytics",
    description: "Understand your users with real-time, actionable insights.",
    animation: animation5,
  },
  {
    title: "Automation",
    description: "Automate repetitive tasks and focus on what matters.",
    animation: animation6,
  },
];

function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg-decor" aria-hidden="true">
        <span className="hero__blob hero__blob--one" />
        <span className="hero__blob hero__blob--two" />
      </div>

      <div className="hero__content">
        <h1 className="hero__heading">
          Bring Ideas to Life
          <br />
          With Beautiful Motion
        </h1>
        <p className="hero__subtitle">
          Build stunning, animated experiences that captivate your users and
          bring your products to life with fluid, purposeful motion design.
        </p>
        <button className="hero__cta" type="button">
          Get Started
        </button>
      </div>

      <div className="hero__grid">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            animation={feature.animation}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

export default Hero;
