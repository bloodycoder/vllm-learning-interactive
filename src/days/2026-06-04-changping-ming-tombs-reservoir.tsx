import React, { useMemo, useState } from "react";

const itinerary = [
  { time: "10:30", title: "中国石油大学附近", tag: "大学城生活感", detail: "府学路、南环东路、昌平城区慢慢走：校门口、小吃店、水果店、奶茶咖啡、学生饭馆。" },
  { time: "11:00", title: "学生区早午饭", tag: "别找网红店", detail: "麻辣拌、凉皮、面馆、米线、盖饭，选学生会吃的店就对了。" },
  { time: "12:00", title: "图书馆 / 城区散步", tag: "暂住昌平", detail: "图书馆坐 40 分钟，再到城区公园或街边慢走 30 分钟，不赶路。" },
  { time: "14:30", title: "十三陵水库", tag: "山水放空", detail: "停车、沿水边或大坝附近散步，看山、水、风和远处蟒山。" },
  { time: "16:30", title: "蟒山附近看景", tag: "不一定爬山", detail: "体力好走一小段；体力一般找观景点；想摆烂就车里放歌看夕阳。" },
  { time: "18:30", title: "回昌平县城吃晚饭", tag: "烟火气收尾", detail: "学生街、家常菜、面馆、烧烤、羊蝎子，吃完再散步 20 分钟。" },
  { time: "20:00", title: "回程", tag: "舒服结束", detail: "避免太晚太累，把惬意感留到第二天。" },
];

const route = ["中国石油大学（北京）府学路18号", "昌平区图书馆 / 昌平城区", "十三陵水库", "蟒山国家森林公园附近", "回昌平县城吃晚饭"];

const sourceLinks = [
  { label: "中国石油大学（北京）", href: "https://www.cup.edu.cn/" },
  { label: "昌平区图书馆 - 首都之窗", href: "https://www.beijing.gov.cn/renwen/rwzyd/tsg/cpqvtsg/202312/t20231225_3509840.html" },
  { label: "十三陵水库 - 北京旅游网资源库", href: "https://s.visitbeijing.com.cn/attraction/101277" },
  { label: "蟒山国家森林公园 - 首都之窗", href: "https://www.beijing.gov.cn/gate/big5/www.beijing.gov.cn/renwen/rwzyd/lyjq/3A/msgjslgy/202210/t20221020_2839875.html" },
];

function WeatherCard() {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-2xl shadow-sky-900/10 backdrop-blur md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">Changping Weekend</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">优先选周日去</h2>
          <p className="mt-2 text-slate-600">当前状况：多云，72°F / 22°C。周六有阵雨，周日大部分晴，更适合开车慢慢玩。</p>
        </div>
        <div className="grid min-w-[260px] grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <div className="text-3xl">🌦️</div>
            <p className="mt-2 text-sm text-slate-300">星期六 · 6月6日</p>
            <p className="text-lg font-bold">12–22°C</p>
            <p className="text-xs text-slate-300">大部分多云，有阵雨</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 p-4 text-slate-950 shadow-lg shadow-orange-300/30">
            <div className="text-3xl">☀️</div>
            <p className="mt-2 text-sm font-medium text-slate-800">星期日 · 6月7日</p>
            <p className="text-lg font-black">15–28°C</p>
            <p className="text-xs font-medium text-slate-800">大部分晴，最推荐</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [mode, setMode] = useState<"sun" | "sat">("sun");
  const progress = useMemo(() => (mode === "sun" ? itinerary.length : 5), [mode]);

  return (
    <main className="min-h-screen bg-[#eef7f4] text-slate-900">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[38rem] w-[38rem] rounded-full bg-sky-300/40 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[34rem] w-[34rem] rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute left-[35%] top-[20%] h-[22rem] w-[22rem] rounded-full bg-amber-200/50 blur-3xl" />
      </div>

      <section className="mx-auto max-w-6xl px-5 py-8 md:py-12">
        <header className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/75 shadow-2xl shadow-emerald-900/10 backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-7 md:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
                <span>🚗</span> 周末半日逃离计划
              </div>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
                昌平生活感一日游
                <span className="block bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-500 bg-clip-text text-transparent">石油大学 · 县城 · 水库 · 蟒山</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-650">
                不按“景点打卡”规划，而是偷半天暂住昌平的松弛感：前半段像大学城生活，后半段像北京近郊逃离，晚上再回县城吃便宜好吃的饭。
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800" href="https://maps.google.com/?q=中国石油大学（北京）府学路18号" target="_blank" rel="noreferrer">打开起点导航</a>
                <a className="rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-500" href="https://s.visitbeijing.com.cn/attraction/101277" target="_blank" rel="noreferrer">查看十三陵水库</a>
              </div>
            </div>
            <div className="relative min-h-[360px] bg-slate-900">
              <img className="h-full w-full object-cover opacity-90" src="https://tse4.mm.bing.net/th/id/OIP.iH25GwiRqaeMV_afsVPUrQHaE7?cb=thfc1falcon&pid=Api" alt="十三陵水库山水" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/20 bg-white/15 p-5 text-white backdrop-blur-md">
                <p className="text-sm uppercase tracking-[0.25em] text-white/70">Final Vibe</p>
                <p className="mt-2 text-2xl font-black">“我今天不是游客，我只是暂住昌平一天。”</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-6"><WeatherCard /></div>

        <section className="mt-6 rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">Choose your mode</p>
              <h2 className="mt-1 text-2xl font-black">路线模式</h2>
            </div>
            <div className="inline-flex rounded-full bg-slate-100 p-1">
              <button onClick={() => setMode("sun")} className={`rounded-full px-5 py-2 text-sm font-bold transition ${mode === "sun" ? "bg-slate-950 text-white shadow" : "text-slate-600 hover:text-slate-950"}`}>周日惬意版</button>
              <button onClick={() => setMode("sat")} className={`rounded-full px-5 py-2 text-sm font-bold transition ${mode === "sat" ? "bg-slate-950 text-white shadow" : "text-slate-600 hover:text-slate-950"}`}>周六雨天版</button>
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500" style={{ width: `${(progress / itinerary.length) * 100}%` }} />
          </div>
          {mode === "sat" && (
            <div className="mt-5 rounded-2xl bg-sky-50 p-4 text-sky-950 ring-1 ring-sky-100">
              <b>雨天松弛版：</b>石油大学附近吃饭 → 昌平区图书馆坐一会儿 → 昌平公园/商圈短逛 → 雨停再去十三陵水库兜一圈 → 不进蟒山、不爬山。
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-[2rem] border border-white/60 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/15 lg:sticky lg:top-6 lg:h-fit">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">Navigation</p>
            <h2 className="mt-2 text-2xl font-black">最终导航顺序</h2>
            <ol className="mt-6 space-y-4">
              {route.map((item, idx) => (
                <li key={item} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">{idx + 1}</span>
                  <span className="pt-1 text-sm leading-6 text-slate-200">{item}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-200">
              关键原则：不要把“进校园”和“景点打卡”作为刚需，停好车、慢慢走、随便吃、找地方发呆。
            </div>
          </aside>

          <div className="space-y-4">
            {itinerary.map((item, idx) => {
              const muted = mode === "sat" && idx > 4;
              return (
                <article key={item.time} className={`group rounded-[2rem] border p-5 shadow-lg transition hover:-translate-y-1 md:p-6 ${muted ? "border-slate-200 bg-white/45 opacity-55" : "border-white/70 bg-white/85 shadow-slate-900/5"}`}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="flex w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 px-4 py-3 text-xl font-black text-white shadow-lg shadow-emerald-500/20">{item.time}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-black text-slate-950">{item.title}</h3>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">{item.tag}</span>
                      </div>
                      <p className="mt-3 text-base leading-7 text-slate-600">{item.detail}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur md:p-8">
          <h2 className="text-2xl font-black">晚饭关键词</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {["学生街", "家常菜", "面馆", "烧烤", "羊蝎子", "麻辣拌", "凉皮二刷"].map((x) => <span key={x} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">{x}</span>)}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-5"><p className="text-3xl">🏫</p><h3 className="mt-3 font-black">大学城</h3><p className="mt-2 text-sm leading-6 text-slate-600">找学生日常吃的店，气质比网红店更对。</p></div>
            <div className="rounded-2xl bg-sky-50 p-5"><p className="text-3xl">📚</p><h3 className="mt-3 font-black">图书馆</h3><p className="mt-2 text-sm leading-6 text-slate-600">坐一会儿，像本地人一样把时间放慢。</p></div>
            <div className="rounded-2xl bg-amber-50 p-5"><p className="text-3xl">🌄</p><h3 className="mt-3 font-black">水库与蟒山</h3><p className="mt-2 text-sm leading-6 text-slate-600">不追项目，只看山水、风、夕阳。</p></div>
          </div>
        </section>

        <footer className="mt-8 pb-10 text-sm text-slate-500">
          <div className="rounded-[2rem] border border-white/60 bg-white/65 p-5 backdrop-blur">
            <p className="font-bold text-slate-700">资料来源</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {sourceLinks.map((link) => <a key={link.href} className="text-sky-700 hover:underline" href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
            </div>
            <p className="mt-3">页面根据用户提供的周末天气与路线文案整理生成。建议出发前再次确认实时天气、停车与景区开放情况。</p>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default App;
