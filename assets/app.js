const STORAGE_KEY = "peigen-nexus-state";
const THEME_KEY = "peigen-nexus-theme";
const ACCENT_KEY = "peigen-nexus-accent";
const CUSTOM_ACCENT_KEY = "peigen-nexus-custom-accent";
const BACKUP_APP = "Peigen Nexus";
const BACKUP_SCHEMA_VERSION = 1;
const CONFIG_API = "/api/config";
const STATE_API = "/api/state";
const EXPORT_API = "/api/export";
const hasBrowser = typeof window !== "undefined" && typeof document !== "undefined";

function storageGet(key) {
  if (!hasBrowser) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  if (!hasBrowser) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
}

const accentPresets = {
  appleBlue: { primary: "#007aff", primaryStrong: "#0057b8", accent: "#5ac8fa", label: "系统蓝" },
  applePurple: { primary: "#af52de", primaryStrong: "#7e2fb0", accent: "#5856d6", label: "系统紫" },
  applePink: { primary: "#ff2d55", primaryStrong: "#c9183e", accent: "#ff9f0a", label: "系统粉" },
  appleRed: { primary: "#ff3b30", primaryStrong: "#c82118", accent: "#ff9500", label: "系统红" },
  appleOrange: { primary: "#ff9500", primaryStrong: "#b86a00", accent: "#ffcc00", label: "系统橙" },
  appleYellow: { primary: "#f5b700", primaryStrong: "#a97800", accent: "#34c759", label: "系统黄" },
  appleGreen: { primary: "#34c759", primaryStrong: "#248a3d", accent: "#30d158", label: "系统绿" },
  appleTeal: { primary: "#5ac8fa", primaryStrong: "#1683ad", accent: "#64d2ff", label: "系统青" },
};

const makeId = () => {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const seedState = {
  strategy: {
    want: "打造一个能长期支持个人成长、职业机会和商业合作的连接系统。",
    serve: "服务那些与 AI 产品、社群运营、投资研究、个人品牌相关的关键人群。",
    need: "他们需要可信的信息、靠谱的连接、真实的一线反馈和长期互相支持的关系。",
    change: "因为我的连接和持续增值，他们能更快获得机会、资源、判断和合作伙伴。",
  },
  people: [
    {
      id: makeId(),
      name: "张辰",
      role: "前同事",
      title: "AI 产品负责人",
      household: "江苏南京",
      residence: "上海",
      industry: "AI",
      ecosystem: "工作相关",
      tier: "密友",
      influence: "强",
      closeness: "中",
      meetRecord: "2025 年行业活动后持续交流，适合保持每周轻互动。",
      family: "暂未补充。",
      traits: "判断快，重视一线反馈和落地节奏。",
      work: "关注 AI Agent 落地、产品增长和企业客户转化。",
      hobbies: "科技产品、行业活动。",
      details: "对高质量案例和模型应用团队很敏感。",
      inspiration: "做连接时要带着清晰判断，而不是只转发资料。",
      lastInteraction: addDays(-7),
    },
    {
      id: makeId(),
      name: "林悦",
      role: "活动认识",
      title: "社区运营",
      household: "浙江杭州",
      residence: "杭州",
      industry: "社群",
      ecosystem: "社区",
      tier: "好友",
      influence: "中",
      closeness: "中",
      meetRecord: "线下活动认识，擅长组织社群活动，适合月度联系。",
      family: "暂未补充。",
      traits: "组织感强，重视参与感和现场温度。",
      work: "线下活动、内容选题和社群长期参与感。",
      hobbies: "城市活动、内容策划。",
      details: "适合推荐活动嘉宾和内容选题。",
      inspiration: "社群不是流量池，而是让成员有表达和互助空间。",
      lastInteraction: addDays(-28),
    },
    {
      id: makeId(),
      name: "周行",
      role: "朋友介绍",
      title: "投资经理",
      household: "北京",
      residence: "北京",
      industry: "金融",
      ecosystem: "金融",
      tier: "普通",
      influence: "强",
      closeness: "疏",
      meetRecord: "朋友介绍认识，需要先做背景研究，再发起高质量接触。",
      family: "暂未补充。",
      traits: "理性，关注事实和趋势证据。",
      work: "早期项目、行业研究和跨界创业者。",
      hobbies: "行业研究、创业项目观察。",
      details: "适合提供 AI 产品观察和项目一线反馈。",
      inspiration: "接触高影响力人物前，需要先准备可交换的价值。",
      lastInteraction: addDays(-62),
    },
  ],
  tasks: [],
};

seedState.tasks = [
  {
    id: makeId(),
    personId: seedState.people[0].id,
    type: "分享",
    title: "把最新的 AI 产品资料发给张辰，并附上自己的判断。",
    dueDate: todayISO(),
    status: "pending",
  },
  {
    id: makeId(),
    personId: seedState.people[1].id,
    type: "推荐",
    title: "给林悦推荐一个适合她社群的活动嘉宾。",
    dueDate: addDays(2),
    status: "pending",
  },
  {
    id: makeId(),
    personId: seedState.people[2].id,
    type: "24 小时跟进",
    title: "补记上次沟通，并判断是否进入黄金圈候选。",
    dueDate: addDays(-2),
    status: "pending",
  },
];

const viewTitles = {
  dashboard: "关系资产总览",
  strategy: "关系战略定位",
  why: "方法论总览",
  archive: "人脉档案库",
  circle: "155 黄金圈",
  actions: "关系维护队列",
  playbook: "执行路径",
};

const viewGroups = {
  dashboard: {
    views: ["dashboard"],
    tabs: [],
  },
  workspace: {
    views: ["strategy", "archive", "circle", "actions"],
    tabs: [
      ["strategy", "战略定位"],
      ["archive", "人脉档案"],
      ["circle", "155 黄金圈"],
      ["actions", "维护行动"],
    ],
  },
  method: {
    views: ["why", "playbook"],
    tabs: [
      ["why", "方法总览"],
      ["playbook", "执行路径"],
    ],
  },
};

const tierLimits = {
  命友: 5,
  密友: 50,
  好友: 100,
};

const courseSteps = [
  {
    title: "建立关系战略定位",
    summary: "明确长期方向、关键服务对象、对方需求缺口，以及你能够稳定交付的价值。",
    outputs: ["长期方向", "关键对象", "价值承诺"],
    details: ["用四步追问法写清楚方向：我想做什么、服务谁、对方真正缺什么、我能带来什么改变。", "后续所有筛选、触达和维护动作，都应该服务于这个定位。"],
  },
  {
    title: "完成关系资产盘点",
    summary: "建立结构化档案，识别关系来源、地域分布、行业覆盖与可重新激活的存量关系。",
    outputs: ["生态覆盖", "关系分布", "激活线索"],
    details: ["先不要急着判断关系价值，先把已认识的人结构化记录下来。", "重点观察哪些生态圈过度集中，哪些关键领域缺少连接。"],
  },
  {
    title: "建立 155 黄金圈结构",
    summary: "按命友、密友、好友区分投入优先级，为不同圈层配置稳定维护频率。",
    outputs: ["核心层", "密切层", "常规层"],
    details: ["命友是最高优先级关系，数量很少，需要持续在场。", "密友和好友不是身份标签，而是用于分配时间、精力和维护频率的管理层级。"],
  },
  {
    title: "建立全息背景卡",
    summary: "记录对方是谁、关注什么、在乎什么、正在经历什么、共享什么、下一步如何连接。",
    outputs: ["关注点", "共享背景", "下一步连接"],
    details: ["全息背景不是简历，而是帮助你理解对方处境、偏好、重要事件和长期目标。", "下次维护关系时，可以基于这些细节提供更准确的关心和价值。"],
  },
  {
    title: "建立关系维护动作库",
    summary: "将欣赏、分享、陪伴、推荐、支持、保护转化为可安排、可跟进的维护动作。",
    outputs: ["欣赏", "分享", "陪伴", "推荐", "支持", "保护"],
    details: ["表达认可时要具体到对方的能力、选择或价值观，不是泛泛夸奖。", "提供信息、资源或帮助时，要围绕对方当下的真实需求，而不是为了刷存在感。"],
  },
  {
    title: "设计关键人物触达",
    summary: "在触达前明确身份说明、具体认可点和可交换价值，并设计连续接触机会。",
    outputs: ["关键人物", "触达叙事", "连续接触"],
    details: ["触达不是直接索取，而是先说明你是谁、为什么关注对方、你能提供什么具体价值。", "一次接触通常不够，需要设计第二次、第三次自然出现的机会。"],
  },
  {
    title: "第一次见面留下积极印象",
    summary: "找到需求点，贡献价值，把目标放入更大背景，24 小时内再次联系。",
    outputs: ["感谢交流", "补充资源", "下次邀请"],
    details: ["见面时优先识别对方的需求点，并提供一个可感知的小价值。", "24 小时内跟进不是客套，而是补充资源、确认联系方式并推进下一次连接。"],
  },
  {
    title: "学会优雅求助",
    summary: "找成熟时机，用巧妙提问唤起指导欲，从小忙开始，并给对方退路。",
    outputs: ["告而不求", "分步实现", "方便对方"],
    details: ["先把你的处境、目标和已做努力说清楚，让对方知道你不是把问题丢给他；表达希望获得建议，而不是直接要求对方替你解决。", "不要一上来请求大资源，先从一个建议、一次判断、一个小信息开始，让对方低成本参与。", "给出明确选项、时间范围和退出空间，例如“如果不方便也完全没关系”，降低对方心理压力。"],
  },
  {
    title: "利用场景杠杆扩展网络",
    summary: "通过会议、活动和社群提升触达效率，并以会后跟进沉淀长期关系。",
    outputs: ["会前", "会中", "会后"],
    details: ["提前明确要见谁、为什么见、准备什么问题，而不是到现场随机社交。", "活动结束后 24 小时内把信息沉淀到档案，并安排下一次自然联系。"],
  },
  {
    title: "维护圈层健康度",
    summary: "定期复盘关系质量，降低耗能关系占比，持续引入有温度、有见识的新连接。",
    outputs: ["边界管理", "质量筛选", "周期复盘"],
    details: ["关系系统需要动态更新，不是只进不出。", "对长期消耗、价值观不匹配或无法互相支持的关系，要降低投入强度。"],
  },
  {
    title: "形成连接者能力",
    summary: "在引荐前确认双方意愿，提供可信背书，并对连接结果进行持续跟进。",
    outputs: ["可信背书", "双方确认", "进展反馈"],
    details: ["引荐前先分别确认双方是否愿意见，避免把人情压力转嫁给别人。", "引荐后要跟进进展，因为真正的连接者承担的是信任和结果，而不是转发名片。"],
  },
];

const whySections = [
  {
    id: "overview",
    nav: "总览",
    eyebrow: "Overview",
    title: "方法论总览",
    lead: "Peigen Nexus 的核心定位，是帮助个人把关系从零散记忆转化为可盘点、可维护、可复盘、可拓展的关系资产系统。",
    cards: [
      { title: "战略先行", text: "以长期方向和价值主张决定应进入的圈层和应维护的关系。" },
      { title: "持续增值", text: "以信息、资源、判断、支持和引荐持续提升关系质量。" },
      { title: "网络放大", text: "通过跨圈连接让人物、资源、信息与机会产生组合价值。" },
    ],
  },
  {
    id: "core",
    nav: "核心观点",
    eyebrow: "Core Ideas",
    title: "核心观点",
    items: [
      "人脉不是利用别人，而是连接价值；真正有效的人脉，是持续、可信、互利的连接。",
      "人脉力会创造机会和运气；很多关键机会来自一次引荐、一次对话、一次帮助。",
      "关系战略决定网络方向；先明确长期方向、服务对象和可交付价值，再决定拓展对象。",
      "人脉需要管理，而不是靠记忆；基础工具是人脉归档表和全息背景卡。",
      "信任是长期关系的核心，来自交往长度、互动频度和交流深度。",
      "高质量关系来自持续增值，需要明确自己能为对方解决的问题。",
      "社交效率靠场景杠杆，会议、社群、线下聚会能快速扩展连接面。",
      "人脉圈不是越大越好，而是要动态更新，留下赋能型关系。",
      "最高级玩法是串联，填补结构洞，形成带信用担保的铁三角关系。",
    ],
  },
  {
    id: "concepts",
    nav: "必要概念",
    eyebrow: "Concepts",
    title: "必要概念",
    cards: [
      { title: "人脉力", text: "建立人际网络、运用非正式关系、提升社会资本、创造机会和运气的能力。" },
      { title: "社会资本", text: "通过关系网络调动资源、信息、影响力、信任和机会的能力。" },
      { title: "四步追问法", text: "你想做什么、你为谁而做、他们需要什么、因为你他们有什么改变。" },
      { title: "人脉归档表", text: "用于盘点已有关系，记录姓名、角色、职业、户籍、居住地、行业、影响力和亲密程度。" },
      { title: "155 黄金人脉圈", text: "命友 5 人、密友 50 人、好友 100 人，按不同频率重点维护。" },
      { title: "全息背景卡", text: "记录爱好、家庭、重要日期、第一次见面、共同认识的人和对方目标。" },
      { title: "六个动作", text: "欣赏、分享、陪伴、推荐、支持、保护，用来建立终生有效关系。" },
      { title: "优雅求助", text: "先说明背景、目标和已做努力，再请求建议或小范围支持；重点是降低对方成本，而不是把问题直接转交给对方。" },
      { title: "告而不求", text: "把你的处境清楚告知对方，让对方理解你正在解决什么问题；不直接索取资源，而是邀请对方给判断、建议或方向。" },
      { title: "分步实现", text: "把大请求拆成小动作，例如先请教一个判断、确认一个方向、推荐一个信息源，再逐步推进更深合作。" },
      { title: "给对方退路", text: "在请求中明确表达“不方便也没关系”，让对方可以体面拒绝，关系不会因为一次请求而产生压力。" },
      { title: "结构洞与串联者", text: "不同圈子之间往往存在信息断层。能连接两个原本不相连圈子的人，会创造新的信息、机会和合作空间。" },
      { title: "铁三角关系", text: "高质量引荐不是转发名片，而是引荐人、被引荐人、目标对象三方都知道背景、意愿和下一步。" },
    ],
  },
  {
    id: "steps",
    nav: "执行路径",
    eyebrow: "Operating System",
    title: "标准执行路径",
    steps: courseSteps,
  },
  {
    id: "relations",
    nav: "概念关联",
    eyebrow: "Connections",
    title: "概念之间的关联",
    items: [
      "目标决定人脉方向：没有目标，就无法判断该认识谁、进入什么圈子、维护或淘汰哪些关系。",
      "价值决定别人为什么愿意认识你：明确目标之后，才能回答我是谁和我能提供什么价值。",
      "盘点决定资源感：归档表让你看到，人脉不是没有，而是没有被看见、分类、激活。",
      "信任决定弱连接能否变强连接：持续互动、精准关心、真实支持会加厚信任。",
      "效率场景决定扩张速度：一对一深耕决定质量，会议和社群决定数量与扩张速度。",
      "更新机制决定系统健康：只加不减会让人脉系统失真、耗能、失焦。",
      "串联决定价值跃迁：让你的人脉和别人的人脉发生化学反应，从单点价值变成网络价值。",
    ],
  },
  {
    id: "scenarios",
    nav: "适用场景",
    eyebrow: "Use Cases",
    title: "课程方法可以用在哪些方面",
    cards: [
      { title: "职业发展", text: "求职内推、转行迁移、争取导师、建立跨部门影响力。" },
      { title: "创业与商业合作", text: "找客户、投资人、合作伙伴、顾问和关键资源方。" },
      { title: "销售、咨询、培训、自媒体", text: "找到目标客户，建立长期信任，提升复购和转介绍。" },
      { title: "个人品牌建设", text: "明确标签，让别人记住的不只是名字，而是价值定位。" },
      { title: "社群运营与组织建设", text: "搭建高质量社群，提升成员粘性，形成互助网络。" },
      { title: "个人生活", text: "维护长久友谊，认识新朋友，处理圈层更替，建立健康边界。" },
    ],
  },
  {
    id: "life",
    nav: "生活关联",
    eyebrow: "Life Links",
    title: "与生活其他方面的关联",
    items: [
      "与时间管理有关：有限时间要优先配置给高价值关系。",
      "与职业规划有关：你想去哪里，就要知道谁已经在那里，谁能带你过去。",
      "与个人成长有关：成长速度很大程度取决于长期接触的人际环境。",
      "与情绪管理有关：会不会求助、被拒绝后如何反应、遇到耗能关系能否止损。",
      "与品牌经营有关：对外标签、声誉、可信度，本质上也是一种品牌。",
      "与家庭和亲密关系有关：细节取胜、持续陪伴、精准欣赏、情感支持和保护感同样适用。",
    ],
  },
  {
    id: "principles",
    nav: "12 条原则",
    eyebrow: "Principles",
    title: "最值得记住的 12 条原则",
    ordered: [
      "先有目标，再做人脉。",
      "先有价值，再谈连接。",
      "人脉不是名单，而是网络。",
      "信任比认识更重要。",
      "细节会把普通关系升级成重要关系。",
      "真正有效的社交，是持续给别人带来价值。",
      "求助不是低人一等，而是合作能力。",
      "一对一深耕，会议和社群放大。",
      "人脉圈要动态更新，不要只进不出。",
      "新朋友看两点：有温度，有见识。",
      "高手不是认识更多人，而是更会连接人。",
      "串联不同圈子，才会产生最大的新价值。",
    ],
  },
  {
    id: "checklist",
    nav: "落地清单",
    eyebrow: "Execution",
    title: "一份可直接执行的落地清单",
    cards: [
      { title: "今天就做", text: "写出当前阶段人生目标；建立人脉归档表，先录入 30 到 50 人；圈出最值得维护的 10 人。" },
      { title: "本周完成", text: "给 10 人补全背景信息；找出 3 人主动提供一次价值；找回 2 个被忽略但值得重新联系的人。" },
      { title: "本月完成", text: "初步圈出 155 黄金圈；主动联系 1 位目标人物；参加 1 场会议或活动；建立或加入 1 个长期社群。" },
      { title: "持续做", text: "每周维护密友层，每月维护好友层，每季度复盘归档表，每年更新黄金圈，每周做一次有意识的串联。" },
    ],
  },
  {
    id: "conclusion",
    nav: "最终结论",
    eyebrow: "Conclusion",
    title: "最终结论",
    lead: "这套课程真正要解决的问题，不是怎样结交贵人，而是怎样先成为一个有方向、有价值、值得被信任，并能放大别人价值也放大自己价值的人。",
    quote: "目标清晰 -> 价值明确 -> 关系盘点 -> 分层维护 -> 主动增值 -> 高效扩展 -> 动态更新 -> 跨圈串联。",
  },
];

let state = loadState();
let activeView = "dashboard";
let archiveInitialSnapshot = "";
let archiveSavingFromPrompt = false;
let archiveLayout = storageGet("peigen-nexus-archive-layout") || "card";
let pendingServerSave = Promise.resolve();
let storageMode = "local";
let supabaseClient = null;
let currentUser = null;

function normalizeState(parsed) {
  const strategy = {
    want: parsed.strategy?.want || seedState.strategy.want,
    serve: parsed.strategy?.serve || seedState.strategy.serve,
    need: parsed.strategy?.need || seedState.strategy.need,
    change: parsed.strategy?.change || seedState.strategy.change,
  };

  const people = Array.isArray(parsed.people)
    ? parsed.people
    : Array.isArray(parsed.contacts)
      ? parsed.contacts.map((contact) => ({
          id: contact.id || makeId(),
          name: contact.name || "",
          role: contact.role || contact.source || "",
          title: contact.title || "",
          household: contact.household || "",
          residence: contact.residence || contact.city || "",
          industry: contact.industry || "",
          ecosystem: contact.ecosystem || contact.industry || "工作相关",
          tier: contact.tier || "普通",
          influence: normalizeInfluence(contact.influence),
          closeness: normalizeCloseness(contact.closeness),
          meetRecord: contact.meetRecord || contact.source || contact.notes || "",
          family: contact.family || "",
          traits: contact.traits || "",
          work: contact.work || contact.focus || "",
          hobbies: contact.hobbies || "",
          details: contact.details || contact.value || "",
          inspiration: contact.inspiration || "",
          lastInteraction: contact.lastInteraction || todayISO(),
        }))
      : seedState.people;

  people.forEach((person) => {
    person.role = person.role || person.source || "";
    person.household = person.household || "";
    person.residence = person.residence || person.city || "";
    person.industry = person.industry || "";
    person.ecosystem = person.ecosystem || person.industry || "工作相关";
    person.influence = normalizeInfluence(person.influence);
    person.closeness = normalizeCloseness(person.closeness);
    person.meetRecord = person.meetRecord || person.source || person.notes || "";
    person.family = person.family || "";
    person.traits = person.traits || "";
    person.work = person.work || person.focus || "";
    person.hobbies = person.hobbies || "";
    person.details = person.details || person.value || "";
    person.inspiration = person.inspiration || "";
  });

  const tasks = Array.isArray(parsed.tasks)
    ? parsed.tasks.map((task) => ({
        ...task,
        personId: task.personId || task.contactId,
      }))
    : seedState.tasks;

  return { strategy, people, tasks };
}

function normalizeInfluence(value) {
  if (value === "高") return "强";
  if (["弱", "中", "强"].includes(value)) return value;
  return "弱";
}

function normalizeCloseness(value) {
  if (value === "高") return "密";
  if (["疏", "中", "密"].includes(value)) return value;
  return "疏";
}

function loadState() {
  const saved = storageGet(STORAGE_KEY) || storageGet("networking-management-mvp");
  if (!saved) return seedState;

  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return seedState;
  }
}

function saveState() {
  storageSet(STORAGE_KEY, JSON.stringify(state));
  queueDataSave();
}

function createBackupPayload() {
  return {
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: normalizeState(state),
    settings: {
      theme: storageGet(THEME_KEY) || "light",
      accent: storageGet(ACCENT_KEY) || "appleBlue",
      customAccent: storageGet(CUSTOM_ACCENT_KEY) || "#155eef",
      archiveLayout,
    },
  };
}

function readBackupPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid backup file");
  }

  const data = payload.data && typeof payload.data === "object" ? payload.data : payload;
  const importedState = normalizeState(data);
  if (!Array.isArray(importedState.people) || !Array.isArray(importedState.tasks)) {
    throw new Error("Invalid backup data");
  }

  return {
    state: importedState,
    settings: payload.data ? payload.settings || {} : {},
  };
}

function applyImportedSettings(settings = {}) {
  if (settings.theme) storageSet(THEME_KEY, settings.theme);
  if (settings.accent) storageSet(ACCENT_KEY, settings.accent);
  if (settings.customAccent) storageSet(CUSTOM_ACCENT_KEY, settings.customAccent);
  if (settings.archiveLayout) {
    archiveLayout = settings.archiveLayout;
    storageSet("peigen-nexus-archive-layout", archiveLayout);
  }
  initTheme();
  initAccent();
}

async function loadStateFromServer() {
  const response = await fetch(STATE_API, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load state file");
  const payload = await response.json();
  const imported = readBackupPayload(payload);
  state = imported.state;
  storageSet(STORAGE_KEY, JSON.stringify(state));
  applyImportedSettings(imported.settings);
  if (payload.data === null) await saveStateToServer();
}

async function saveStateToServer() {
  const response = await fetch(STATE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createBackupPayload(), null, 2),
  });
  if (!response.ok) throw new Error("Unable to save state file");
}

function queueServerSave() {
  pendingServerSave = pendingServerSave
    .then(saveStateToServer)
    .catch((error) => {
      console.error(error);
      showToast("本地数据文件保存失败，请确认本地服务正在运行");
    });
}

async function initStorage() {
  try {
    const response = await fetch(CONFIG_API, { cache: "no-store" });
    const config = response.ok ? await response.json() : {};
    const canUseSupabase = config.supabaseUrl && config.supabaseAnonKey && window.supabase?.createClient;
    if (!canUseSupabase) {
      storageMode = "local";
      await loadStateFromServer();
      updateAuthUi();
      return;
    }

    storageMode = "cloud";
    supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    const { data } = await supabaseClient.auth.getSession();
    currentUser = data.session?.user || null;
    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      currentUser = session?.user || null;
      updateAuthUi();
      if (currentUser) {
        await loadStateFromCloud();
        render();
      }
    });
    updateAuthUi();
    if (currentUser) {
      await loadStateFromCloud();
    } else {
      openAuthDialog();
    }
  } catch (error) {
    console.error(error);
    storageMode = "local";
    await loadStateFromServer();
    updateAuthUi();
  }
}

async function loadStateFromCloud() {
  if (!supabaseClient || !currentUser) return;
  const { data, error } = await supabaseClient
    .from("app_states")
    .select("payload")
    .eq("user_id", currentUser.id)
    .maybeSingle();
  if (error) throw error;

  if (data?.payload) {
    const imported = readBackupPayload(data.payload);
    state = imported.state;
    storageSet(STORAGE_KEY, JSON.stringify(state));
    applyImportedSettings(imported.settings);
    return;
  }

  await saveStateToCloud();
}

async function saveStateToCloud() {
  if (!supabaseClient || !currentUser) return;
  const { error } = await supabaseClient
    .from("app_states")
    .upsert({
      user_id: currentUser.id,
      payload: createBackupPayload(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  if (error) throw error;
}

function queueDataSave() {
  if (storageMode === "cloud") {
    pendingServerSave = pendingServerSave
      .then(saveStateToCloud)
      .catch((error) => {
        console.error(error);
        showToast("云端保存失败，请稍后重试");
      });
    return;
  }
  queueServerSave();
}

function downloadBackupFile() {
  const backup = createBackupPayload();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `peigen-nexus-data-${todayISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function personById(id) {
  return state.people.find((person) => person.id === id);
}

function daysSince(dateString) {
  if (!dateString) return Infinity;
  const start = new Date(dateString);
  const now = new Date(todayISO());
  return Math.floor((now - start) / 86400000);
}

function isOverdue(task) {
  return task.status === "pending" && task.dueDate < todayISO();
}

function statusForTask(task) {
  if (task.status === "done") return "已完成";
  if (isOverdue(task)) return "已逾期";
  if (task.dueDate === todayISO()) return "今天";
  return "待处理";
}

function tierClass(tier) {
  if (tier === "命友" || tier === "密友") return "primary";
  if (tier === "好友") return "success";
  return "";
}

function taskClass(task) {
  if (task.status === "done") return "success";
  if (isOverdue(task)) return "danger";
  if (task.dueDate === todayISO()) return "warning";
  return "";
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function updateAuthUi() {
  const button = document.querySelector("#authStatusBtn");
  if (!button) return;
  if (storageMode !== "cloud") {
    button.textContent = "本地模式";
    button.disabled = true;
    return;
  }
  button.disabled = false;
  button.textContent = currentUser?.email || "登录";
}

function openAuthDialog() {
  if (storageMode !== "cloud") return;
  document.querySelector("#authError").textContent = "";
  document.querySelector("#authDialog").showModal();
  document.querySelector("#authEmail").focus();
}

function requireCloudUser() {
  if (storageMode !== "cloud" || currentUser) return true;
  openAuthDialog();
  showToast("请先登录后再继续操作");
  return false;
}

async function signIn() {
  const email = document.querySelector("#authEmail").value.trim();
  const password = document.querySelector("#authPassword").value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  document.querySelector("#authDialog").close();
  showToast("登录成功");
}

async function signUp() {
  const email = document.querySelector("#authEmail").value.trim();
  const password = document.querySelector("#authPassword").value;
  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) throw error;
  document.querySelector("#authDialog").close();
  showToast("注册成功，请按提示完成邮箱确认");
}

async function signOut() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  currentUser = null;
  updateAuthUi();
  openAuthDialog();
}

function groupForView(view) {
  return Object.entries(viewGroups).find(([, group]) => group.views.includes(view))?.[0] || "dashboard";
}

function renderSectionTabs(view) {
  const group = viewGroups[groupForView(view)];
  const tabs = group.tabs || [];
  const tabsNode = document.querySelector("#sectionTabs");
  tabsNode.innerHTML = tabs.map(([tabView, label]) => `
    <button class="section-tab ${tabView === view ? "is-active" : ""}" type="button" data-section-tab="${tabView}">
      ${label}
    </button>
  `).join("");
  tabsNode.classList.toggle("is-hidden", !tabs.length);
}

function showConfirm({
  title = "确认操作",
  message = "",
  confirmText = "确认",
  cancelText = "取消",
  tone = "default",
} = {}) {
  const dialog = document.querySelector("#confirmDialog");
  document.querySelector("#confirmEyebrow").textContent = tone === "danger" ? "Danger" : "Confirm";
  document.querySelector("#confirmTitle").textContent = title;
  document.querySelector("#confirmMessage").textContent = message;
  document.querySelector("#confirmOkBtn").textContent = confirmText;
  document.querySelector("#confirmCancelBtn").textContent = cancelText;
  document.querySelector("#confirmOkBtn").classList.toggle("danger-button", tone === "danger");

  return new Promise((resolve) => {
    const okButton = document.querySelector("#confirmOkBtn");
    const cancelButton = document.querySelector("#confirmCancelBtn");

    const cleanup = () => {
      okButton.onclick = null;
      cancelButton.onclick = null;
      dialog.onclick = null;
      dialog.oncancel = null;
    };

    okButton.onclick = () => {
      cleanup();
      dialog.close();
      resolve(true);
    };
    cancelButton.onclick = () => {
      cleanup();
      dialog.close();
      resolve(false);
    };
    dialog.onclick = (event) => {
      if (event.target !== dialog) return;
      cleanup();
      dialog.close();
      resolve(false);
    };
    dialog.oncancel = (event) => {
      event.preventDefault();
      cleanup();
      dialog.close();
      resolve(false);
    };

    dialog.showModal();
    cancelButton.focus();
  });
}

function setView(view) {
  activeView = view;
  document.querySelector("#viewTitle").textContent = viewTitles[view];
  renderSectionTabs(view);
  document.querySelectorAll(".view").forEach((node) => {
    node.classList.toggle("is-visible", node.id === `${view}View`);
  });
  const activeGroup = groupForView(view);
  document.querySelectorAll(".nav-item").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.navGroup === activeGroup);
  });
  render();
}

function metric(label, value, hint) {
  return `
    <article class="metric-card">
      <p class="eyebrow">${label}</p>
      <strong>${value}</strong>
      <span>${hint}</span>
    </article>
  `;
}

function renderDashboard() {
  const pending = state.tasks.filter((task) => task.status === "pending").length;
  const overdue = state.tasks.filter(isOverdue).length;
  const golden = state.people.filter((person) => person.tier !== "普通").length;
  const stale = state.people.filter((person) => daysSince(person.lastInteraction) > 45).length;

  document.querySelector("#metricGrid").innerHTML = [
    metric("战略定位", strategyCompletion(), "核心方向完整度"),
    metric("人脉档案", state.people.length, "已归档对象"),
    metric("155 黄金圈", golden, "已纳入成员"),
    metric("维护行动", pending, "待处理事项"),
  ].join("");

  document.querySelector("#workflowProgress").innerHTML = renderWorkflowProgress(overdue + stale);
  document.querySelector("#circleOverview").innerHTML = renderCircleOverview();
  document.querySelector("#systemSignals").innerHTML = renderSystemSignals({ overdue, stale, pending, golden });

  const todayTasks = state.tasks
    .filter((task) => task.status === "pending")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);
  document.querySelector("#todayActions").innerHTML = todayTasks.length
    ? todayTasks.map(renderTaskCard).join("")
    : `<div class="empty-state">当前没有待处理事项。可根据 155 黄金圈维护频率创建下一次维护行动。</div>`;

  document.querySelector("#archiveHealth").innerHTML = buildArchiveInsights();
}

function renderCircleOverview() {
  return Object.entries(tierLimits).map(([tier, limit]) => {
    const count = state.people.filter((person) => person.tier === tier).length;
    const width = Math.min(100, Math.round((count / limit) * 100));
    return `
      <div class="circle-overview-row">
        <strong>${tier}</strong>
        <div class="tier-meter"><span style="width:${width}%"></span></div>
        <span class="muted">${count}/${limit}</span>
      </div>
    `;
  }).join("");
}

function renderSystemSignals({ overdue, stale, pending, golden }) {
  const missingArchive = state.people.filter((person) => !person.meetRecord || !person.work || !person.details || !person.inspiration).length;
  const signals = [
    {
      title: overdue ? "处理逾期行动" : "行动节奏正常",
      text: overdue ? `当前有 ${overdue} 个维护行动已逾期，建议优先处理。` : `当前待处理行动 ${pending} 个，未发现逾期事项。`,
      view: "actions",
    },
    {
      title: missingArchive ? "补全关键背景" : "档案质量稳定",
      text: missingArchive ? `${missingArchive} 份人脉档案缺少全息背景信息，会影响后续维护判断。` : "当前人脉档案的关键背景信息较完整。",
      view: "archive",
    },
    {
      title: golden ? "复盘 155 黄金圈" : "建立黄金圈",
      text: golden ? `已有 ${golden} 人进入 155 黄金圈，可继续按命友、密友、好友维护。` : "尚未建立黄金圈成员，建议先从高影响力或高亲密程度对象开始。",
      view: "circle",
    },
    {
      title: stale ? "激活沉默关系" : "关系活跃度正常",
      text: stale ? `${stale} 位人脉超过 45 天未互动，可安排低负担维护。` : "近期没有明显长期沉默的人脉。",
      view: "actions",
    },
  ];

  return signals.map((signal) => `
    <div class="task-card">
      <div class="task-top">
        <h4>${signal.title}</h4>
        <button class="text-button" type="button" data-view-jump="${signal.view}">查看</button>
      </div>
      <div class="muted">${signal.text}</div>
    </div>
  `).join("");
}

function strategyCompletion() {
  const values = [state.strategy.want, state.strategy.serve, state.strategy.need, state.strategy.change];
  return `${values.filter((value) => value && value.trim()).length}/4`;
}

function renderWorkflowProgress(reviewCount) {
  const completed = [
    Boolean(state.strategy.want && state.strategy.serve && state.strategy.need && state.strategy.change),
    state.people.length > 0,
    state.people.some((person) => person.tier !== "普通"),
    state.tasks.length > 0,
  ];

  const labels = ["战略定位", "人脉档案", "155 黄金圈", "维护行动"];
  return `
    <section class="workflow-strip">
      ${labels.map((label, index) => `
        <button class="workflow-pill ${completed[index] ? "is-done" : ""}" type="button" data-view-jump="${workflowTarget(index)}">
          <span>${String(index + 1).padStart(2, "0")}</span>${label}
        </button>
      `).join("")}
    </section>
  `;
}

function workflowTarget(index) {
  return ["strategy", "archive", "circle", "actions"][index];
}

function buildArchiveInsights() {
  const incomplete = state.people.filter((person) => !person.meetRecord || !person.work || !person.details || !person.inspiration);
  const warmNames = state.people.filter((person) => daysSince(person.lastInteraction) > 30).slice(0, 3);
  const ecosystemCount = new Set(state.people.map((person) => person.ecosystem)).size;

  return [
    `<div class="task-card"><h4>生态覆盖</h4><div class="muted">当前覆盖 ${ecosystemCount}/6 个生态圈。建议持续补齐工作相关、金融、媒体、社区等关键节点。</div></div>`,
    `<div class="task-card"><h4>档案完整度</h4><div class="muted">${incomplete.length} 张档案仍需补充相识记录、工作、特殊细节或启发信息。</div></div>`,
    warmNames.length
      ? `<div class="task-card"><h4>待激活关系</h4><div class="muted">${warmNames.map((person) => escapeHtml(person.name)).join("、")} 已超过 30 天未互动，建议安排一次低负担维护。</div></div>`
      : `<div class="task-card"><h4>待激活关系</h4><div class="muted">近期维护节奏正常，暂无明显沉默关系。</div></div>`,
  ].join("");
}

function renderStrategy() {
  document.querySelector("#strategyWant").value = state.strategy.want || "";
  document.querySelector("#strategyServe").value = state.strategy.serve || "";
  document.querySelector("#strategyNeed").value = state.strategy.need || "";
  document.querySelector("#strategyChange").value = state.strategy.change || "";

  const output = [
    {
      title: "长期方向",
      text: state.strategy.want || "明确当前阶段最重要的事业或成长方向。",
    },
    {
      title: "关键服务对象",
      text: state.strategy.serve || "定义最值得长期服务、协作或影响的人群。",
    },
    {
      title: "核心需求缺口",
      text: state.strategy.need || "识别对方真实缺口、约束、压力与机会。",
    },
    {
      title: "可交付价值",
      text: state.strategy.change || "描述你能够稳定提供的判断、资源、支持或连接。",
    },
  ];

  document.querySelector("#strategyOutput").innerHTML = output.map((item) => `
    <div class="task-card">
      <h4>${item.title}</h4>
      <div class="muted">${escapeHtml(item.text)}</div>
    </div>
  `).join("");
}

function renderWhy() {
  document.querySelector("#whyToc").innerHTML = whySections.map((section) => `
    <a href="#why-${section.id}">${section.nav}</a>
  `).join("");

  document.querySelector("#whyContent").innerHTML = whySections.map(renderWhySection).join("");
}

function renderStepOutputs(step) {
  if (!step.outputs?.length || (step.details?.length && step.outputs.length === step.details.length)) return "";
  return `<div class="chip-row">${step.outputs.map((item) => `<span class="chip">${item}</span>`).join("")}</div>`;
}

function renderStepDetails(step) {
  if (!step.details?.length) return "";
  const paired = step.outputs?.length === step.details.length;
  return `<ul class="timeline-detail-list">${step.details.map((item, index) => {
    const label = paired ? `<strong>${step.outputs[index]}：</strong>` : "";
    return `<li>${label}${item}</li>`;
  }).join("")}</ul>`;
}

function renderWhySection(section) {
  const body = [
    section.lead ? `<p class="knowledge-lead">${section.lead}</p>` : "",
    section.quote ? `<div class="knowledge-quote">${section.quote}</div>` : "",
    section.items ? `<ul class="knowledge-list">${section.items.map((item) => `<li>${item}</li>`).join("")}</ul>` : "",
    section.ordered ? `<ol class="principle-list">${section.ordered.map((item) => `<li>${item}</li>`).join("")}</ol>` : "",
    section.cards ? `<div class="knowledge-card-grid">${section.cards.map((card) => `
      <div class="knowledge-card">
        <h4>${card.title}</h4>
        <p>${card.text}</p>
      </div>
    `).join("")}</div>` : "",
    section.steps ? `<div class="knowledge-timeline">${section.steps.map((step, index) => `
      <div class="timeline-item">
        <div class="timeline-index">${String(index + 1).padStart(2, "0")}</div>
        <div>
          <h4>${step.title}</h4>
          <p>${step.summary}</p>
          ${renderStepOutputs(step)}
          ${renderStepDetails(step)}
        </div>
      </div>
    `).join("")}</div>` : "",
  ].join("");

  return `
    <section id="why-${section.id}" class="knowledge-section">
      <p class="eyebrow">${section.eyebrow}</p>
      <h3>${section.title}</h3>
      ${body}
    </section>
  `;
}

function renderArchive() {
  const keyword = document.querySelector("#searchInput").value.trim().toLowerCase();
  const tier = document.querySelector("#tierFilter").value;
  const ecosystem = document.querySelector("#ecosystemFilter").value;
  const people = state.people.filter((person) => {
    const haystack = [
      person.name,
      person.role,
      person.title,
      person.household,
      person.residence,
      person.industry,
      person.ecosystem,
      person.meetRecord,
      person.family,
      person.traits,
      person.work,
      person.hobbies,
      person.details,
      person.inspiration,
    ]
      .join(" ")
      .toLowerCase();
    return (tier === "all" || person.tier === tier)
      && (ecosystem === "all" || person.ecosystem === ecosystem)
      && (!keyword || haystack.includes(keyword));
  });

  document.querySelector("#archiveGrid").innerHTML = people.length
    ? people.map(renderArchiveCard).join("")
    : `<div class="empty-state">未找到匹配档案。请调整筛选条件，或新增一条人脉档案。</div>`;
  document.querySelector("#archiveGrid").classList.toggle("is-list", archiveLayout === "list");
  document.querySelectorAll("[data-archive-layout]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.archiveLayout === archiveLayout);
  });
  bindArchiveCardActions();
}

function bindArchiveCardActions() {
  document.querySelectorAll("[data-view-person]").forEach((card) => {
    card.onclick = (event) => {
      if (event.target.closest("button")) return;
      openProfileDialog(card.dataset.viewPerson);
    };
    card.onkeydown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.target.closest("button")) return;
      event.preventDefault();
      openProfileDialog(card.dataset.viewPerson);
    };
  });

  document.querySelectorAll("[data-edit-person]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const profileDialog = document.querySelector("#profileDialog");
      if (profileDialog?.open) profileDialog.close();
      openArchiveDialog(button.dataset.editPerson);
    };
  });

  document.querySelectorAll("[data-delete-person]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      deletePerson(button.dataset.deletePerson);
    };
  });
}

function renderArchiveCard(person) {
  return `
    <article class="archive-card is-clickable" data-view-person="${person.id}" tabindex="0" role="button" aria-label="查看${escapeHtml(person.name)}的全息背景">
      <div class="archive-top">
        <div>
          <h3>${escapeHtml(person.name)}</h3>
          <div class="archive-meta">${escapeHtml(person.role || "未填写角色")} · ${escapeHtml(person.title || "未填写职业")}</div>
        </div>
        <span class="chip ${tierClass(person.tier)}">${person.tier}</span>
      </div>
      <div class="chip-row">
        <span class="chip">户籍 ${escapeHtml(person.household || "未填写")}</span>
        <span class="chip">居住地 ${escapeHtml(person.residence || "未填写")}</span>
        <span class="chip">行业 ${escapeHtml(person.industry || "未填写")}</span>
        <span class="chip">影响力 ${person.influence}</span>
        <span class="chip">亲密程度 ${person.closeness}</span>
      </div>
      <p class="muted">${escapeHtml(person.meetRecord || person.work || "点击查看全息背景")}</p>
      <div class="card-actions">
        <button class="mini-button primary" type="button" data-edit-person="${person.id}">编辑</button>
        <button class="mini-button danger" type="button" data-delete-person="${person.id}">删除</button>
      </div>
    </article>
  `;
}

function renderCircle() {
  const tiers = ["命友", "密友", "好友"];
  document.querySelector("#circleBoard").innerHTML = tiers.map((tier) => {
    const people = state.people.filter((person) => person.tier === tier);
    const available = state.people.filter((person) => person.tier !== tier);
    const limit = tierLimits[tier];
    return `
      <section class="panel circle-column">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${tierFrequency(tier)}</p>
            <h3>${tier} <span class="muted">${people.length}/${limit}</span></h3>
          </div>
        </div>
        <div class="circle-add-row">
          <select aria-label="选择要加入${tier}的人脉" data-circle-select="${tier}">
            <option value="">选择人脉加入${tier}</option>
            ${available.map((person) => `<option value="${person.id}">${escapeHtml(person.name)} · ${escapeHtml(person.title || "未填写职业")}</option>`).join("")}
          </select>
          <button class="mini-button primary" type="button" data-add-to-tier="${tier}">添加</button>
        </div>
        <div class="circle-list">
          ${people.length ? people.map((person) => renderCirclePerson(person)).join("") : `<div class="empty-state">当前暂无${tier}成员。</div>`}
        </div>
      </section>
    `;
  }).join("");
  bindCircleActions();
}

function renderCirclePerson(person) {
  return `
    <article class="circle-person" data-view-person="${person.id}" tabindex="0" role="button" aria-label="查看${escapeHtml(person.name)}的全息背景">
      <div>
        <strong>${escapeHtml(person.name)}</strong>
        <div class="muted">${escapeHtml(person.role || "未填写角色")} · ${escapeHtml(person.title || "未填写职业")}</div>
      </div>
      <button class="mini-button" type="button" data-set-tier="${person.id}:普通">移出</button>
    </article>
  `;
}

function bindCircleActions() {
  document.querySelectorAll("[data-add-to-tier]").forEach((button) => {
    button.onclick = () => {
      const tier = button.dataset.addToTier;
      const select = document.querySelector(`[data-circle-select="${tier}"]`);
      const person = personById(select.value);
      if (!person) return;
      person.tier = tier;
      saveState();
      render();
      showToast(`已加入${tier}`);
    };
  });
  document.querySelectorAll(".circle-person").forEach((card) => {
    card.onclick = (event) => {
      if (event.target.closest("button")) return;
      openProfileDialog(card.dataset.viewPerson);
    };
  });
}

function scorePerson(person) {
  const influence = { 强: 3, 中: 2, 弱: 1 }[person.influence] || 0;
  const closeness = { 密: 3, 中: 2, 疏: 1 }[person.closeness] || 0;
  return influence + closeness;
}

function tierFrequency(tier) {
  return {
    命友: "5 人上限",
    密友: "50 人上限",
    好友: "100 人上限",
  }[tier];
}

function renderActions() {
  renderQuickActions();
  const columns = [
    ["overdue", "已逾期", (task) => isOverdue(task)],
    ["pending", "待处理", (task) => task.status === "pending" && !isOverdue(task)],
    ["done", "已完成", (task) => task.status === "done"],
  ];

  document.querySelector("#kanban").innerHTML = columns.map(([, title, predicate]) => {
    const tasks = state.tasks.filter(predicate).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return `
      <section class="kanban-column">
        <h3>${title}</h3>
        <div class="task-list">
          ${tasks.length ? tasks.map(renderTaskCard).join("") : `<div class="empty-state">当前无${title}事项。</div>`}
        </div>
      </section>
    `;
  }).join("");
}

function renderQuickActions() {
  const templates = [
    ["欣赏", "给出一次具体、真实、贴合对方优势的正向反馈。"],
    ["分享", "分享一条对对方有价值的信息、资源或判断。"],
    ["陪伴", "围绕共同主题进行一次低压力互动。"],
    ["推荐", "推荐一个人、机会、内容、体验或工具。"],
    ["支持", "提供策略、资讯、资源或情绪支持。"],
    ["保护", "在关键场景中表达立场、兜底或背书。"],
    ["24 小时跟进", "在见面或交流后补充资料、感谢并约定下一步。"],
    ["引荐", "先确认双方意愿，再完成带背景说明的连接。"],
  ];
  document.querySelector("#quickActionGrid").innerHTML = templates.map(([type, text]) => `
    <button class="quick-action" type="button" data-open-task-type="${type}">
      <strong>${type}</strong>
      <span>${text}</span>
    </button>
  `).join("");
}

function renderTaskCard(task) {
  const person = personById(task.personId);
  return `
    <article class="task-card">
      <div class="task-top">
        <div>
          <h4>${escapeHtml(person?.name || "未知归档")}</h4>
          <div class="muted">${escapeHtml(task.title)}</div>
        </div>
        <span class="chip ${taskClass(task)}">${statusForTask(task)}</span>
      </div>
      <div class="chip-row">
        <span class="chip">${escapeHtml(task.type)}</span>
        <span class="chip">计划 ${task.dueDate}</span>
      </div>
      <div class="task-actions">
        ${task.status === "done" ? "" : `<button class="mini-button primary" type="button" data-complete-task="${task.id}">完成</button>`}
        <button class="mini-button" type="button" data-postpone-task="${task.id}">顺延 3 天</button>
        <button class="mini-button danger" type="button" data-delete-task="${task.id}">删除</button>
      </div>
    </article>
  `;
}

function renderPlaybook() {
  document.querySelector("#playbookList").innerHTML = courseSteps.map((step, index) => `
    <article class="playbook-card">
      <div class="playbook-index">${String(index + 1).padStart(2, "0")}</div>
      <div>
        <h3>${step.title}</h3>
        <p class="muted">${step.summary}</p>
        ${renderStepOutputs(step)}
        ${renderStepDetails(step)}
      </div>
    </article>
  `).join("");
}

function renderTaskPersonOptions(selectedId = "") {
  document.querySelector("#taskPerson").innerHTML = state.people.map((person) => `
    <option value="${person.id}" ${person.id === selectedId ? "selected" : ""}>${escapeHtml(person.name)}</option>
  `).join("");
}

function openArchiveDialog(id) {
  const person = id ? personById(id) : null;
  document.querySelector("#archiveDialogTitle").textContent = person ? "编辑人脉档案" : "新增人脉档案";
  document.querySelector("#personId").value = person?.id || "";
  ["name", "role", "title", "household", "residence", "industry", "ecosystem", "tier", "influence", "closeness", "meetRecord", "family", "traits", "work", "hobbies", "details", "inspiration"].forEach((field) => {
    const fallback = field === "ecosystem" ? "工作相关" : field === "tier" ? "普通" : field === "influence" ? "弱" : field === "closeness" ? "疏" : "";
    document.querySelector(`#${field}`).value = person?.[field] || fallback;
  });
  document.querySelector("#archiveError").textContent = "";
  archiveInitialSnapshot = getArchiveFormSnapshot();
  document.querySelector("#archiveDialog").showModal();
  document.querySelector("#name").focus();
}

function getArchiveFormData() {
  return {
    id: document.querySelector("#personId").value,
    name: document.querySelector("#name").value.trim(),
    role: document.querySelector("#role").value.trim(),
    title: document.querySelector("#title").value.trim(),
    household: document.querySelector("#household").value.trim(),
    residence: document.querySelector("#residence").value.trim(),
    industry: document.querySelector("#industry").value.trim(),
    ecosystem: document.querySelector("#ecosystem").value,
    tier: document.querySelector("#tier").value,
    influence: document.querySelector("#influence").value,
    closeness: document.querySelector("#closeness").value,
    meetRecord: document.querySelector("#meetRecord").value.trim(),
    family: document.querySelector("#family").value.trim(),
    traits: document.querySelector("#traits").value.trim(),
    work: document.querySelector("#work").value.trim(),
    hobbies: document.querySelector("#hobbies").value.trim(),
    details: document.querySelector("#details").value.trim(),
    inspiration: document.querySelector("#inspiration").value.trim(),
  };
}

function getArchiveFormSnapshot() {
  return JSON.stringify(getArchiveFormData());
}

function isArchiveFormDirty() {
  return getArchiveFormSnapshot() !== archiveInitialSnapshot;
}

function saveArchiveForm() {
  const data = getArchiveFormData();
  if (!data.name) {
    document.querySelector("#archiveError").textContent = "请填写姓名。";
    document.querySelector("#name").focus();
    return false;
  }

  const id = data.id || makeId();
  const existing = personById(id);
  const payload = {
    ...data,
    id,
    lastInteraction: existing?.lastInteraction || todayISO(),
  };

  if (existing) {
    Object.assign(existing, payload);
  } else {
    state.people.unshift(payload);
  }

  saveState();
  archiveInitialSnapshot = JSON.stringify({ ...data, id });
  render();
  showToast(existing ? "人脉档案已更新" : "人脉档案已新增");
  return true;
}

async function requestCloseArchiveDialog() {
  const dialog = document.querySelector("#archiveDialog");
  if (!isArchiveFormDirty()) {
    dialog.close();
    return;
  }

  const shouldSave = await showConfirm({
    title: "保存这次修改吗？",
    message: "当前人脉档案有未保存的修改。选择保存会先写入当前内容再关闭；选择不保存会直接关闭。",
    confirmText: "保存并关闭",
    cancelText: "不保存",
  });

  if (shouldSave) {
    archiveSavingFromPrompt = true;
    const saved = saveArchiveForm();
    archiveSavingFromPrompt = false;
    if (!saved) return;
  }

  dialog.close();
}

function openProfileDialog(id) {
  const person = personById(id);
  if (!person) return;
  document.querySelector("#profileTitle").textContent = `${person.name} · 全息背景`;
  document.querySelector("#profileContent").innerHTML = `
    <div class="profile-summary">
      <div>
        <p class="eyebrow">Archive</p>
        <h4>${escapeHtml(person.name)}</h4>
        <div class="archive-meta">${escapeHtml(person.role || "未填写角色")} · ${escapeHtml(person.title || "未填写职业")}</div>
      </div>
      <span class="chip ${tierClass(person.tier)}">${person.tier}</span>
    </div>
    <div class="chip-row">
      <span class="chip">户籍 ${escapeHtml(person.household || "未填写")}</span>
      <span class="chip">居住地 ${escapeHtml(person.residence || "未填写")}</span>
      <span class="chip">行业 ${escapeHtml(person.industry || "未填写")}</span>
      <span class="chip">影响力 ${person.influence}</span>
      <span class="chip">亲密程度 ${person.closeness}</span>
      <span class="chip">${escapeHtml(person.ecosystem || "未标注生态圈")}</span>
    </div>
    <div class="profile-grid">
      ${profileField("生态圈", person.ecosystem)}
      ${profileField("相识记录", person.meetRecord)}
      ${profileField("家庭信息", person.family)}
      ${profileField("特征", person.traits)}
      ${profileField("工作", person.work)}
      ${profileField("爱好", person.hobbies)}
      ${profileField("特殊细节", person.details)}
      ${profileField("给我的启发", person.inspiration)}
    </div>
    <div class="modal-actions">
      <button class="secondary-button" type="button" data-close-dialog="profileDialog">关闭</button>
      <button class="primary-button" type="button" data-edit-person="${person.id}">编辑归档</button>
    </div>
  `;
  document.querySelector("#profileDialog").showModal();
}

function profileField(label, value) {
  return `
    <section class="profile-field">
      <p class="eyebrow">${label}</p>
      <div>${escapeHtml(value || "未补充")}</div>
    </section>
  `;
}

function openTaskDialog(personId = "", type = "") {
  if (!state.people.length) {
    showToast("请先新增人脉档案，再创建维护行动");
    return;
  }
  document.querySelector("#taskForm").reset();
  renderTaskPersonOptions(personId);
  if (type) document.querySelector("#taskType").value = type;
  document.querySelector("#taskDue").value = todayISO();
  document.querySelector("#taskError").textContent = "";
  document.querySelector("#taskDialog").showModal();
  document.querySelector("#taskTitle").focus();
}

function createQuickTask(personId, type, title) {
  state.tasks.unshift({
    id: makeId(),
    personId,
    type,
    title,
    dueDate: todayISO(),
    status: "pending",
  });
  saveState();
  render();
  showToast("维护行动已创建");
}

async function deletePerson(id) {
  const person = personById(id);
  if (!person) return;
  const confirmed = await showConfirm({
    title: `删除「${person.name}」？`,
    message: "这会同时删除与此人相关的维护行动。此操作无法撤销。",
    confirmText: "删除",
    cancelText: "取消",
    tone: "danger",
  });
  if (!confirmed) return;
  state.people = state.people.filter((item) => item.id !== id);
  state.tasks = state.tasks.filter((task) => task.personId !== id);
  saveState();
  render();
  showToast("人脉档案已删除");
}

async function deleteTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  const confirmed = await showConfirm({
    title: "删除维护行动？",
    message: "删除后该行动将从维护队列中移除，此操作无法撤销。",
    confirmText: "删除",
    cancelText: "取消",
    tone: "danger",
  });
  if (!confirmed) return;
  state.tasks = state.tasks.filter((item) => item.id !== id);
  saveState();
  render();
  showToast("维护行动已删除");
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector("#themeLabel").textContent = theme === "dark" ? "浅色" : "深色";
  storageSet(THEME_KEY, theme);
}

function applyAccent(preset, customColor = "") {
  const root = document.documentElement;
  const custom = customColor || "#155eef";
  const selected = preset === "custom"
    ? { primary: custom, primaryStrong: custom, accent: shiftHexColor(custom, -34) }
    : accentPresets[preset] || accentPresets.ocean;

  root.style.setProperty("--primary", selected.primary);
  root.style.setProperty("--primary-strong", selected.primaryStrong);
  root.style.setProperty("--accent", selected.accent);
  document.querySelector("#accentSelect").value = preset;
  document.querySelector("#customAccentInput").value = selected.primary;
  document.querySelector("#customAccentInput").classList.toggle("is-visible", preset === "custom");
  storageSet(ACCENT_KEY, preset);
  if (preset === "custom") storageSet(CUSTOM_ACCENT_KEY, selected.primary);
}

function shiftHexColor(hex, amount) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const number = Number.parseInt(clean, 16);
  const clamp = (value) => Math.max(0, Math.min(255, value));
  const red = clamp((number >> 16) + amount);
  const green = clamp(((number >> 8) & 255) - amount);
  const blue = clamp((number & 255) + Math.round(amount / 2));
  return `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;
}

function initTheme() {
  const saved = storageGet(THEME_KEY);
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

function initAccent() {
  const savedPreset = storageGet(ACCENT_KEY) || "appleBlue";
  const preset = savedPreset === "custom" || accentPresets[savedPreset] ? savedPreset : "appleBlue";
  const customColor = storageGet(CUSTOM_ACCENT_KEY) || "#155eef";
  applyAccent(preset, customColor);
}

function render() {
  renderDashboard();
  renderStrategy();
  renderWhy();
  renderArchive();
  renderCircle();
  renderActions();
  renderPlaybook();
}

if (hasBrowser) {
document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelector("#sectionTabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-section-tab]");
  if (!tab) return;
  setView(tab.dataset.sectionTab);
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  if (target.dataset.viewJump) setView(target.dataset.viewJump);
  const needsLogin = target.dataset.editPerson
    || target.dataset.createTask
    || target.dataset.openTaskType
    || target.dataset.createOutreach
    || target.dataset.createGeneralAction
    || target.dataset.deletePerson
    || target.dataset.setTier
    || target.dataset.completeTask
    || target.dataset.postponeTask
    || target.dataset.deleteTask;
  if (needsLogin && !requireCloudUser()) return;

  if (target.dataset.closeDialog) {
    if (target.dataset.closeDialog === "archiveDialog") {
      requestCloseArchiveDialog();
    } else {
      document.querySelector(`#${target.dataset.closeDialog}`).close();
    }
  }
  if (target.dataset.editPerson) {
    const profileDialog = document.querySelector("#profileDialog");
    if (profileDialog?.open) profileDialog.close();
    openArchiveDialog(target.dataset.editPerson);
  }
  if (target.dataset.createTask) openTaskDialog(target.dataset.createTask);
  if (target.dataset.openTaskType) openTaskDialog("", target.dataset.openTaskType);

  if (target.dataset.createOutreach) {
    const [personId, type] = target.dataset.createOutreach.split(":");
    const person = personById(personId);
    if (person) {
      createQuickTask(personId, type, `${type}：围绕 ${person.work || person.ecosystem || "对方关注点"} 设计一次高质量连接。`);
    }
  }

  if (target.dataset.createGeneralAction) {
    if (!state.people.length) {
      showToast("请先新增人脉档案，再创建维护行动");
    } else {
      const type = target.dataset.createGeneralAction;
      createQuickTask(state.people[0].id, type, `${type}：完成一次场景化跟进、社群维护或跨圈连接。`);
    }
  }

  if (target.dataset.deletePerson) {
    deletePerson(target.dataset.deletePerson);
  }

  if (target.dataset.setTier) {
    const [id, tier] = target.dataset.setTier.split(":");
    const person = personById(id);
    if (person) {
      person.tier = tier;
      saveState();
      render();
      showToast(`已调整为${tier}`);
    }
  }

  if (target.dataset.completeTask) {
    const task = state.tasks.find((item) => item.id === target.dataset.completeTask);
    if (task) {
      task.status = "done";
      const person = personById(task.personId);
      if (person) person.lastInteraction = todayISO();
      saveState();
      render();
      showToast("行动已完成，并更新最近互动");
    }
  }

  if (target.dataset.postponeTask) {
    const task = state.tasks.find((item) => item.id === target.dataset.postponeTask);
    if (task) {
      const base = new Date(task.dueDate < todayISO() ? todayISO() : task.dueDate);
      base.setDate(base.getDate() + 3);
      task.dueDate = base.toISOString().slice(0, 10);
      saveState();
      render();
      showToast("已顺延 3 天");
    }
  }

  if (target.dataset.deleteTask) {
    deleteTask(target.dataset.deleteTask);
  }
});

document.querySelector("#newArchiveBtn").addEventListener("click", () => {
  if (requireCloudUser()) openArchiveDialog();
});
document.querySelector("#newTaskBtn").addEventListener("click", () => {
  if (requireCloudUser()) openTaskDialog();
});
document.querySelector("#guideBtn").addEventListener("click", () => document.querySelector("#guideDialog").showModal());
document.querySelector("#authStatusBtn").addEventListener("click", async () => {
  if (storageMode !== "cloud") return;
  if (!currentUser) {
    openAuthDialog();
    return;
  }
  const confirmed = await showConfirm({
    title: "退出登录？",
    message: "退出后需要重新登录才能查看云端数据。",
    confirmText: "退出登录",
    cancelText: "取消",
  });
  if (confirmed) signOut();
});
document.querySelector("#searchInput").addEventListener("input", renderArchive);
document.querySelector("#tierFilter").addEventListener("change", renderArchive);
document.querySelector("#ecosystemFilter").addEventListener("change", renderArchive);
document.querySelectorAll("[data-archive-layout]").forEach((button) => {
  button.addEventListener("click", () => {
    archiveLayout = button.dataset.archiveLayout;
    storageSet("peigen-nexus-archive-layout", archiveLayout);
    renderArchive();
  });
});
document.querySelector("#profileDialog").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});
document.querySelector("#guideDialog").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});
document.querySelector("#authDialog").addEventListener("click", (event) => {
  if (event.target === event.currentTarget && currentUser) event.currentTarget.close();
});
document.querySelector("#archiveDialog").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) requestCloseArchiveDialog();
});
document.querySelector("#archiveDialog").addEventListener("cancel", (event) => {
  event.preventDefault();
  requestCloseArchiveDialog();
});
document.querySelector("#themeToggle").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
});
document.querySelector("#accentSelect").addEventListener("change", (event) => {
  const preset = event.target.value;
  const customColor = storageGet(CUSTOM_ACCENT_KEY) || document.querySelector("#customAccentInput").value;
  applyAccent(preset, customColor);
});
document.querySelector("#customAccentInput").addEventListener("input", (event) => {
  applyAccent("custom", event.target.value);
});

document.querySelector("#backToTopBtn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", () => {
  document.querySelector("#backToTopBtn").classList.toggle("is-visible", window.scrollY > 420);
}, { passive: true });

document.querySelector("#strategyForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.strategy = {
    want: document.querySelector("#strategyWant").value.trim(),
    serve: document.querySelector("#strategyServe").value.trim(),
    need: document.querySelector("#strategyNeed").value.trim(),
    change: document.querySelector("#strategyChange").value.trim(),
  };
  saveState();
  render();
  showToast("目标价值已保存");
});

document.querySelector("#archiveForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!saveArchiveForm()) return;
  document.querySelector("#archiveDialog").close();
});

document.querySelector("#taskForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const personId = document.querySelector("#taskPerson").value;
  const title = document.querySelector("#taskTitle").value.trim();
  const dueDate = document.querySelector("#taskDue").value;

  if (!personId || !title || !dueDate) {
    document.querySelector("#taskError").textContent = "请完整填写人脉档案、日期和行动内容。";
    return;
  }

  state.tasks.unshift({
    id: makeId(),
    personId,
    type: document.querySelector("#taskType").value,
    title,
    dueDate,
    status: "pending",
  });
  saveState();
  document.querySelector("#taskDialog").close();
  render();
  showToast("维护行动已创建");
});

document.querySelector("#exportBtn").addEventListener("click", downloadBackupFile);
document.querySelector("#importBtn").addEventListener("click", () => document.querySelector("#importInput").click());
document.querySelector("#authForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await signIn();
  } catch (error) {
    document.querySelector("#authError").textContent = error.message || "登录失败";
  }
});
document.querySelector("#signUpBtn").addEventListener("click", async () => {
  try {
    await signUp();
  } catch (error) {
    document.querySelector("#authError").textContent = error.message || "注册失败";
  }
});

document.querySelector("#importInput").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!requireCloudUser()) {
    event.target.value = "";
    return;
  }
  try {
    const imported = readBackupPayload(JSON.parse(await file.text()));
    const confirmed = await showConfirm({
      title: "导入备份数据",
      message: "导入后将用备份文件覆盖当前系统中的全部人脉档案、战略定位、维护行动和界面设置。此操作不会自动合并数据。",
      confirmText: "覆盖导入",
      cancelText: "取消",
      tone: "danger",
    });
    if (!confirmed) return;
    state = imported.state;
    applyImportedSettings(imported.settings);
    saveState();
    render();
    showToast("备份数据已覆盖导入");
  } catch {
    showToast("导入失败，请选择有效的 JSON 备份");
  } finally {
    event.target.value = "";
  }
});

initTheme();
initAccent();
renderSectionTabs(activeView);
initStorage()
  .catch((error) => {
    console.error(error);
    showToast("数据加载失败，暂时使用浏览器缓存数据");
  })
  .finally(render);
}
