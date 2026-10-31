
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Send, Rocket, Sparkles, Heart } from "lucide-react";

export const Route = createFileRoute("/_site/about")({
  component: AboutPage,
});

function AboutPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div dir="rtl" className="space-y-16 pb-12 text-foreground">

      {/* CINEMATIC INTRO */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-[#080d1b] text-center">
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
          src={`${import.meta.env.BASE_URL}storm-world-whiteboard.mp4`}
          autoPlay
          muted
          loop
          playsInline
          controls
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#080d1b]/40 via-[#080d1b]/70 to-[#080d1b]" />

        <div className="relative px-6 py-24 sm:px-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/20 text-indigo-300">
            <Rocket size={32} />
          </div>
          <p className="mt-6 text-sm font-bold tracking-[0.25em] text-indigo-300">STORM WORLD</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
            من هنا تبدأ رحلة
            <span className="block bg-gradient-to-l from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              اكتشاف المجهول
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            لم نُنشئ هذه المنصة لمجرد نشر المعلومات، بل لنجمع العقول التي تحب السؤال والبحث والاكتشاف.
          </p>
          <a href="#story" className="mt-9 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-bold text-white transition hover:bg-indigo-400">
            اكتشف قصتنا <Sparkles size={18} />
          </a>
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-4xl space-y-5 text-center">
        <p className="text-sm font-bold tracking-widest text-indigo-400">من نحن؟</p>
        <h2 className="text-3xl font-black sm:text-4xl">عالم يجمع محبّي المعرفة</h2>
        <p className="text-base leading-8 text-muted-foreground">
          STORM WORLD مساحة علمية تجمع المهتمين بمختلف المجالات، من الفيزياء والفلك إلى الأحياء والكيمياء والرياضيات وغيرها. مكان نتبادل فيه الأفكار، ونطرح الأسئلة، ونتعلم من بعضنا.
        </p>
      </section>

      {/* FOUNDER STORY */}
      <section id="story" className="space-y-8">
        <div className="text-center">
          <p className="text-sm font-bold tracking-widest text-indigo-400">وراء المنصة حكاية</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">17 محاولة... وعالم واحد</h2>
        </div>

        <div className="relative mx-auto max-w-3xl space-y-7 border-r-2 border-indigo-500/30 pr-6 sm:pr-9">
          <article className="relative space-y-3">
            <span className="absolute -right-[31px] top-1 size-3 rounded-full bg-indigo-400 ring-4 ring-background sm:-right-[43px]" />
            <h3 className="text-xl font-bold">بدأت الحكاية بحزن</h3>
            <p className="leading-8 text-muted-foreground">
              لم يكن لدي أصدقاء كثيرون يشاركونني شغفي بالعلوم. ثم جلست بجانبي زميلة مهتمة بالعلوم وفروعها، وكانت تنظر إليّ وكأنني أعرف كل شيء، بينما كنت أشعر أنني لا أعرف سوى شحنة النيوترون!
            </p>
          </article>

          <article className="relative space-y-3">
            <span className="absolute -right-[31px] top-1 size-3 rounded-full bg-indigo-400 ring-4 ring-background sm:-right-[43px]" />
            <h3 className="text-xl font-bold">فكرة جمعت الجميع</h3>
            <p className="leading-8 text-muted-foreground">
              بعد ذلك تعرفت على شخص آخر يحب الفيزياء، ثم آخرين واحدًا تلو الآخر. كان معظمهم لا يعرف بعضهم. عندها سألت نفسي: لماذا لا أجمعهم جميعًا في مكان واحد؟
            </p>
          </article>

          <article className="relative space-y-3">
            <span className="absolute -right-[31px] top-1 size-3 rounded-full bg-indigo-400 ring-4 ring-background sm:-right-[43px]" />
            <h3 className="text-xl font-bold">بحثت عن المكان المناسب</h3>
            <p className="leading-8 text-muted-foreground">
              فكرت في Messenger وTelegram وWhatsApp، لكن لكل واحد منها ما لم يكن يناسب فكرتي. لذلك قررت، رغم خبرتي البرمجية البسيطة، أن أبني منصتي الخاصة.
            </p>
          </article>

          <article className="relative space-y-3">
            <span className="absolute -right-[31px] top-1 size-3 rounded-full bg-indigo-400 ring-4 ring-background sm:-right-[43px]" />
            <h3 className="text-xl font-bold">من المحاولة الأولى إلى السابعة عشرة</h3>
            <p className="leading-8 text-muted-foreground">
              تزامن المشروع مع أسبوع الاختبارات، ولم يكن الوقت كافيًا. أعدت بناء المشروع مرات عديدة، واستعنت بالخبراء، وواصلت المحاولة رغم التعثر. وصلت إلى المحاولة السادسة عشرة دون النتيجة التي أريدها، ثم بدأت من جديد... حتى وصلت إلى النسخة السابعة عشرة.
            </p>
          </article>

          <article className="relative space-y-3">
            <span className="absolute -right-[31px] top-1 size-3 rounded-full bg-indigo-400 ring-4 ring-background sm:-right-[43px]" />
            <h3 className="text-xl font-bold">وهنا بدأ STORM WORLD</h3>
            <p className="leading-8 text-muted-foreground">
              أضفت ميزات جديدة في كل محاولة، حتى أصبح المشروع عالمًا يضم المجتمع والمناقشات والفيديوهات والمقالات وأدوات المعرفة. لم أبنِ هذا العالم لأكون فيه وحدي، بل بنيته حتى لا يشعر محبّ العلم بأنه وحيد.
            </p>
          </article>
        </div>
      </section>

      {/* MESSAGE */}
      <section className="rounded-3xl border border-indigo-400/20 bg-indigo-500/5 px-6 py-12 text-center sm:px-12">
        <Heart className="mx-auto text-indigo-400" size={30} />
        <h2 className="mt-5 text-2xl font-black">رسالة من المؤسس</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-9 text-muted-foreground">
          من فضلك أيها المستخدم، التزم بقوانين المجتمع واستمتع بهذه اللحظات؛ فكل ثانية من وقتي هي قطعة من عمري.
        </p>
        <p className="mt-6 font-bold text-indigo-300">هنا تجتمع العقول، وتبدأ الاكتشافات.</p>
      </section>

      {/* CONTACT */}
      <section className="space-y-8">
        <div className="text-center">
          <p className="text-sm font-bold tracking-widest text-indigo-400">نبقى على تواصل</p>
          <h2 className="mt-3 text-3xl font-black">تواصل معنا</h2>
          <p className="mt-3 text-muted-foreground">هل لديك اقتراح أو استفسار أو واجهت مشكلة؟ يسعدنا سماعك.</p>
        </div>

        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400"><Mail /></div>
            <div>
              <h3 className="font-bold">أرسل رسالة إلى الإدارة</h3>
              <p className="text-sm text-muted-foreground">املأ البيانات التالية</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert("واجهة التواصل جاهزة، لكن إرسال الرسائل يحتاج إلى ربطها بخدمة خلفية."); }}>
            <label className="mb-2 block text-sm font-semibold">اسمك</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="اكتب اسمك" className="mb-5 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-indigo-400" />

            <label className="mb-2 block text-sm font-semibold">بريدك الإلكتروني (اختياري)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className="mb-5 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-indigo-400" />

            <label className="mb-2 block text-sm font-semibold">رسالتك</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} placeholder="اكتب رسالتك هنا..." className="mb-5 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-indigo-400" />

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-bold text-white transition hover:bg-indigo-400">
              إرسال الرسالة <Send size={18} />
            </button>
          </form>

          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            ملاحظة: نموذج التواصل يحتاج إلى ربط بخدمة خلفية حتى تصل الرسائل فعليًا إلى الإدارة.
          </p>
        </div>
      </section>

      <footer className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
        <p>STORM WORLD — عالم المعرفة والاكتشاف</p>
        <p className="mt-2">© جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
