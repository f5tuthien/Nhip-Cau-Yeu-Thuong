const SUPABASE_URL = "https://enpjshkrnvsjjndvsbxa.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_yrZLgnczeJHQN9gJ3Dkmgw_Jvvf8gEj";
const configured = !SUPABASE_URL.includes("YOUR_") && !SUPABASE_ANON_KEY.includes("YOUR_");
const db = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let shelters=[]; let contactEmail="hello@example.com";
const $=s=>document.querySelector(s);
const escapeHTML=v=>String(v??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const categoryName=c=>({food:"Thức ăn",medical:"Y tế",volunteer:"Tình nguyện",supplies:"Vật dụng"}[c]||c);
function showSetupWarning(){if(!configured) console.warn("Hãy cấu hình Supabase URL và anon key trong script.js.")}
async function loadShelters(){if(!db)return;const {data,error}=await db.from("shelters").select("*").order("created_at",{ascending:false});if(error){console.error(error);return}shelters=data||[];renderShelters();$("#shelterCount").textContent=shelters.length}
function renderShelters(){const keyword=$("#searchInput").value.toLowerCase().trim(),category=$("#categoryFilter").value;const result=shelters.filter(s=>`${s.name} ${s.location} ${s.description} ${s.need} ${s.category}`.toLowerCase().includes(keyword)&&(category==="all"||s.category===category));$("#shelterCards").innerHTML=result.map(s=>`<article class="card"><img src="${escapeHTML(s.image||"https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80")}" alt="${escapeHTML(s.name)}"><div class="card-body"><span class="tag">${escapeHTML(s.tag||categoryName(s.category))}</span><h3>${escapeHTML(s.name)}</h3><p>📍 ${escapeHTML(s.location)}</p><p>${escapeHTML(s.description)}</p><a href="#" class="detail-link" data-id="${s.id}">Xem chi tiết →</a></div></article>`).join("");$("#emptyMessage").classList.toggle("hidden",result.length!==0)}

async function loadProjectContent(){
  if(!db)return;
  const {data,error}=await db.from("project_content").select("*").eq("id",1).maybeSingle();
  if(error){console.error(error);return}
  if(data){
    $("#projectTitle").textContent=data.title||"";
    $("#projectContent").innerHTML=`${data.image?`<img class="content-image project-content-image" src="${escapeHTML(data.image)}" alt="${escapeHTML(data.title||"Hình ảnh dự án")}">`:""}<p>${escapeHTML(data.content||"").replace(/\n/g,"<br>")}</p>`;
    const tags=(data.tags||[]);
    $("#projectTags").innerHTML=tags.map(t=>`<span>${escapeHTML(t)}</span>`).join("");
  }
}
async function loadJourney(){
  if(!db)return;
  const {data,error}=await db.from("journey_items").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){console.error(error);return}
  $("#journeyList").innerHTML=(data||[]).map((x,i)=>`<div>${x.image?`<img class="content-image" src="${escapeHTML(x.image)}" alt="${escapeHTML(x.title||"Hình ảnh hành trình")}">`:""}<b>${escapeHTML(x.number_label||String(i+1).padStart(2,"0"))}</b><h3>${escapeHTML(x.title)}</h3><p>${escapeHTML(x.description||"").replace(/\n/g,"<br>")}</p></div>`).join("")||"<p>Chưa có dữ liệu hành trình.</p>";
}
async function loadActivities(){
  if(!db)return;
  const {data,error}=await db.from("activities").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){console.error(error);return}
  $("#activityList").innerHTML=(data||[]).map((x,i)=>`<article>${x.image?`<img class="content-image activity-image" src="${escapeHTML(x.image)}" alt="${escapeHTML(x.title||"Hình ảnh hoạt động")}">`:""}<span>${escapeHTML(x.number_label||String(i+1).padStart(2,"0"))} ↗</span><h3>${escapeHTML(x.title)}</h3><p>${escapeHTML(x.description||"").replace(/\n/g,"<br>")}</p></article>`).join("")||"<p>Chưa có hoạt động.</p>";
}

async function loadTeamMembers(){
  if(!db)return;
  const {data,error}=await db.from("team_members").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){console.error(error);return}
  $("#teamList").innerHTML=(data||[]).map(x=>`<article class="team-card"><div class="team-avatar">${x.image?`<img src="${escapeHTML(x.image)}" alt="${escapeHTML(x.name)}">`:`🐾`}</div><div><strong>${escapeHTML(x.name)}</strong><p class="team-role">${escapeHTML(x.role)}</p><p>${escapeHTML(x.bio||"").replace(/\n/g,"<br>")}</p></div></article>`).join("")||"<p>Chưa có thông tin thành viên.</p>";
}

async function submitVolunteer(e){e.preventDefault();if(!db){$("#formMessage").textContent="⚠️ Website chưa kết nối Supabase.";return}const payload={user_id:null,name:$("#nameInput").value.trim(),email:$("#emailInput").value.trim(),help:$("#helpInput").value,message:$("#messageInput").value.trim()};const {error}=await db.from("volunteers").insert(payload);$("#formMessage").textContent=error?"Có lỗi: "+error.message:"❤️ Đăng ký thành công! Cảm ơn bạn đã đồng hành.";if(!error){e.target.reset();await loadSupportCount()}}
async function loadSupportCount(){if(!db)return;const {data,error}=await db.rpc("get_public_volunteer_count");if(!error)$("#supportCount").textContent=data||0}
async function loadContactEmail(){if(!db)return;const {data,error}=await db.from("site_settings").select("contact_email").eq("id",1).maybeSingle();if(!error&&data?.contact_email)contactEmail=data.contact_email;updateContactEmailUI()}
function updateContactEmailUI(){if($("#contactEmailLink"))$("#contactEmailLink").href=`mailto:${contactEmail}`}
$("#searchInput").addEventListener("input",renderShelters);$("#categoryFilter").addEventListener("change",renderShelters);
$("#themeBtn").addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("theme",document.body.classList.contains("dark")?"dark":"light");$("#themeBtn").textContent=document.body.classList.contains("dark")?"☀":"☾"});
$("#menuBtn").addEventListener("click",()=>$("#nav").classList.toggle("open"));
$("#volunteerForm").addEventListener("submit",submitVolunteer);
$("#shelterCards").addEventListener("click",e=>{const link=e.target.closest(".detail-link");if(!link)return;e.preventDefault();const s=shelters.find(x=>x.id===Number(link.dataset.id));if(!s)return;$("#modalContent").innerHTML=`<p class="eyebrow">${escapeHTML(s.tag||categoryName(s.category))}</p><h3>${escapeHTML(s.name)}</h3><p>📍 <strong>Địa điểm:</strong> ${escapeHTML(s.location)}</p><p>${escapeHTML(s.description)}</p><p>❤️ <strong>Nhu cầu hiện tại:</strong> ${escapeHTML(s.need)}</p>`;$("#detailModal").classList.remove("hidden")});
$("#closeModal").addEventListener("click",()=>$("#detailModal").classList.add("hidden"));$("#detailModal").addEventListener("click",e=>{if(e.target.id==="detailModal")$("#detailModal").classList.add("hidden")});
if(localStorage.getItem("theme")==="dark"){$("body").classList.add("dark");$("#themeBtn").textContent="☀"}
if(db){loadShelters();loadSupportCount();loadContactEmail();loadProjectContent();loadJourney();loadActivities();loadTeamMembers()}else showSetupWarning();
