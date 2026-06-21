import Logo from "@/components/Logo";

export default function PageIntro({ eyebrow, title, children }) {
  return (
    <section className="bg-white border-b border-gold/30">
      <div className="container-page py-12 md:py-16">
        <div className="flex items-center gap-3 mb-5">
          <Logo className="w-32 h-auto text-brown-dark" />
          <span className="text-xs uppercase tracking-widest2 text-gold">
            {eyebrow}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-light text-brown-dark">
          {title}
        </h1>
        {children && (
          <p className="mt-4 max-w-2xl text-brown/75 leading-relaxed">
            {children}
          </p>
        )}
      </div>
    </section>
  );
}
