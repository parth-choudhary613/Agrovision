import LottieImport from "lottie-react";

// See PlantScanPanel.jsx for why this unwrap is needed (Vite/rolldown UMD interop quirk).
const Lottie = LottieImport.default || LottieImport;

function FeatureCard({ title, description, animation, index }) {
  return (
    <div
      className="feature-card"
      style={{ "--stagger": index }}
      tabIndex={0}
    >
      <div className="feature-card__lottie" aria-hidden="true">
        <Lottie animationData={animation} loop autoplay />
      </div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__description">{description}</p>
    </div>
  );
}

export default FeatureCard;
