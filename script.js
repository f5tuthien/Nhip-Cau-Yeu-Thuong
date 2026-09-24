const SUPABASE_URL = "https://enpjshkrnvsjjndvsbxa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yrZLgnczeJHQN9gJ3Dkmgw_Jvvf8gEj";
const configured = !SUPABASE_URL.includes("YOUR_") && !SUPABASE_ANON_KEY.includes("YOUR_");
const db = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let shelters = [];
let contactEmail = "nhipcauyeuthuong@gmail.com";

const $ = s => document.querySelector(s);
const escapeHTML = v => String(v ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[c]));

const categoryName = c => ({
  food:"Thức ăn", medical:"Y tế", volunteer:"Tình nguyện", supplies:"Vật dụng"
}[c] || c);

function showSetupWarning(){
  if(!configured) console.warn("Hãy cấu hình Supabase URL và anon key trong script.js.");
}

async function loadShelters(){
  if(!db || !$("#shelterCards")) return;
  const {data,error} = await db.from("shelters").select("*").order("created_at",{ascending:false});
  if(error){ console.error(error); return; }
  shelters = data || [];
  renderShelters();
  if($("#shelterCount")) $("#shelterCount").textContent = shelters.length;
}

function renderShelters(){
  if(!$("#shelterCards")) return;
  const keyword = ($("#searchInput")?.value || "").toLowerCase().trim();
  const category = $("#categoryFilter")?.value || "all";
  const result = shelters.filter(s =>
    `${s.name} ${s.location} ${s.description} ${s.need} ${s.category} ${s.address||""} ${s.phone||""} ${s.email||""} ${s.website||""}`
      .toLowerCase().includes(keyword) &&
    (category === "all" || s.category === category)
  );

  $("#shelterCards").innerHTML = result.map(s => `
    <article class="card">
      <img src="${escapeHTML(s.image || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80")}" alt="${escapeHTML(s.name)}">
      <div class="card-body">
        <span class="tag">${escapeHTML(s.tag || categoryName(s.category))}</span>
        <h3>${escapeHTML(s.name)}</h3>
        <p>📍 ${escapeHTML(s.location)}</p>
        <p>${escapeHTML(s.description)}</p>
        <a href="#" class="detail-link" data-id="${s.id}">Xem chi tiết →</a>
      </div>
    </article>
  `).join("");

  if($("#emptyMessage")) $("#emptyMessage").classList.toggle("hidden", result.length !== 0);
}

async function loadProjectContent(){
  if(!db || !$("#projectTitle")) return;
  const {data,error} = await db.from("project_content").select("*").eq("id",1).maybeSingle();
  if(error){ console.error(error); return; }
  if(data){
    $("#projectTitle").textContent = data.title || "";
    if($("#projectContent")){
      $("#projectContent").innerHTML =
        `${data.image ? `<img class="content-image project-content-image" src="${escapeHTML(data.image)}" alt="${escapeHTML(data.title || "Hình ảnh dự án")}">` : ""}
         <p>${escapeHTML(data.content || "").replace(/
/g,"<br>")}</p>`;
    }
    if($("#projectTags")){
      $("#projectTags").innerHTML = (data.tags || []).map(t => `<span>${escapeHTML(t)}</span>`).join("");
    }
  }
}

async function loadJourney(){
  if(!db || !$("#journeyList")) return;
  const {data,error} = await db.from("journey_items").select("*")
    .order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){ console.error(error); return; }
  $("#journeyList").innerHTML = (data || []).map((x,i) => `
    <div>
      ${x.image ? `<img class="content-image" src="${escapeHTML(x.image)}" alt="${escapeHTML(x.title || "Hình ảnh hành trình")}">` : ""}
      <b>${escapeHTML(x.number_label || String(i+1).padStart(2,"0"))}</b>
      <h3>${escapeHTML(x.title)}</h3>
      <p>${escapeHTML(x.description || "").replace(/
/g,"<br>")}</p>
    </div>
  `).join("") || "<p>Chưa có dữ liệu hành trình.</p>";
}

async function loadActivities(){
  if(!db || !$("#activityList")) return;
  const {data,error} = await db.from("activities").select("*")
    .order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){ console.error(error); return; }
  $("#activityList").innerHTML = (data || []).map((x,i) => `
    <article>
      ${x.image ? `<img class="content-image activity-image" src="${escapeHTML(x.image)}" alt="${escapeHTML(x.title || "Hình ảnh hoạt động")}">` : ""}
      <span>${escapeHTML(x.number_label || String(i+1).padStart(2,"0"))} ↗</span>
      <h3>${escapeHTML(x.title)}</h3>
      <p>${escapeHTML(x.description || "").replace(/
/g,"<br>")}</p>
    </article>
  `).join("") || "<p>Chưa có hoạt động.</p>";
}

async function loadTeamMembers(){
  if(!db || !$("#teamList")) return;
  const {data,error} = await db.from("team_members").select("*")
    .order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){ console.error(error); return; }
  $("#teamList").innerHTML = (data || []).map(x => `
    <article class="team-card">
      <div class="team-avatar">${x.image ? `<img src="${escapeHTML(x.image)}" alt="${escapeHTML(x.name)}">` : "🐾"}</div>
      <div>
        <strong>${escapeHTML(x.name)}</strong>
        <p class="team-role">${escapeHTML(x.role)}</p>
        <p>${escapeHTML(x.bio || "").replace(/
/g,"<br>")}</p>
      </div>
    </article>
  `).join("") || "<p>Chưa có thông tin thành viên.</p>";
}

async function submitVolunteer(e){
  e.preventDefault();
  if(!db){ if($("#formMessage")) $("#formMessage").textContent="⚠️ Website chưa kết nối Supabase."; return; }
  const payload = {
    user_id:null,
    name:$("#nameInput").value.trim(),
    email:$("#emailInput").value.trim(),
    help:$("#helpInput").value,
    message:$("#messageInput").value.trim()
  };
  const {error} = await db.from("volunteers").insert(payload);
  if($("#formMessage")){
    $("#formMessage").textContent = error
      ? "Có lỗi: " + error.message
      : "❤️ Đăng ký thành công! Cảm ơn bạn đã đồng hành.";
  }
  if(!error){ e.target.reset(); await loadSupportCount(); }
}

async function loadSupportCount(){
  if(!db || !$("#supportCount")) return;
  const {data,error} = await db.rpc("get_public_volunteer_count");
  if(!error) $("#supportCount").textContent = data || 0;
}

async function loadContactEmail(){
  if(!db) return;
  const {data,error} = await db.from("site_settings").select("contact_email").eq("id",1).maybeSingle();
  if(!error && data?.contact_email) contactEmail = data.contact_email;
  updateContactEmailUI();
}

function updateContactEmailUI(){
  const el = $("#contactEmailLink");
  if(!el) return;
  el.textContent = contactEmail;
  el.removeAttribute("href");
}

function initTheme(){
  if(!$("#themeBtn")) return;
  $("#themeBtn").addEventListener("click",()=>{
    document.body.classList.toggle("dark");
    localStorage.setItem("theme",document.body.classList.contains("dark") ? "dark" : "light");
    $("#themeBtn").textContent = document.body.classList.contains("dark") ? "☀" : "☾";
  });
  if(localStorage.getItem("theme")==="dark"){
    document.body.classList.add("dark");
    $("#themeBtn").textContent="☀";
  }
}

function initMenu(){
  if($("#menuBtn") && $("#nav")){
    $("#menuBtn").addEventListener("click",()=>$("#nav").classList.toggle("open"));
  }
}

function initShelterEvents(){
  if($("#searchInput")) $("#searchInput").addEventListener("input",renderShelters);
  if($("#categoryFilter")) $("#categoryFilter").addEventListener("change",renderShelters);

  if($("#shelterCards")){
    $("#shelterCards").addEventListener("click",e=>{
      const link = e.target.closest(".detail-link");
      if(!link) return;
      e.preventDefault();
      const s = shelters.find(x => x.id === Number(link.dataset.id));
      if(!s || !$("#modalContent") || !$("#detailModal")) return;

      $("#modalContent").innerHTML = `
        <p class="eyebrow">${escapeHTML(s.tag || categoryName(s.category))}</p>
        <h3>${escapeHTML(s.name)}</h3>
        <p>📍 <strong>Địa điểm:</strong> ${escapeHTML(s.location)}</p>
        <p>${escapeHTML(s.description)}</p>
        <p>❤️ <strong>Nhu cầu hiện tại:</strong> ${escapeHTML(s.need)}</p>
        ${s.address ? `<p>🏠 <strong>Địa chỉ:</strong> ${escapeHTML(s.address)}</p>` : ""}
        ${s.phone ? `<p>📞 <strong>Điện thoại:</strong> ${escapeHTML(s.phone)}</p>` : ""}
        ${s.email ? `<p>📧 <strong>Email:</strong> ${escapeHTML(s.email)}</p>` : ""}
        ${s.website ? `<p>🌐 <strong>Facebook/Website:</strong> ${escapeHTML(s.website)}</p>` : ""}
      `;
      $("#detailModal").classList.remove("hidden");
    });
  }

  if($("#closeModal") && $("#detailModal")){
    $("#closeModal").addEventListener("click",()=>$("#detailModal").classList.add("hidden"));
    $("#detailModal").addEventListener("click",e=>{
      if(e.target.id==="detailModal") $("#detailModal").classList.add("hidden");
    });
  }
}

if($("#volunteerForm")) $("#volunteerForm").addEventListener("submit",submitVolunteer);

initTheme();
initMenu();
initShelterEvents();

if(db){
  loadShelters();
  loadSupportCount();
  loadContactEmail();
  loadProjectContent();
  loadJourney();
  loadActivities();
  loadTeamMembers();
}else{
  showSetupWarning();
}
