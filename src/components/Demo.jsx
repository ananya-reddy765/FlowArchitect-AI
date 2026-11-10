import demoVideo from "../assets/good.mp4";

export default function Demo() {
  return (
    <section
      id="demo"
      className="py-20 bg-gradient-to-b from-white to-violet-50 scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-10">

          <span className="inline-flex items-center bg-violet-100 text-violet-700 px-4 py-2 rounded-full font-medium">
            🎥 Live Demo
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold mt-5">
            See FlowArchitect AI in Action
          </h2>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            Watch how FlowArchitect AI transforms a simple workflow idea into a
            complete n8n automation workflow in just a few seconds.
          </p>

        </div>

        {/* Video */}
        <div className="flex justify-center">

          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">

            <video
              className="w-full h-[550px] object-contain bg-black"
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src={demoVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

          </div>

        </div>

      </div>
    </section>
  );
}