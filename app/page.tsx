import Image from "next/image";
import Logo from "@/components/Logo";
import CreateShirtForm from "@/components/CreateShirtForm";

const steps = [
  {
    icon: "👕",
    title: "Create your shirt",
    text: "Pick a username and get your own pristine white signout shirt with a unique link.",
  },
  {
    icon: "🔗",
    title: "Share your link",
    text: "Send signout.app/you to friends, classmates and everyone who made the journey special.",
  },
  {
    icon: "✍️",
    title: "Collect signatures",
    text: "They sign with a digital marker — messages, doodles and good vibes, saved forever.",
  },
];


export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <a
          href="#how-it-works"
          className="text-sm font-medium text-slate-600 hover:text-violet-700"
        >
          How it works
        </a>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
          <div>
            <p className="font-hand text-2xl text-violet-600">leave your mark ✦</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              The signout shirt,
              <br />
              <span className="text-violet-600">now digital.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-slate-600">
              The final-year tradition you love — friends signing your white
              shirt with markers — reimagined online. One link, endless
              signatures, memories that never fade or wash out.
            </p>
            <div className="mt-8">
              <CreateShirtForm />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <div className="rounded-[2.5rem] bg-linear-to-b from-white to-slate-100/60 p-6 shadow-[0_30px_80px_-25px_rgba(80,70,180,0.35)]">
              <div className="relative overflow-hidden rounded-3xl" style={{ aspectRatio: "1 / 1" }}>
                <Image
                  src="/hero-shirt.png"
                  alt="A white signout shirt covered in colorful signatures and doodles"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-white/70 py-16">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold text-slate-900">
              How it works
            </h2>
            <p className="mt-2 text-center text-slate-500">
              Three steps to your forever shirt.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="text-3xl">{s.icon}</span>
                  <h3 className="mt-3 font-bold text-slate-900">
                    {i + 1}. {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-slate-400">
        Made with 💜 by Dara and Rex for memories —{" "}
        <span className="font-hand text-base text-slate-500">
          “The best memories are the ones we create together.”
        </span>
      </footer>
    </div>
  );
}
