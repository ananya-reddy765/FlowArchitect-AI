import heroImage from "../assets/hero-illustration.png";

export default function WorkflowSketch() {
  return (
    <div className="flex items-center justify-center">
      <img
        src={heroImage}
        alt="FlowArchitect AI"
        className="
          w-full
          max-w-[720px]
          object-contain
          transition-all
          duration-700
          hover:scale-105
        "
      />
    </div>
  );
}