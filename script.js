const SUPABASE_URL = "https://enpjshkrnvsjjndvsbxa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yrZLgnczeJHQN9gJ3Dkmgw_Jvvf8gEj";

const configured = !SUPABASE_URL.includes("YOUR_") && !SUPABASE_ANON_KEY.includes("YOUR_");
const db = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let shelters = [];
let contactEmail = "nhipcauyeuthuong@gmail.com";
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const escapeHTML = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const categoryName = c => ({food:"Thức ăn",medical:"Y tế",volunteer:"Tình nguyện",supplies:"Vật dụng"}[c] || c);
const pad2 = v => String(v ?? "").trim() || "00";

function setText(id,value){const el=$(id);if(el)el.textContent=value;}

function initTheme(){
  const btn=$("#themeBtn"); if(!btn)return;
  if(localStorage.getItem("theme")==="dark"){document.body.classList.add("dark");btn.textContent="☀"}
  btn.addEventListener("click",()=>{
    document.body.classList.toggle("dark");
    const dark=document.body.classList.contains("dark");
    localStorage.setItem("theme",dark?"dark":"light");
    btn.textContent=dark?"☀":"☾";
  });
}

function initMenu(){
  const btn=$("#menuBtn"),nav=$("#nav"); if(!btn||!nav)return;
  btn.addEventListener("click",()=>nav.classList.toggle("open"));
  $$("#nav a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
}

function initSlider(){
  const slides=$$(".hero-slide"),dots=$$("#sliderDots button"); if(!slides.length)return;
  let current=0,timer=null;
  function show(i){current=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle("active",n===current));dots.forEach((d,n)=>d.classList.toggle("active",n===current));}
  dots.forEach(d=>d.addEventListener("click",()=>{show(Number(d.dataset.slideTo));restart()}));
  function restart(){clearInterval(timer);timer=setInterval(()=>show(current+1),6500)}
  restart();
}

async function loadShelters(){
  if(!db||!$("#shelterCards"))return;
  const {data,error}=await db.from("shelters").select("*").order("created_at",{ascending:false});
  if(error){console.error("Shelters:",error);return}
  shelters=data||[];
  setText("#shelterCount",shelters.length);
  renderShelters();
}

function renderShelters(){
  const wrap=$("#shelterCards"); if(!wrap)return;
  const keyword=($("#searchInput")?.value||"").toLowerCase().trim();
  const category=$("#categoryFilter")?.value||"all";
  const result=shelters.filter(s=>`${s.name} ${s.location} ${s.address||""} ${s.phone||""} ${s.email||""} ${s.website||""} ${s.description||""} ${s.need||""} ${s.category||""}`.toLowerCase().includes(keyword)&&(category==="all"||s.category===category));
  wrap.innerHTML=result.map(s=>`
    <article class="rescue-card">
      <img src="${escapeHTML(s.image||"https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=85")}" alt="${escapeHTML(s.name)}">
      <div class="card-body">
        <span class="tag">${escapeHTML(s.tag||categoryName(s.category))}</span>
        <h3>${escapeHTML(s.name)}</h3>
        <p>📍 ${escapeHTML(s.location)}</p>
        <p>${escapeHTML(s.description||"")}</p>
        <a href="#" class="detail-link" data-id="${s.id}">Xem thông tin →</a>
      </div>
    </article>`).join("")||"<p class='empty'>Chưa có dữ liệu trại cứu hộ.</p>";
  $("#emptyMessage")?.classList.toggle("hidden",result.length!==0);
}

async function loadProjectContent(){
  if(!db||!$("#projectTitle"))return;
  const {data,error}=await db.from("project_content").select("*").eq("id",1).maybeSingle();
  if(error){console.error("Project:",error);return}
  if(!data)return;
  $("#projectTitle").textContent=data.title||"";
  const content=$("#projectContent"); if(content)content.innerHTML=`${data.image?`<img class="content-image project-content-image" src="${escapeHTML(data.image)}" alt="${escapeHTML(data.title||"Hình ảnh dự án")}">`:""}<p>${escapeHTML(data.content||"").replace(/\n/g,"<br>")}</p>`;
  const tags=$("#projectTags"); if(tags)tags.innerHTML=(data.tags||[]).map(t=>`<span>${escapeHTML(t)}</span>`).join("");
}

async function loadJourney(){
  const wrap=$("#journeyList"); if(!db||!wrap)return;
  const {data,error}=await db.from("journey_items").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){console.error("Journey:",error);return}
  wrap.innerHTML=(data||[]).map((x,i)=>`<div>${x.image?`<img class="content-image" src="${escapeHTML(x.image)}" alt="${escapeHTML(x.title||"Hình ảnh hành trình")}">`:""}<div class="journey-body"><b>${escapeHTML(x.number_label||String(i+1).padStart(2,"0"))}</b><h3>${escapeHTML(x.title)}</h3><p>${escapeHTML(x.description||"").replace(/\n/g,"<br>")}</p></div></div>`).join("")||"<p class='empty'>Chưa có dữ liệu hành trình.</p>";
}

async function loadActivities(){
  const wrap=$("#activityList"); if(!db||!wrap)return;
  const {data,error}=await db.from("activities").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){console.error("Activities:",error);return}
  wrap.innerHTML=(data||[]).map((x,i)=>`<article>${x.image?`<img class="content-image activity-image" src="${escapeHTML(x.image)}" alt="${escapeHTML(x.title||"Hình ảnh hoạt động")}">`:""}<span>${escapeHTML(x.number_label||String(i+1).padStart(2,"0"))} ↗</span><h3>${escapeHTML(x.title)}</h3><p>${escapeHTML(x.description||"").replace(/\n/g,"<br>")}</p></article>`).join("")||"<p class='empty'>Chưa có hoạt động.</p>";
}

async function loadTeamMembers(){
  const wrap=$("#teamList"); if(!db||!wrap)return;
  const {data,error}=await db.from("team_members").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){console.error("Team:",error);return}
  wrap.innerHTML=(data||[]).map((x,i)=>{
    const number=String(x.sort_order ?? i+1).padStart(2,"0");
    return `<article class="team-card">
      <div class="team-no">${escapeHTML(number)}</div>
      <div class="team-photo">${x.image?`<img src="${escapeHTML(x.image)}" alt="${escapeHTML(x.name)}">`:`<div style="height:100%;display:grid;place-items:center;font-size:70px">🐾</div>`}</div>
      <div class="team-info"><strong>${escapeHTML(x.name)}</strong><p class="team-role">${escapeHTML(x.role)}</p><p>${escapeHTML(x.bio||"").replace(/\n/g,"<br>")}</p></div>
    </article>`;
  }).join("")||"<p class='empty'>Chưa có thông tin thành viên.</p>";
}

async function loadSupportCount(){
  if(!db)return;
  const {data,error}=await db.rpc("get_public_volunteer_count");
  if(!error)setText("#supportCount",data||0);
}

async function loadContactEmail(){
  if(!db){updateContactEmailUI();return}
  const {data,error}=await db.from("site_settings").select("contact_email").eq("id",1).maybeSingle();
  if(!error&&data?.contact_email)contactEmail=data.contact_email;
  updateContactEmailUI();
}
function updateContactEmailUI(){["#contactEmailLink","#topContactEmail","#footerEmail"].forEach(sel=>{const el=$(sel);if(el)el.textContent=contactEmail});}

async function submitVolunteer(e){
  e.preventDefault();
  const msg=$("#formMessage");
  if(!db){if(msg)msg.textContent="⚠️ Website chưa kết nối Supabase.";return}
  const payload={user_id:null,name:$("#nameInput").value.trim(),email:$("#emailInput").value.trim(),help:$("#helpInput").value,message:$("#messageInput").value.trim()};
  const {error}=await db.from("volunteers").insert(payload);
  if(msg)msg.textContent=error?"Có lỗi: "+error.message:"❤️ Đăng ký thành công! Cảm ơn bạn đã đồng hành.";
  if(!error){e.target.reset();await loadSupportCount();}
}

function initShelterEvents(){
  $("#searchInput")?.addEventListener("input",renderShelters);
  $("#categoryFilter")?.addEventListener("change",renderShelters);
  $("#shelterCards")?.addEventListener("click",e=>{
    const link=e.target.closest(".detail-link");if(!link)return;e.preventDefault();
    const s=shelters.find(x=>x.id===Number(link.dataset.id));if(!s)return;
    const contact=[s.address?`🏠 <strong>Địa chỉ:</strong> ${escapeHTML(s.address)}`:"",s.phone?`📞 <strong>Điện thoại:</strong> ${escapeHTML(s.phone)}`:"",s.email?`📧 <strong>Email:</strong> ${escapeHTML(s.email)}`:"",s.website?`🌐 <strong>Facebook / Website:</strong> ${escapeHTML(s.website)}`:""].filter(Boolean).join("<br>");
    const mc=$("#modalContent");if(mc)mc.innerHTML=`<p class="eyebrow">${escapeHTML(s.tag||categoryName(s.category))}</p><h3>${escapeHTML(s.name)}</h3><p>📍 <strong>Địa điểm:</strong> ${escapeHTML(s.location)}</p><p>${escapeHTML(s.description||"")}</p><p>❤️ <strong>Nhu cầu hiện tại:</strong> ${escapeHTML(s.need||"")}</p>${contact?`<div style="margin-top:18px;padding-top:15px;border-top:1px solid var(--border);line-height:2">${contact}</div>`:"<p style='margin-top:16px'>Chưa có thông tin liên hệ.</p>"}`;
    $("#detailModal")?.classList.remove("hidden");
  });
  $("#closeModal")?.addEventListener("click",()=>$("#detailModal")?.classList.add("hidden"));
  $("#detailModal")?.addEventListener("click",e=>{if(e.target.id==="detailModal")e.currentTarget.classList.add("hidden")});
}

$("#volunteerForm")?.addEventListener("submit",submitVolunteer);
initTheme();initMenu();initSlider();initShelterEvents();
if(db){loadShelters();loadSupportCount();loadContactEmail();loadProjectContent();loadJourney();loadActivities();loadTeamMembers();}
