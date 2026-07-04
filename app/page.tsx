import Image from "next/image";
import Logo from "@/components/Logo";
import CreateShirtForm from "@/components/CreateShirtForm";
import LoginForm from "@/components/LoginForm";

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
            <div className="mt-8 flex flex-col gap-4">
              <CreateShirtForm />
              <LoginForm />
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

        <section id="how-it-works" className="relative overflow-hidden py-24" style={{ background: "linear-gradient(180deg, #f4f4f8 0%, #ede9fe 50%, #f4f4f8 100%)" }}>
          {/* Decorative background blobs */}
          <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl" />

          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
            <p className="text-center font-hand text-xl text-violet-500">simple as 1-2-3 ✨</p>
            <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-base text-slate-500">
              Three steps to your forever shirt — no markers, no mess, just memories.
            </p>

            <div className="relative mt-16 grid gap-8 sm:grid-cols-3">
              {/* Connecting line between steps (visible on sm+) */}
              <div className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-10 hidden h-0.5 sm:block" style={{ backgroundImage: "repeating-linear-gradient(90deg, #c4b5fd 0, #c4b5fd 8px, transparent 8px, transparent 16px)" }} />

              {steps.map((s, i) => (
                <div
                  key={i}
                  className="group relative flex flex-col items-center text-center"
                >
                  {/* Step number circle */}
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110" style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
                    <span className="text-3xl">{s.icon}</span>
                  </div>
                  <span className="mt-1.5 text-xs font-bold uppercase tracking-widest text-violet-400">
                    Step {i + 1}
                  </span>

                  {/* Card */}
                  <div className="mt-4 w-full rounded-2xl border border-white/60 bg-white/70 px-6 py-6 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                    <h3 className="text-lg font-bold text-slate-900">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {s.text}
                    </p>
                  </div>
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
