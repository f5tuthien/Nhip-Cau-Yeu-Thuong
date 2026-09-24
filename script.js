const SUPABASE_URL = "https://enpjshkrnvsjjndvsbxa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yrZLgnczeJHQN9gJ3Dkmgw_Jvvf8gEj";

const configured = !SUPABASE_URL.includes("YOUR_") && !SUPABASE_ANON_KEY.includes("YOUR_");
const db = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let shelters = [];
let contactEmail = "nhipcauyeuthuong@gmail.com";

const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
}[char]));
const categoryName = category => ({
  food:"Thức ăn", medical:"Y tế", volunteer:"Tình nguyện", supplies:"Vật dụng"
}[category] || category || "");

function showSetupWarning(){
  if(!configured) console.warn("Hãy cấu hình Supabase URL và anon key trong script.js.");
}

function setText(selector, value){
  const el = $(selector);
  if(el) el.textContent = value;
}

function initTheme(){
  const themeBtn = $("#themeBtn");
  if(!themeBtn) return;

  const apply = () => {
    const dark = document.body.classList.contains("dark");
    themeBtn.textContent = dark ? "☀" : "☾";
    themeBtn.setAttribute("aria-label", dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
  };

  const saved = localStorage.getItem("theme");
  if(saved === "dark") document.body.classList.add("dark");
  if(saved === "light") document.body.classList.remove("dark");

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    apply();
  });

  apply();
}

function initMenu(){
  const menuBtn = $("#menuBtn");
  const nav = $("#nav");
  if(!menuBtn || !nav) return;
  menuBtn.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));
}

async function loadShelters(){
  if(!db || !$("#shelterCards")) return;
  const {data,error} = await db.from("shelters").select("*").order("created_at", {ascending:false});
  if(error){ console.error("Shelters:", error); return; }
  shelters = data || [];
  renderShelters();
  setText("#shelterCount", shelters.length);
}

function renderShelters(){
  const cards = $("#shelterCards");
  if(!cards) return;
  const keyword = ($( "#searchInput")?.value || "").toLowerCase().trim();
  const category = $("#categoryFilter")?.value || "all";
  const result = shelters.filter(s => {
    const searchable = `${s.name||""} ${s.location||""} ${s.address||""} ${s.phone||""} ${s.email||""} ${s.website||""} ${s.description||""} ${s.need||""} ${s.category||""}`.toLowerCase();
    return searchable.includes(keyword) && (category === "all" || s.category === category);
  });

  cards.innerHTML = result.map(s => `
    <article class="shelter-card">
      <img src="${escapeHTML(s.image || "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1000&q=85")}" alt="${escapeHTML(s.name)}">
      <div class="shelter-body">
        <span class="tag">${escapeHTML(s.tag || categoryName(s.category))}</span>
        <h3>${escapeHTML(s.name)}</h3>
        <p class="shelter-location">📍 ${escapeHTML(s.location)}</p>
        <p class="shelter-desc">${escapeHTML(s.description)}</p>
        <a href="#" class="detail-link" data-id="${s.id}">Xem chi tiết →</a>
      </div>
    </article>
  `).join("");

  $("#emptyMessage")?.classList.toggle("hidden", result.length !== 0);
}

async function loadProjectContent(){
  if(!db || !$("#projectTitle")) return;
  const {data,error} = await db.from("project_content").select("*").eq("id",1).maybeSingle();
  if(error){ console.error("Project:", error); return; }
  if(!data) return;
  setText("#projectTitle", data.title || "");
  const content = $("#projectContent");
  if(content){
    content.innerHTML = `${data.image ? `<img class="content-image" src="${escapeHTML(data.image)}" alt="${escapeHTML(data.title || "Hình ảnh dự án")}">` : ""}<p>${escapeHTML(data.content || "").replace(/\n/g,"<br>")}</p>`;
  }
  const tags = $("#projectTags");
  if(tags) tags.innerHTML = (data.tags || []).map(tag => `<span>${escapeHTML(tag)}</span>`).join("");
}

async function loadActivities(){
  if(!db || !$("#activityList")) return;
  const {data,error} = await db.from("activities").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){ console.error("Activities:", error); return; }
  $("#activityList").innerHTML = (data || []).map((item,index) => `
    <article class="activity-card">
      ${item.image ? `<img class="card-image" src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title || "Hoạt động")}">` : `<div class="card-image" style="background:var(--surface-2)"></div>`}
      <div class="card-copy">
        <span class="num">${escapeHTML(item.number_label || String(index+1).padStart(2,"0"))}</span>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.description || "").replace(/\n/g,"<br>")}</p>
      </div>
    </article>
  `).join("") || `<p>Chưa có hoạt động.</p>`;
}

async function loadJourney(){
  if(!db || !$("#journeyList")) return;
  const {data,error} = await db.from("journey_items").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){ console.error("Journey:", error); return; }
  $("#journeyList").innerHTML = (data || []).map((item,index) => `
    <article class="journey-card">
      ${item.image ? `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title || "Hành trình")}">` : ""}
      <span class="journey-num">${escapeHTML(item.number_label || String(index+1).padStart(2,"0"))}</span>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.description || "").replace(/\n/g,"<br>")}</p>
    </article>
  `).join("") || `<p>Chưa có dữ liệu hành trình.</p>`;
}

async function loadTeamMembers(){
  if(!db || !$("#teamList")) return;
  const {data,error} = await db.from("team_members").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){ console.error("Team:", error); return; }
  $("#teamList").innerHTML = (data || []).map((item,index) => `
    <article class="team-card">
      <div class="team-card-top">
        <div class="team-index">${String(index+1).padStart(2,"0")}</div>
        <div class="team-avatar">${item.image ? `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}">` : "🐾"}</div>
      </div>
      <div class="team-info">
        <strong>${escapeHTML(item.name)}</strong>
        <p class="team-role">${escapeHTML(item.role)}</p>
        <p>${escapeHTML(item.bio || "").replace(/\n/g,"<br>")}</p>
      </div>
    </article>
  `).join("") || `<p>Chưa có thông tin thành viên.</p>`;
}

async function loadSupportCount(){
  if(!db || !$("#supportCount")) return;
  const {data,error} = await db.rpc("get_public_volunteer_count");
  if(!error) setText("#supportCount", data || 0);
}

async function loadContactEmail(){
  if(!$("#contactEmailLink")) return;
  if(db){
    const {data,error} = await db.from("site_settings").select("contact_email").eq("id",1).maybeSingle();
    if(!error && data?.contact_email) contactEmail = data.contact_email;
  }
  setText("#contactEmailLink", contactEmail);
  $("#contactEmailLink")?.removeAttribute("href");
}

async function submitVolunteer(event){
  event.preventDefault();
  const message = $("#formMessage");
  if(!db){ if(message) message.textContent = "⚠️ Website chưa kết nối Supabase."; return; }
  const payload = {
    user_id:null,
    name:$("#nameInput")?.value.trim() || "",
    email:$("#emailInput")?.value.trim() || "",
    help:$("#helpInput")?.value || "",
    message:$("#messageInput")?.value.trim() || ""
  };
  const {error} = await db.from("volunteers").insert(payload);
  if(message) message.textContent = error ? `Có lỗi: ${error.message}` : "❤️ Đăng ký thành công! Cảm ơn bạn đã đồng hành.";
  if(!error){ event.target.reset(); await loadSupportCount(); }
}

function initShelterInteractions(){
  $("#searchInput")?.addEventListener("input", renderShelters);
  $("#categoryFilter")?.addEventListener("change", renderShelters);
  $("#shelterCards")?.addEventListener("click", event => {
    const link = event.target.closest(".detail-link");
    if(!link) return;
    event.preventDefault();
    const shelter = shelters.find(item => item.id === Number(link.dataset.id));
    if(!shelter || !$("#modalContent") || !$("#detailModal")) return;
    $("#modalContent").innerHTML = `
      <p class="eyebrow">${escapeHTML(shelter.tag || categoryName(shelter.category))}</p>
      <h3>${escapeHTML(shelter.name)}</h3>
      <p>📍 <strong>Địa điểm:</strong> ${escapeHTML(shelter.location)}</p>
      <p>${escapeHTML(shelter.description)}</p>
      <p>❤️ <strong>Nhu cầu hiện tại:</strong> ${escapeHTML(shelter.need)}</p>
      ${(shelter.address || shelter.phone || shelter.email || shelter.website) ? `
        <div class="shelter-contact">
          <h4>📞 Thông tin liên hệ</h4>
          ${shelter.address ? `<p>🏠 <strong>Địa chỉ:</strong> ${escapeHTML(shelter.address)}</p>` : ""}
          ${shelter.phone ? `<p>📞 <strong>Số điện thoại:</strong> ${escapeHTML(shelter.phone)}</p>` : ""}
          ${shelter.email ? `<p>📧 <strong>Email:</strong> ${escapeHTML(shelter.email)}</p>` : ""}
          ${shelter.website ? `<p>🌐 <strong>Facebook / Website:</strong> ${escapeHTML(shelter.website)}</p>` : ""}
        </div>` : ""}
    `;
    $("#detailModal").classList.remove("hidden");
    $("#detailModal").setAttribute("aria-hidden","false");
  });

  const closeModal = () => { $("#detailModal")?.classList.add("hidden"); $("#detailModal")?.setAttribute("aria-hidden","true"); };
  $("#closeModal")?.addEventListener("click", closeModal);
  $("#detailModal")?.addEventListener("click", event => { if(event.target.id === "detailModal") closeModal(); });
}

if($("#volunteerForm")) $("#volunteerForm").addEventListener("submit", submitVolunteer);
initTheme();
initMenu();
initShelterInteractions();

if(db){
  loadShelters();
  loadSupportCount();
  loadContactEmail();
  loadProjectContent();
  loadActivities();
  loadJourney();
  loadTeamMembers();
}else{
  showSetupWarning();
}
