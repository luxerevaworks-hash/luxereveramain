import PageIntro from "@/components/PageIntro";

export default function ContactPage() {
  return (
    <div>
      <PageIntro eyebrow="Get in touch" title="Contact Us">
        Questions about products, orders, collaborations, or gifting? Send a
        message and the Luxereva team will help.
      </PageIntro>

      <section className="container-page py-12 grid lg:grid-cols-[1fr_380px] gap-8">
        <form className="bg-white border border-gold/30 rounded-lg p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input className="input-field" placeholder="Name" />
            <input className="input-field" placeholder="Email" type="email" />
          </div>
          <input className="input-field" placeholder="Subject" />
          <textarea
            className="input-field min-h-40 resize-y"
            placeholder="Message"
          />
          <button type="button" className="btn-primary">
            Send Message
          </button>
        </form>

        <div className="bg-white border border-gold/30 rounded-lg p-6 h-fit">
          <h2 className="text-xl font-light text-brown-dark">Customer care</h2>
          <div className="mt-5 space-y-4 text-sm text-brown/75">
            <p>
              <span className="font-semibold text-brown-dark">Email:</span>{" "}
              <a href="mailto:info@luxereva.com" className="text-rosewood">
                info@luxereva.com
              </a>
            </p>
            <p><span className="font-semibold text-brown-dark">Hours:</span> Monday to Saturday, 10 AM to 6 PM</p>
            <p><span className="font-semibold text-brown-dark">Orders:</span> Use your account page to check order details.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
