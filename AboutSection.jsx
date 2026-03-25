import { motion } from "framer-motion";

const slideFromLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 60, damping: 18, duration: 0.8 },
  },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 60, damping: 18, duration: 0.8 },
  },
};

export default function AboutSection() {
  return (
    <section id="about" className="bg-[#111] py-16 px-[5%] md:py-24">
      {/* Section label */}
      <p className="font-mono text-xs tracking-[0.25em] text-[#e8b86d] uppercase mb-8">
        // 01 &mdash; About
      </p>

      {/* Grid: text left, image right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Text — slides in from left */}
        <motion.div
          className="flex flex-col justify-center gap-6"
          variants={slideFromLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h3
            className="text-[#e8b86d] font-bold italic leading-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
            }}
          >
            My Journey
          </h3>
          <p className="text-white/65 text-lg leading-relaxed">
            I&rsquo;m a first-year CUHK BBA-JD student with a deep passion for
            economics, strategic thinking, and technology. From leading Economics
            Olympiad teams to winning case competitions, I enjoy breaking down
            complex problems and building digital communities that make powerful
            ideas accessible to everyone.
          </p>
        </motion.div>

        {/* Image — slides in from right */}
        <motion.div
          className="flex items-center justify-center"
          variants={slideFromRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <img
            src="wp14401400-4k-mobile-batman-wallpapers.jpg"
            alt="Who I Am"
            className="w-full h-[300px] md:h-[500px] object-cover rounded-xl"
            style={{ objectPosition: "center 20%" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
