// 和平使者 - 完全重构版
// 5角色独立剧情 × 4幕 × 10任务 × 5结局
let canvas, ctx;
let W, H, dpr;
let currentScene = 'title';
let playerRole = null;
let empathyScore = 0;
let warmFragments = 0;
let currentActIndex = 0;
let currentTaskIndex = 0;
let currentDialogIndex = 0;
let currentDialogs = [];
let currentChoices = [];
let roleSelectIndex = 0;
let scrollY = 0;

const GS = {
  buttons: [],
  bgImages: {},
  bgLoaded: {},
  roleImages: {},
  roleLoaded: {},
  bgm: null,
  bgmPlaying: false,
  popup: null,
  popupBtns: [],
  sidebarTab: 'task',
  showPopup: false,
  transitionAlpha: 0,
  transitionTimer: 0,
  transitionData: null,
  clues: []
};

const C = {
  bg: '#0d0d15',
  bg2: '#1a1a2e',
  panel: 'rgba(20, 25, 40, 0.92)',
  panelBorder: 'rgba(180, 160, 100, 0.3)',
  gold: '#c9a84c',
  goldLight: '#e8d5a3',
  red: '#8b0000',
  redLight: '#cc3333',
  text: '#d4d4d8',
  textGray: '#888899',
  textDark: '#555566',
  white: '#ffffff',
  green: '#2d8a5e',
  blue: '#3a6ea5',
  sidebarBg: 'rgba(15, 15, 25, 0.95)',
  sidebarActive: 'rgba(180, 160, 100, 0.2)',
  progressBar: 'rgba(139, 0, 0, 0.6)',
  headerBg: 'rgba(20, 20, 35, 0.95)'
};

const ROLES = {
  lili: { id: 'lili', name: '莉莉', title: '单亲母亲', age: 32, color: '#d4a574', icon: '👩', parallel: '娜迪亚' },
  jake: { id: 'jake', name: '杰克', title: '公司职员', age: 27, color: '#6b8cae', icon: '👨', parallel: '卡里姆' },
  amy:  { id: 'amy',  name: '艾米',  title: '大学生',   age: 20, color: '#c47a9e', icon: '👧', parallel: '拉雅' },
  thomas:{ id: 'thomas', name: '托马斯', title: '退休工人', age: 61, color: '#8a9a7a', icon: '👴', parallel: '易卜拉欣' },
  sarah:{ id: 'sarah', name: '莎拉', title: '自由职业', age: 24, color: '#9a7ab8', icon: '👩', parallel: '扎赫拉' }
};

function makeEndings(parallel) {
  return {
    A: { title: '觉醒者', desc: '从此不再抱怨生活琐碎，学会在平凡中看见奇迹，成为照亮他人的光。', needScore: 90, needTasks: 10 },
    B: { title: '知足常乐', desc: '学会了感恩，偶尔还是会累，但会告诉自己："至少我们都平安"。', needScore: 70, needTasks: 8 },
    C: { title: '后知后觉', desc: '游戏结束时有所触动，回到生活后渐渐遗忘，偶尔想起时会沉默片刻。', needScore: 50, needTasks: 5 },
    D: { title: '依旧如故', desc: '"那只是另一个世界的故事"，继续自己的生活，偶尔焦虑但也继续前行。', needScore: 0, needTasks: 0 },
    E: { title: '彩蛋·希望联结', desc: parallel + '感受到了你的祝福。今天她们平安度过了空袭，在废墟上画了一朵花。', needScore: 100, needTasks: 10, needFragments: true }
  };
}


const ROLE_DATA = {
  lili: {
    endings: makeEndings('娜迪亚'),
    materials: [
      { title: '角色档案', content: '莉莉，32岁，单亲母亲。独自抚养3岁女儿，在超市做收银员。日常被育儿、账单和疲惫填满。', unlocked: true },
      { title: '内心独白 #1', content: '「带孩子太累了...但如果连"累"都觉得奢侈呢？」——完成首个任务后的深夜自语。', unlocked: false, unlockTask: 'lili_1' },
      { title: '娜迪亚的回声', content: '电波中传来的名字。她在废墟中寻找清水和干硬的面饼，用温柔的声音安抚饥饿的孩子。', unlocked: false, unlockTask: 'lili_4' },
      { title: '给娜迪亚的信', content: '「亲爱的娜迪亚，今天阳光很好。我女儿笑了。我想告诉你，天空是一样的蓝。」', unlocked: false, unlockTask: 'lili_8' },
      { title: '幸福日记', content: '莉莉开始记录每天的三件小事。第一页写着：「女儿的呼吸声、温热的牛奶、没有被惊醒的睡眠。」', unlocked: false, unlockTask: 'lili_9' }
    ],
    acts: [
      {
        id: 'act1', title: '第一幕', subtitle: '庸常的烦恼', desc: '和平之下的无意识',
        transition: { title: '第一幕', subtitle: '庸常的烦恼', duration: 2500 },
        tasks: [
          {
            id: 'lili_1', name: '育儿压力：工资微薄，物价飞涨', empathy: 5, clue: '线索：莉莉的账单', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '周末早晨，莉莉被女儿的哭声吵醒。' },
              { speaker: 'lili', text: '又要换尿布、冲奶粉...昨晚我只睡了四小时。' },
              { speaker: 'lili', text: '带孩子太累了，工资又少，物价还涨...这日子什么时候是个头？' }
            ],
            choices: [
              { text: '疲惫地起床，继续一天', empathy: 5, next: 'complete' },
              { text: '温柔地抱起女儿', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'lili_2', name: '日常琐碎：重复的生活令人窒息', empathy: 5, clue: '线索：厨房里的碗', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '厨房里堆着昨天的碗，水槽堵了。' },
              { speaker: 'lili', text: '每天重复同样的事——做饭、洗碗、哄睡。生活好枯燥。' },
              { speaker: 'lili', text: '我就像一台机器，还是一台永远修不好的机器。' }
            ],
            choices: [
              { text: '默默洗完碗', empathy: 5, next: 'complete' },
              { text: '坐在沙发上发呆', empathy: 0, next: 'complete' }
            ]
          },
          {
            id: 'lili_3', name: '内心独白：羡慕别人，只剩疲惫', empathy: 5, clue: '线索：朋友圈的度假照', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '莉莉刷着手机，看到前同事在海边度假。' },
              { speaker: 'lili', text: '羡慕别人过得好，自己只剩疲惫。我也曾想过不一样的人生。' },
              { speaker: 'lili', text: '（放下手机）算了，想这些有什么用。' }
            ],
            choices: [
              { text: '关掉手机陪女儿', empathy: 10, next: 'complete' },
              { text: '继续刷手机', empathy: 0, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act2', title: '第二幕', subtitle: '电波彼岸', desc: '两种人生的残酷对照',
        transition: { title: '第二幕', subtitle: '电波彼岸', duration: 2500 },
        tasks: [
          {
            id: 'lili_4', name: '收音机异象：彼岸母亲的求救', empathy: 15, clue: '线索：娜迪亚的声音', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '角落的收音机突然沙沙作响，指示灯诡异地亮起。' },
              { speaker: 'radio_mother', text: '宝贝，再坚持一下，妈妈找到水了。' },
              { speaker: 'lili', text: '什么声音？这收音机...没插电啊？' }
            ],
            choices: [
              { text: '靠近收音机仔细听', empathy: 15, next: 'complete' },
              { text: '觉得奇怪但不管', empathy: 5, next: 'complete' }
            ]
          },
          {
            id: 'lili_5', name: '残酷对照：半块面包与干硬面饼', empathy: 15, clue: '线索：被扔掉的面包', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '莉莉看着自己刚扔掉的半块面包。' },
              { speaker: 'radio_mother', text: '【轻声】今天只有干面饼了，你咬一口，妈妈不饿。' },
              { speaker: 'lili', text: '...我刚才在嫌弃面包太干。' }
            ],
            choices: [
              { text: '感到羞愧，捡起面包', empathy: 15, next: 'complete' },
              { text: '默默收起面包', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'lili_6', name: '转折顿悟：拥有即是奢望', empathy: 20, clue: '线索：莉莉的眼泪', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '电波中传来孩子的哭声，莉莉抱紧了自己的女儿。' },
              { speaker: 'lili', text: '原来...能抱怨奶粉贵，说明我有奶粉。能嫌面包干，说明我有面包。' },
              { speaker: 'lili', text: '我拥有的一切，是另一个母亲拼尽全力也换不来的。' }
            ],
            choices: [
              { text: '流泪，下定决心改变', empathy: 20, next: 'complete' },
              { text: '沉默地抱紧女儿', empathy: 15, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act3', title: '第三幕', subtitle: '同一片天空', desc: '隔空的对话与共情',
        transition: { title: '第三幕', subtitle: '同一片天空', duration: 2500 },
        tasks: [
          {
            id: 'lili_7', name: '共情行动：为娜迪亚捐赠物资', empathy: 10, clue: '线索：捐赠包裹', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '莉莉在网上查找难民营捐赠渠道。' },
              { speaker: 'lili', text: '我可以把女儿穿小的衣服、多余的奶粉捐出去。' },
              { speaker: 'lili', text: '这不是同情，这是...和平使者该做的事。' }
            ],
            choices: [
              { text: '打包物资并留言', empathy: 10, next: 'complete' },
              { text: '捐款', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'lili_8', name: '温暖碎片：写下给娜迪亚的信', empathy: 10, clue: '温暖碎片：莉莉的信', isFragment: true,
            dialogs: [
              { speaker: 'narrator', text: '莉莉在纸上写下给娜迪亚的信。' },
              { speaker: 'lili', text: '"亲爱的娜迪亚，今天阳光很好。我女儿笑了，我想告诉你，天空是一样的蓝。"' },
              { speaker: 'lili', text: '（折好信纸）希望风能把它带到你那边。' }
            ],
            choices: [
              { text: '将信放入捐赠箱', empathy: 10, fragment: true, next: 'complete' },
              { text: '默默祈祷', empathy: 10, fragment: true, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act4', title: '第四幕', subtitle: '珍惜当下', desc: '和平的答案',
        transition: { title: '第四幕', subtitle: '珍惜当下', duration: 2500 },
        tasks: [
          {
            id: 'lili_9', name: '珍惜当下：每天记录三件小事', empathy: 10, clue: '线索：幸福日记', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '莉莉开始每天记录"三件小事"。' },
              { speaker: 'lili', text: '今天女儿第一次叫妈妈。今天牛奶很新鲜。今天没有加班。' },
              { speaker: 'lili', text: '原来幸福一直都在，只是我从未低头看过。' }
            ],
            choices: [
              { text: '继续记录', empathy: 10, next: 'complete' },
              { text: '教女儿一起记', empathy: 15, next: 'complete' }
            ]
          },
          {
            id: 'lili_10', name: '终极反思：我最珍惜的三件小事', empathy: 10, clue: '终极反思：莉莉的答案', isFragment: false, isFinal: true,
            dialogs: [
              { speaker: 'narrator', text: '夜晚，莉莉抱着熟睡的女儿坐在窗前。' },
              { speaker: 'lili', text: '我最珍惜的三件小事——第一，女儿的呼吸。第二，温暖的床。第三，和平的夜晚。' },
              { speaker: 'lili', text: '谢谢你，娜迪亚。你让我看见了平凡中的奇迹。' }
            ],
            choices: [
              { text: '亲吻女儿额头', empathy: 10, next: 'ending' },
              { text: '望向星空', empathy: 10, next: 'ending' }
            ]
          }
        ]
      }
    ]
  },


  jake: {
    endings: makeEndings('卡里姆'),
    materials: [
      { title: '角色档案', content: '杰克，27岁，公司职员。每天通勤两小时，加班到深夜，住在狭小的出租屋里，升职遥遥无期。', unlocked: true },
      { title: '内心独白 #1', content: '「加班频繁，通勤累到崩溃...但如果连班都没得加呢？」', unlocked: false, unlockTask: 'jake_1' },
      { title: '卡里姆的回声', content: '电波中的父亲。他冒着流弹徒步数公里，只为寻找一点饮用水。孩子们已经三天没有洗脸。', unlocked: false, unlockTask: 'jake_4' },
      { title: '给卡里姆的信', content: '「亲爱的卡里姆，今天我准时下班了。原来能"疲惫地忙碌"，本身就是一种幸运。」', unlocked: false, unlockTask: 'jake_8' },
      { title: '公园十分钟', content: '杰克每天下班后在公园坐十分钟。他在笔记本上写：「今天没有空袭警报，真好。」', unlocked: false, unlockTask: 'jake_9' }
    ],
    acts: [
      {
        id: 'act1', title: '第一幕', subtitle: '庸常的烦恼', desc: '和平之下的无意识',
        transition: { title: '第一幕', subtitle: '庸常的烦恼', duration: 2500 },
        tasks: [
          {
            id: 'jake_1', name: '通勤地狱：两小时地铁与拥挤人群', empathy: 5, clue: '线索：杰克的地铁卡', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '早高峰的地铁像沙丁鱼罐头，杰克被挤在门边。' },
              { speaker: 'jake', text: '加班频繁，通勤累到崩溃。每天都是同样的面孔、同样的汗味。' },
              { speaker: 'jake', text: '这种生活...到底为了什么？' }
            ],
            choices: [
              { text: '戴上耳机，闭上眼睛', empathy: 5, next: 'complete' },
              { text: '深呼吸，忍耐到站', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'jake_2', name: '职场焦虑：升职遥遥无期', empathy: 5, clue: '线索：杰克的绩效表', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '深夜十一点，杰克还在改PPT。' },
              { speaker: 'jake', text: '升职遥遥无期，焦虑到失眠。我已经三个月没睡过一个好觉了。' },
              { speaker: 'jake', text: '（揉眼睛）如果辞职，下个月房租怎么办？' }
            ],
            choices: [
              { text: '泡杯咖啡继续改', empathy: 5, next: 'complete' },
              { text: '关掉电脑，先睡觉', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'jake_3', name: '存在虚无：城市太拥挤，活着无意义', empathy: 5, clue: '线索：杰克的日记', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '杰克站在公司天台，看着脚下的车流。' },
              { speaker: 'jake', text: '城市太拥挤，活着毫无意义。我只是万千螺丝钉中的一颗。' },
              { speaker: 'jake', text: '没有人会记得我。' }
            ],
            choices: [
              { text: '给老家父母打个电话', empathy: 10, next: 'complete' },
              { text: '下楼买份热乎的晚饭', empathy: 5, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act2', title: '第二幕', subtitle: '电波彼岸', desc: '两种人生的残酷对照',
        transition: { title: '第二幕', subtitle: '电波彼岸', duration: 2500 },
        tasks: [
          {
            id: 'jake_4', name: '收音机异象：彼岸父亲的求生', empathy: 15, clue: '线索：卡里姆的脚步声', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '收音机突然发出刺耳的杂音，随后传来沉重的喘息。' },
              { speaker: 'radio_father', text: '【喘息】还有两条街...水站应该还在。' },
              { speaker: 'jake', text: '这声音...是从哪里来的？' }
            ],
            choices: [
              { text: '屏息聆听', empathy: 15, next: 'complete' },
              { text: '试图调整频道', empathy: 5, next: 'complete' }
            ]
          },
          {
            id: 'jake_5', name: '残酷对照：堵车与流弹街区', empathy: 15, clue: '线索：杰克的汽车钥匙', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '杰克看着手机上的堵车红点，烦躁地按着喇叭。' },
              { speaker: 'radio_father', text: '【低声】趴下！有无人机...等它飞过去。' },
              { speaker: 'jake', text: '我抱怨堵车...而他在躲流弹。' }
            ],
            choices: [
              { text: '关掉引擎，静静等待', empathy: 15, next: 'complete' },
              { text: '感到无地自容', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'jake_6', name: '转折顿悟：能疲惫地忙碌，代表拥有工作', empathy: 20, clue: '线索：杰克的顿悟', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '电波中传来孩子问："爸爸，今天能找到水吗？"' },
              { speaker: 'radio_father', text: '【疲惫但坚定】能。爸爸保证。' },
              { speaker: 'jake', text: '原来...能疲惫地忙碌，代表我拥有工作、拥有收入、拥有未来。' }
            ],
            choices: [
              { text: '深深鞠躬，感谢拥有的一切', empathy: 20, next: 'complete' },
              { text: '握紧方向盘，眼眶发热', empathy: 15, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act3', title: '第三幕', subtitle: '同一片天空', desc: '隔空的对话与共情',
        transition: { title: '第三幕', subtitle: '同一片天空', duration: 2500 },
        tasks: [
          {
            id: 'jake_7', name: '共情行动：为卡里姆寻找净水设备', empathy: 10, clue: '线索：净水设备订单', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '杰克在网上搜索便携式净水设备。' },
              { speaker: 'jake', text: '如果能寄一台过去...不，能捐一批过去，他们就不用冒死找水了。' },
              { speaker: 'jake', text: '我终于可以做点有意义的事了。' }
            ],
            choices: [
              { text: '下单并匿名捐赠', empathy: 10, next: 'complete' },
              { text: '联系公益组织批量捐赠', empathy: 15, next: 'complete' }
            ]
          },
          {
            id: 'jake_8', name: '温暖碎片：写下给卡里姆的信', empathy: 10, clue: '温暖碎片：杰克的信', isFragment: true,
            dialogs: [
              { speaker: 'narrator', text: '杰克在信纸上写下第一行字。' },
              { speaker: 'jake', text: '"亲爱的卡里姆，今天我准时下班了。我在公园坐了十分钟，风很温柔。"' },
              { speaker: 'jake', text: '"原来能疲惫地忙碌，本身就是一种幸运。愿你早日喝到干净的水。"' }
            ],
            choices: [
              { text: '将信扫描发至公益组织', empathy: 10, fragment: true, next: 'complete' },
              { text: '折成纸飞机从窗口放飞', empathy: 10, fragment: true, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act4', title: '第四幕', subtitle: '珍惜当下', desc: '和平的答案',
        transition: { title: '第四幕', subtitle: '珍惜当下', duration: 2500 },
        tasks: [
          {
            id: 'jake_9', name: '珍惜当下：每天下班公园坐十分钟', empathy: 10, clue: '线索：公园长椅', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '杰克第一次在天还亮着的时候走出公司。' },
              { speaker: 'jake', text: '原来傍晚的天空是橙红色的。我以前从没注意过。' },
              { speaker: 'jake', text: '今天没有加班，真好。今天没有空袭，真好。' }
            ],
            choices: [
              { text: '拍下天空发给父母', empathy: 10, next: 'complete' },
              { text: '静静坐满十分钟', empathy: 15, next: 'complete' }
            ]
          },
          {
            id: 'jake_10', name: '终极反思：我最珍惜的三件小事', empathy: 10, clue: '终极反思：杰克的答案', isFragment: false, isFinal: true,
            dialogs: [
              { speaker: 'narrator', text: '杰克坐在公园长椅上，路灯刚刚亮起。' },
              { speaker: 'jake', text: '我最珍惜的三件小事——第一，准时下班的傍晚。第二，热乎的晚饭。第三，能安稳入睡的夜晚。' },
              { speaker: 'jake', text: '谢谢你，卡里姆。你让我重新看见了生活的重量。' }
            ],
            choices: [
              { text: '深呼吸，微笑', empathy: 10, next: 'ending' },
              { text: '望向橙红色的夜空', empathy: 10, next: 'ending' }
            ]
          }
        ]
      }
    ]
  },


  amy: {
    endings: makeEndings('拉雅'),
    materials: [
      { title: '角色档案', content: '艾米，20岁，大学生。被学业压力、容貌焦虑和社交内耗困扰，觉得未来一片迷茫。', unlocked: true },
      { title: '内心独白 #1', content: '「学业压力快把我压垮...但如果连"考试"都是一种奢侈呢？」', unlocked: false, unlockTask: 'amy_1' },
      { title: '拉雅的回声', content: '电波中的同龄女孩。她早已辍学，每天躲在防空洞，最奢侈的愿望是能安稳坐下来读一页书。', unlocked: false, unlockTask: 'amy_4' },
      { title: '给拉雅的信', content: '「亲爱的拉雅，今天我考试通过了。我想告诉你，能学习、能选择，本身就是一种奇迹。」', unlocked: false, unlockTask: 'amy_8' },
      { title: '反战志愿者', content: '艾米加入了校园反战公益社团。她在海报上写：「你眼中的平凡，是别人的奢望。」', unlocked: false, unlockTask: 'amy_9' }
    ],
    acts: [
      {
        id: 'act1', title: '第一幕', subtitle: '庸常的烦恼', desc: '和平之下的无意识',
        transition: { title: '第一幕', subtitle: '庸常的烦恼', duration: 2500 },
        tasks: [
          {
            id: 'amy_1', name: '学业压力：考试、绩点、未来', empathy: 5, clue: '线索：艾米的成绩单', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '图书馆里，艾米对着满桌的参考书发呆。' },
              { speaker: 'amy', text: '学业压力快把我压垮。绩点、保研、就业...每一步都像走钢丝。' },
              { speaker: 'amy', text: '如果考不好，我的人生就完了。' }
            ],
            choices: [
              { text: '继续刷题', empathy: 5, next: 'complete' },
              { text: '合上书，去操场走走', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'amy_2', name: '容貌焦虑：镜子前的自我否定', empathy: 5, clue: '线索：艾米的化妆镜', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '艾米站在宿舍镜子前，捏着自己的脸颊。' },
              { speaker: 'amy', text: '容貌焦虑、社交内耗。为什么我不能像她们一样好看？' },
              { speaker: 'amy', text: '（低下头）可能我天生就不配被喜欢吧。' }
            ],
            choices: [
              { text: '用遮瑕膏盖住黑眼圈', empathy: 0, next: 'complete' },
              { text: '把镜子转向窗外', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'amy_3', name: '存在迷茫：觉得自己一无所有', empathy: 5, clue: '线索：艾米的日记本', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '深夜，艾米在被窝里刷着社交媒体。' },
              { speaker: 'amy', text: '对未来迷茫，觉得自己一无所有。别人都有目标，只有我像个空壳。' },
              { speaker: 'amy', text: '我到底想要什么？' }
            ],
            choices: [
              { text: '关掉手机，尝试入睡', empathy: 5, next: 'complete' },
              { text: '写下三个小目标', empathy: 10, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act2', title: '第二幕', subtitle: '电波彼岸', desc: '两种人生的残酷对照',
        transition: { title: '第二幕', subtitle: '电波彼岸', duration: 2500 },
        tasks: [
          {
            id: 'amy_4', name: '收音机异象：防空洞里的读书声', empathy: 15, clue: '线索：拉雅的声音', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '收音机突然发出微弱的读书声，像是有人在防空洞里朗读。' },
              { speaker: 'radio_child', text: '【小声】妈妈，我今天读了三页书。' },
              { speaker: 'radio_mother', text: '【温柔】真棒。要小声哦，外面还在响。' },
              { speaker: 'amy', text: '...三页书？我一天能刷几百道题，却从不觉得珍贵。' }
            ],
            choices: [
              { text: '放下笔，静静听', empathy: 15, next: 'complete' },
              { text: '打开窗户，让声音更清楚', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'amy_5', name: '残酷对照：考试失利与辍学求生', empathy: 15, clue: '线索：艾米的准考证', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '艾米看着桌上明天的准考证，突然感到一阵荒谬。' },
              { speaker: 'amy', text: '我焦虑考试失利...而拉雅早已辍学，她的"考场"是防空洞，她的"成绩"是活着。' },
              { speaker: 'amy', text: '（颤抖）我拥有的，是别人穷尽一生都无法抵达的奢望。' }
            ],
            choices: [
              { text: '把准考证贴在胸口', empathy: 15, next: 'complete' },
              { text: '流泪，然后擦干', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'amy_6', name: '转折顿悟：能考试、能选择，已是奇迹', empathy: 20, clue: '线索：艾米的觉醒', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '电波中传来女孩问："妈妈，和平的地方也有考试吗？"' },
              { speaker: 'radio_mother', text: '【微笑】有的。她们会为了考试烦恼，就像我们为了水烦恼。' },
              { speaker: 'amy', text: '原来...能为考试烦恼，说明我有学校、有未来、有选择权。' }
            ],
            choices: [
              { text: '拿起笔，郑重写下"感谢"', empathy: 20, next: 'complete' },
              { text: '对着收音机深深鞠躬', empathy: 15, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act3', title: '第三幕', subtitle: '同一片天空', desc: '隔空的对话与共情',
        transition: { title: '第三幕', subtitle: '同一片天空', duration: 2500 },
        tasks: [
          {
            id: 'amy_7', name: '共情行动：为拉雅捐赠图书', empathy: 10, clue: '线索：捐赠图书清单', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '艾米整理了自己的课本和参考书。' },
              { speaker: 'amy', text: '这些书我考完就不会再看了，但对拉雅来说，每一页都是光。' },
              { speaker: 'amy', text: '我要把笔记也写上，让她知道有人在乎她能不能读书。' }
            ],
            choices: [
              { text: '在每本书扉页写鼓励的话', empathy: 15, next: 'complete' },
              { text: '打包寄往难民营', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'amy_8', name: '温暖碎片：写下给拉雅的信', empathy: 10, clue: '温暖碎片：艾米的信', isFragment: true,
            dialogs: [
              { speaker: 'narrator', text: '艾米在信纸上画了一个小小的太阳。' },
              { speaker: 'amy', text: '"亲爱的拉雅，今天我考试通过了。我想告诉你，能学习、能选择，本身就是一种奇迹。"' },
              { speaker: 'amy', text: '"如果你愿意，我们可以一起读同一本书。我会在这一头等你。"' }
            ],
            choices: [
              { text: '把信夹在捐赠的书里', empathy: 10, fragment: true, next: 'complete' },
              { text: '拍照发到反战论坛', empathy: 10, fragment: true, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act4', title: '第四幕', subtitle: '珍惜当下', desc: '和平的答案',
        transition: { title: '第四幕', subtitle: '珍惜当下', duration: 2500 },
        tasks: [
          {
            id: 'amy_9', name: '珍惜当下：加入反战公益社团', empathy: 10, clue: '线索：社团海报', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '艾米在校园公告栏前停下，一张"反战公益社团"的海报吸引了她。' },
              { speaker: 'amy', text: '你眼中的平凡，是别人的奢望。这句话...是我写的。' },
              { speaker: 'amy', text: '我终于知道我想要什么了。我要让更多人看见，我们拥有的是多么珍贵。' }
            ],
            choices: [
              { text: '在海报上签下名字', empathy: 10, next: 'complete' },
              { text: '拉上室友一起加入', empathy: 15, next: 'complete' }
            ]
          },
          {
            id: 'amy_10', name: '终极反思：我最珍惜的三件小事', empathy: 10, clue: '终极反思：艾米的答案', isFragment: false, isFinal: true,
            dialogs: [
              { speaker: 'narrator', text: '艾米坐在图书馆靠窗的位置，阳光正好照在书页上。' },
              { speaker: 'amy', text: '我最珍惜的三件小事——第一，能安稳坐下来的课桌。第二，翻书时的沙沙声。第三，知道明天还能来。' },
              { speaker: 'amy', text: '谢谢你，拉雅。你让我从焦虑中醒来，看见了真正的自己。' }
            ],
            choices: [
              { text: '在笔记本上画一朵花', empathy: 10, next: 'ending' },
              { text: '望向窗外微笑', empathy: 10, next: 'ending' }
            ]
          }
        ]
      }
    ]
  },


  thomas: {
    endings: makeEndings('易卜拉欣'),
    materials: [
      { title: '角色档案', content: '托马斯，61岁，退休工人。独居，关节炎缠身，每天最大的活动量是下楼买报纸。觉得生活无趣，怀念年轻时光。', unlocked: true },
      { title: '内心独白 #1', content: '「身体小毛病不断...但如果连"疼痛"都意味着"活着"呢？」', unlocked: false, unlockTask: 'thomas_1' },
      { title: '易卜拉欣的回声', content: '电波中的老人。他在废墟中挖出一张旧结婚照，坐在瓦砾上擦了擦照片，第一次露出了微笑。', unlocked: false, unlockTask: 'thomas_4' },
      { title: '给易卜拉欣的信', content: '「亲爱的易卜拉欣，今天我泡了一杯热茶。我想告诉你，能活到61岁，本身就是一种奇迹。」', unlocked: false, unlockTask: 'thomas_8' },
      { title: '社区故事会', content: '托马斯每天去学校给孩子们讲和平的故事。他说："我年轻时觉得未来无限，现在才知道，能回忆年轻时光就是幸运。"', unlocked: false, unlockTask: 'thomas_9' }
    ],
    acts: [
      {
        id: 'act1', title: '第一幕', subtitle: '庸常的烦恼', desc: '和平之下的无意识',
        transition: { title: '第一幕', subtitle: '庸常的烦恼', duration: 2500 },
        tasks: [
          {
            id: 'thomas_1', name: '身体困扰：关节炎与失眠', empathy: 5, clue: '线索：托马斯的药瓶', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '清晨，托马斯艰难地从床上坐起，膝盖发出咔哒声。' },
              { speaker: 'thomas', text: '身体小毛病不断，关节炎、失眠、胃疼...年轻时哪受过这罪。' },
              { speaker: 'thomas', text: '（叹气）老了就是累赘。' }
            ],
            choices: [
              { text: '艰难起身，泡杯热茶', empathy: 10, next: 'complete' },
              { text: '躺在床上继续发呆', empathy: 0, next: 'complete' }
            ]
          },
          {
            id: 'thomas_2', name: '孤独空虚：空荡荡的房间', empathy: 5, clue: '线索：托马斯的旧相册', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '托马斯坐在沙发上，电视开着却没人看。' },
              { speaker: 'thomas', text: '孤独空虚，没人说话。老伴走了五年，孩子一年回来一次。' },
              { speaker: 'thomas', text: '这房子太安静了，安静得让人害怕。' }
            ],
            choices: [
              { text: '打电话给孙子', empathy: 10, next: 'complete' },
              { text: '翻开老相册', empathy: 5, next: 'complete' }
            ]
          },
          {
            id: 'thomas_3', name: '时光追忆：怀念年轻时光', empathy: 5, clue: '线索：托马斯的奖章', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '托马斯看着墙上年轻时的照片，那是他在工厂获奖的日子。' },
              { speaker: 'thomas', text: '怀念年轻时光，现在生活无趣。那时候觉得未来无限，现在只剩一身病和空荡荡的房间。' },
              { speaker: 'thomas', text: '（抚摸照片）如果时间能倒流...' }
            ],
            choices: [
              { text: '把照片取下来仔细擦拭', empathy: 5, next: 'complete' },
              { text: '穿上外套出门走走', empathy: 10, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act2', title: '第二幕', subtitle: '电波彼岸', desc: '两种人生的残酷对照',
        transition: { title: '第二幕', subtitle: '电波彼岸', duration: 2500 },
        tasks: [
          {
            id: 'thomas_4', name: '收音机异象：废墟中的老人', empathy: 15, clue: '线索：易卜拉欣的喘息', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '收音机传来沉重的挖掘声，夹杂着老人的喘息。' },
              { speaker: 'radio_father', text: '【喘息】应该在这里...我记得放在床底下...' },
              { speaker: 'thomas', text: '这声音...是个老人？他在挖什么？' }
            ],
            choices: [
              { text: '凑近收音机', empathy: 15, next: 'complete' },
              { text: '调大音量', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'thomas_5', name: '残酷对照：抱怨病痛与瓦砾求生', empathy: 15, clue: '线索：托马斯的拐杖', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '托马斯摸着自己疼痛的膝盖，收音机里传来瓦砾滑落的声响。' },
              { speaker: 'radio_father', text: '【咳嗽】找到了...还好没被压坏...' },
              { speaker: 'thomas', text: '我抱怨膝盖疼...而他在瓦砾下找一张旧照片。' }
            ],
            choices: [
              { text: '站起来，感受双腿的力量', empathy: 15, next: 'complete' },
              { text: '沉默地握紧拐杖', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'thomas_6', name: '转折顿悟：能活到61岁就是幸运', empathy: 20, clue: '线索：托马斯的微笑', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '收音机里传来老人轻轻的笑声。' },
              { speaker: 'radio_father', text: '【微笑】你看，我们年轻时多好看。' },
              { speaker: 'thomas', text: '原来...能活到61岁，能回忆年轻时光，能坐在家里抱怨病痛——这本身就是幸运。' }
            ],
            choices: [
              { text: '对着收音机点头', empathy: 15, next: 'complete' },
              { text: '重新挂上年轻时的照片', empathy: 20, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act3', title: '第三幕', subtitle: '同一片天空', desc: '隔空的对话与共情',
        transition: { title: '第三幕', subtitle: '同一片天空', duration: 2500 },
        tasks: [
          {
            id: 'thomas_7', name: '共情行动：为易卜拉欣寻找家人', empathy: 10, clue: '线索：寻人启事', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '托马斯在网上发布寻人信息，附上易卜拉欣描述的特征。' },
              { speaker: 'thomas', text: '如果能帮他找到失散的家人...不，哪怕只是传递一句话也好。' },
              { speaker: 'thomas', text: '我终于明白，活着的意义不是等待，而是行动。' }
            ],
            choices: [
              { text: '联系国际红十字会', empathy: 15, next: 'complete' },
              { text: '在社区发起寻人活动', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'thomas_8', name: '温暖碎片：写下给易卜拉欣的信', empathy: 10, clue: '温暖碎片：托马斯的信', isFragment: true,
            dialogs: [
              { speaker: 'narrator', text: '托马斯用颤抖的手写下第一行字。' },
              { speaker: 'thomas', text: '"亲爱的易卜拉欣，今天我泡了一杯热茶。茶很烫，我等了五分钟才喝。"' },
              { speaker: 'thomas', text: '"我想告诉你，能活到61岁，能回忆年轻时光，本身就是一种奇迹。愿你早日找到你的照片。"' }
            ],
            choices: [
              { text: '把信和旧照片一起寄出', empathy: 10, fragment: true, next: 'complete' },
              { text: '在社区公告栏贴出', empathy: 10, fragment: true, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act4', title: '第四幕', subtitle: '珍惜当下', desc: '和平的答案',
        transition: { title: '第四幕', subtitle: '珍惜当下', duration: 2500 },
        tasks: [
          {
            id: 'thomas_9', name: '珍惜当下：去学校讲和平故事', empathy: 10, clue: '线索：故事会邀请函', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '托马斯站在小学讲台上，孩子们睁大眼睛看着他。' },
              { speaker: 'thomas', text: '我年轻时觉得未来无限，现在才知道，能回忆年轻时光就是幸运。' },
              { speaker: 'thomas', text: '孩子们，你们现在拥有的每一天，都是别人做梦都想要的。' }
            ],
            choices: [
              { text: '给孩子们讲收音机的故事', empathy: 15, next: 'complete' },
              { text: '教孩子们写感谢卡', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'thomas_10', name: '终极反思：我最珍惜的三件小事', empathy: 10, clue: '终极反思：托马斯的答案', isFragment: false, isFinal: true,
            dialogs: [
              { speaker: 'narrator', text: '傍晚，托马斯坐在公园长椅上，夕阳把他的白发染成金色。' },
              { speaker: 'thomas', text: '我最珍惜的三件小事——第一，热茶的温度。第二，孩子们的笑声。第三，能安稳活到今天的每一个清晨。' },
              { speaker: 'thomas', text: '谢谢你，易卜拉欣。你让我这个老头子，重新找到了活着的理由。' }
            ],
            choices: [
              { text: '对着夕阳微笑', empathy: 10, next: 'ending' },
              { text: '慢慢走回家', empathy: 10, next: 'ending' }
            ]
          }
        ]
      }
    ]
  },


  sarah: {
    endings: makeEndings('扎赫拉'),
    materials: [
      { title: '角色档案', content: '莎拉，24岁，自由职业者。收入不稳定，精神内耗严重，习惯性否定自己的生活，觉得"别人都在正轨上，只有我在漂流"。', unlocked: true },
      { title: '内心独白 #1', content: '「收入不稳定，焦虑到脱发...但如果连"焦虑"都意味着"还有选择"呢？"', unlocked: false, unlockTask: 'sarah_1' },
      { title: '扎赫拉的回声', content: '电波中的年轻母亲。她在废墟中找到一包种子，说："如果能活过今年，明年就能吃到新鲜的蔬菜了。"', unlocked: false, unlockTask: 'sarah_4' },
      { title: '给扎赫拉的信', content: '「亲爱的扎赫拉，今天我接到了一个项目。我想告诉你，能选择生活方式，本身就是一种奢侈。」', unlocked: false, unlockTask: 'sarah_8' },
      { title: '创作日志', content: '莎拉开始记录创作过程而非结果。第一页写着："今天画了三笔，每一笔都是自由的。"', unlocked: false, unlockTask: 'sarah_9' }
    ],
    acts: [
      {
        id: 'act1', title: '第一幕', subtitle: '庸常的烦恼', desc: '和平之下的无意识',
        transition: { title: '第一幕', subtitle: '庸常的烦恼', duration: 2500 },
        tasks: [
          {
            id: 'sarah_1', name: '收入焦虑：这个月房租怎么办', empathy: 5, clue: '线索：莎拉的账单', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '凌晨两点，莎拉对着电脑屏幕上的银行余额发呆。' },
              { speaker: 'sarah', text: '收入不稳定，焦虑到脱发。这个月房租怎么办？下个月呢？' },
              { speaker: 'sarah', text: '（抓头发）我是不是选错了路？' }
            ],
            choices: [
              { text: '继续赶稿', empathy: 5, next: 'complete' },
              { text: '关灯睡觉，明天再说', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'sarah_2', name: '精神内耗：习惯性否定自己', empathy: 5, clue: '线索：莎拉的便签墙', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '莎拉的墙上贴满了便利贴，每一张都写着自我否定的话。' },
              { speaker: 'sarah', text: '精神内耗严重。"我不够好""我不配""我什么都做不好"...' },
              { speaker: 'sarah', text: '（撕下一张）这些话，我每天对自己说十遍。' }
            ],
            choices: [
              { text: '把便利贴换成鼓励的话', empathy: 10, next: 'complete' },
              { text: '全部撕掉扔进垃圾桶', empathy: 5, next: 'complete' }
            ]
          },
          {
            id: 'sarah_3', name: '存在否定：觉得生活毫无价值', empathy: 5, clue: '线索：莎拉的草稿本', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '莎拉看着自己的画稿，突然全部揉成一团。' },
              { speaker: 'sarah', text: '习惯性否定自己的生活。别人都在正轨上，只有我在漂流。' },
              { speaker: 'sarah', text: '我的存在有什么价值？' }
            ],
            choices: [
              { text: '把揉皱的纸展开', empathy: 10, next: 'complete' },
              { text: '重新画一张', empathy: 5, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act2', title: '第二幕', subtitle: '电波彼岸', desc: '两种人生的残酷对照',
        transition: { title: '第二幕', subtitle: '电波彼岸', duration: 2500 },
        tasks: [
          {
            id: 'sarah_4', name: '收音机异象：废墟中的种子', empathy: 15, clue: '线索：扎赫拉的声音', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '收音机传来微弱的翻动声，像是在泥土中摸索。' },
              { speaker: 'radio_mother', text: '【惊喜】找到了！种子还在！' },
              { speaker: 'radio_child', text: '【小声】妈妈，我们能种吗？' },
              { speaker: 'radio_mother', text: '【坚定】能。如果能活过今年，明年就能吃到新鲜的蔬菜了。' },
              { speaker: 'sarah', text: '...种子？她在废墟里找种子？而我还在抱怨收入？' }
            ],
            choices: [
              { text: '静静听，眼眶发热', empathy: 15, next: 'complete' },
              { text: '记下她的话', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'sarah_5', name: '残酷对照：否定生活与废墟种花', empathy: 15, clue: '线索：莎拉的画笔', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '莎拉看着自己丢弃的画稿，又想起收音机里的声音。' },
              { speaker: 'sarah', text: '我否定自己的生活...而扎赫拉在废墟里种花。' },
              { speaker: 'sarah', text: '（颤抖）她连明天能不能活都不知道，却在计划明年。' }
            ],
            choices: [
              { text: '把画稿重新铺平', empathy: 15, next: 'complete' },
              { text: '在画纸上画一朵花', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'sarah_6', name: '转折顿悟：能选择生活方式，已是奢侈', empathy: 20, clue: '线索：莎拉的觉醒', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '电波中传来女孩问："妈妈，和平的地方也有烦恼吗？"' },
              { speaker: 'radio_mother', text: '【温柔】有的。她们会为了选择烦恼，就像我们为了生存烦恼。' },
              { speaker: 'sarah', text: '原来...能为选择烦恼，说明我有选择的权利。能否定自己的生活，说明我还有生活。' }
            ],
            choices: [
              { text: '拥抱自己的画稿', empathy: 20, next: 'complete' },
              { text: '对着镜子说"我值得"', empathy: 15, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act3', title: '第三幕', subtitle: '同一片天空', desc: '隔空的对话与共情',
        transition: { title: '第三幕', subtitle: '同一片天空', duration: 2500 },
        tasks: [
          {
            id: 'sarah_7', name: '共情行动：为扎赫拉捐赠种子和工具', empathy: 10, clue: '线索：种子包裹', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '莎拉在网上订购了耐旱蔬菜和园艺工具。' },
              { speaker: 'sarah', text: '这些种子在和平世界是普通的，但在她那里是希望。' },
              { speaker: 'sarah', text: '我要画一张说明书，让她知道怎么种。' }
            ],
            choices: [
              { text: '手绘种植说明书', empathy: 15, next: 'complete' },
              { text: '附上自己的画作', empathy: 10, next: 'complete' }
            ]
          },
          {
            id: 'sarah_8', name: '温暖碎片：写下给扎赫拉的信', empathy: 10, clue: '温暖碎片：莎拉的信', isFragment: true,
            dialogs: [
              { speaker: 'narrator', text: '莎拉在信纸上画了一棵破土而出的小苗。' },
              { speaker: 'sarah', text: '"亲爱的扎赫拉，今天我接到了一个项目。我想告诉你，能选择生活方式，本身就是一种奢侈。"' },
              { speaker: 'sarah', text: '"你教会我，希望不是等来的，是种出来的。"' }
            ],
            choices: [
              { text: '把信折成纸飞机', empathy: 10, fragment: true, next: 'complete' },
              { text: '贴在画框里一起捐赠', empathy: 10, fragment: true, next: 'complete' }
            ]
          }
        ]
      },
      {
        id: 'act4', title: '第四幕', subtitle: '珍惜当下', desc: '和平的答案',
        transition: { title: '第四幕', subtitle: '珍惜当下', duration: 2500 },
        tasks: [
          {
            id: 'sarah_9', name: '珍惜当下：记录创作过程而非结果', empathy: 10, clue: '线索：创作日志', isFragment: false,
            dialogs: [
              { speaker: 'narrator', text: '莎拉打开新的笔记本，第一页写着："今天画了三笔，每一笔都是自由的。"' },
              { speaker: 'sarah', text: '我不再否定自己了。过程本身就是价值。' },
              { speaker: 'sarah', text: '扎赫拉在废墟里种花，我在和平里画画——我们都在创造。' }
            ],
            choices: [
              { text: '继续画完今天的三笔', empathy: 10, next: 'complete' },
              { text: '把日志分享到社交媒体', empathy: 15, next: 'complete' }
            ]
          },
          {
            id: 'sarah_10', name: '终极反思：我最珍惜的三件小事', empathy: 10, clue: '终极反思：莎拉的答案', isFragment: false, isFinal: true,
            dialogs: [
              { speaker: 'narrator', text: '莎拉坐在画架前，窗外是城市的灯火。' },
              { speaker: 'sarah', text: '我最珍惜的三件小事——第一，能自由创作的夜晚。第二，画错一笔还能修改的奢侈。第三，知道明天还能选择。' },
              { speaker: 'sarah', text: '谢谢你，扎赫拉。你让我从废墟中，种出了我自己的花园。' }
            ],
            choices: [
              { text: '在画布上签下名字', empathy: 10, next: 'ending' },
              { text: '望向窗外微笑', empathy: 10, next: 'ending' }
            ]
          }
        ]
      }
    ]
  }
};

// ========== 辅助函数 ==========
function getRoleData(roleId) {
  return ROLE_DATA[roleId] || ROLE_DATA.lili;
}

function getCurrentAct(roleId) {
  const data = getRoleData(roleId);
  return data.acts[currentActIndex] || data.acts[0];
}

function getCurrentTask(roleId) {
  const act = getCurrentAct(roleId);
  return act.tasks[currentTaskIndex] || null;
}

function getAllTasks(roleId) {
  const data = getRoleData(roleId);
  const tasks = [];
  data.acts.forEach((act, idx) => {
    act.tasks.forEach((task, tidx) => {
      task.actIndex = idx;
      task.actTitle = act.title;
      tasks.push(task);
    });
  });
  return tasks;
}

function getCompletedTasks(roleId) {
  return getAllTasks(roleId).filter(t => GS.clues.includes(t.clue));
}

function getUnlockedTasks(roleId) {
  const all = getAllTasks(roleId);
  const completed = getCompletedTasks(roleId);
  const nextIdx = completed.length;
  return all.map((t, idx) => {
    t.isUnlocked = idx <= nextIdx;
    t.isCompleted = GS.clues.includes(t.clue);
    return t;
  });
}

function getNextUnlockedTask(roleId) {
  const unlocked = getUnlockedTasks(roleId);
  for (let t of unlocked) {
    if (!t.isCompleted) return t;
  }
  return null;
}

function isActUnlocked(roleId, actIdx) {
  const data = getRoleData(roleId);
  let completedBefore = 0;
  for (let i = 0; i < actIdx; i++) {
    completedBefore += data.acts[i].tasks.length;
  }
  const completedTotal = getCompletedTasks(roleId).length;
  return completedTotal >= completedBefore;
}

function getMaterialProgress(roleId) {
  const data = getRoleData(roleId);
  return data.materials.map(m => {
    m.isUnlocked = m.unlocked || (m.unlockTask && GS.clues.some(c => c.includes(m.unlockTask.split('_')[1]) && c.includes(roleId)));
    if (m.unlockTask && GS.clues.includes(getAllTasks(roleId).find(t => t.id === m.unlockTask)?.clue)) {
      m.isUnlocked = true;
    }
    return m;
  });
}


// ========== 初始化 ==========
let inited = false;
wx.onShow(() => { if (!inited) { inited = true; init(); } });

function init() {
  try {
    canvas = wx.createCanvas();
    ctx = canvas.getContext('2d');
    const info = wx.getSystemInfoSync();
    W = info.screenWidth;
    H = info.screenHeight;
    dpr = info.pixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    ['bg_title', 'bg_main', 'bg_dialog', 'bg_task'].forEach(id => {
      const img = wx.createImage();
      img.src = 'images/' + id + '.jpg';
      img.onload = () => { GS.bgImages[id] = img; GS.bgLoaded[id] = true; };
    });

    ['lili', 'jake', 'amy', 'thomas', 'sarah'].forEach(id => {
      const img = wx.createImage();
      img.src = 'images/role_' + id + '.jpg';
      img.onload = () => { GS.roleImages[id] = img; GS.roleLoaded[id] = true; };
    });

    // 标题/选角界面BGM
    try {
      const titleBgm = wx.createInnerAudioContext();
      titleBgm.src = 'audio/bgm.mp3';
      titleBgm.loop = true;
      titleBgm.volume = 0.5;
      GS.titleBgm = titleBgm;

      // 游戏内BGM
      const gameBgm = wx.createInnerAudioContext();
      gameBgm.src = 'audio/game_bgm.mp3';
      gameBgm.loop = true;
      gameBgm.volume = 0.5;
      GS.gameBgm = gameBgm;

      // 默认播放标题BGM
      titleBgm.play();
      GS.bgmPlaying = 'title';
    } catch(e) {
      console.warn('BGM加载失败:', e);
    }

    wx.onTouchStart(handleTouchStart);
    wx.onTouchMove(handleTouchMove);
    wx.onTouchEnd(handleTouchEnd);
    render();
  } catch(e) { console.error(e); }
}

// ========== 渲染主循环 ==========
function render() {
  ctx.clearRect(0, 0, W, H);
  GS.buttons = [];

  // 处理过渡动画
  if (GS.transitionTimer > 0) {
    renderTransition();
    GS.transitionTimer -= 16;
    if (GS.transitionTimer <= 0) {
      GS.transitionTimer = 0;
      if (GS.transitionData && GS.transitionData.onComplete) {
        GS.transitionData.onComplete();
        GS.transitionData = null;
      }
    }
    requestAnimationFrame(render);
    return;
  }

  switch(currentScene) {
    case 'title': renderTitle(); break;
    case 'roleSelect': renderRoleSelect(); break;
    case 'main': renderMain(); break;
    case 'dialog': renderDialog(); break;
    case 'ending': renderEnding(); break;
  }

  if (GS.showPopup) renderPopup();
  requestAnimationFrame(render);
}

function drawCoverImage(img) {
  if (!img) return;
  const ratio = img.width / img.height;
  const sr = W / H;
  let sx, sy, sw, sh;
  if (ratio > sr) {
    sh = img.height; sw = img.height * sr;
    sx = (img.width - sw) / 2; sy = 0;
  } else {
    sw = img.width; sh = img.width / sr;
    sx = 0; sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
}

// ========== 过渡动画：幕间艺术字 ==========
function startTransition(title, subtitle, duration, onComplete) {
  GS.transitionTimer = duration;
  GS.transitionData = { title, subtitle, duration, onComplete };
}

function renderTransition() {
  const data = GS.transitionData;
  const progress = GS.transitionTimer / data.duration;

  // 背景
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, W, H);

  // 战争废墟背景（半透明）
  if (GS.bgLoaded['bg_dialog'] && GS.bgImages['bg_dialog']) {
    ctx.globalAlpha = 0.3;
    drawCoverImage(GS.bgImages['bg_dialog']);
    ctx.globalAlpha = 1.0;
  }

  // 暗角效果
  const gradient = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)/2);
  gradient.addColorStop(0, 'rgba(10,10,20,0)');
  gradient.addColorStop(1, 'rgba(10,10,20,0.9)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // 计算透明度：渐入 -> 停留 -> 渐出
  let alpha = 1;
  if (progress > 0.7) {
    alpha = (1 - progress) / 0.3;
  } else if (progress < 0.1) {
    alpha = progress / 0.1;
  }
  alpha = Math.max(0, Math.min(1, alpha));

  ctx.globalAlpha = alpha;

  // 主标题 - 艺术字
  const titleSize = Math.max(48, H * 0.12);
  ctx.save();
  ctx.shadowColor = 'rgba(201, 168, 76, 0.8)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = C.gold;
  ctx.font = 'bold ' + titleSize + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.title, W / 2, H / 2 - titleSize * 0.3);
  ctx.restore();

  // 副标题
  const subSize = Math.max(20, H * 0.04);
  ctx.fillStyle = C.textGray;
  ctx.font = subSize + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.subtitle, W / 2, H / 2 + titleSize * 0.4);

  // 装饰线
  const lineY = H / 2 + titleSize * 0.7;
  const lineW = Math.min(200, W * 0.3);
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 2;
  ctx.globalAlpha = alpha * 0.5;
  ctx.beginPath();
  ctx.moveTo(W/2 - lineW/2, lineY);
  ctx.lineTo(W/2 + lineW/2, lineY);
  ctx.stroke();

  ctx.globalAlpha = 1.0;
}


// ========== 标题页 ==========
function renderTitle() {
  if (GS.bgLoaded['bg_title'] && GS.bgImages['bg_title']) {
    drawCoverImage(GS.bgImages['bg_title']);
    ctx.fillStyle = 'rgba(10, 10, 20, 0.55)';
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
  }

  const btnW = Math.min(280, W * 0.35);
  const btnH = Math.max(50, H * 0.08);
  const btnX = W / 2 - btnW / 2;
  const btnY = H * 0.78;

  const grad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
  grad.addColorStop(0, 'rgba(180, 40, 40, 0.95)');
  grad.addColorStop(1, 'rgba(120, 20, 20, 0.95)');
  ctx.fillStyle = grad;
  roundRect(btnX, btnY, btnW, btnH, 6);
  ctx.fill();

  ctx.strokeStyle = 'rgba(220, 100, 100, 0.6)';
  ctx.lineWidth = 2;
  roundRect(btnX, btnY, btnW, btnH, 6);
  ctx.stroke();

  ctx.fillStyle = C.white;
  ctx.font = 'bold ' + Math.max(18, H * 0.035) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('开始游戏', btnX + btnW / 2, btnY + btnH / 2);
  ctx.textBaseline = 'alphabetic';

  GS.buttons.push({ x: btnX, y: btnY, w: btnW, h: btnH, action: 'startGame' });
}

// ========== 角色选择 ==========
function renderRoleSelect() {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const startY = H * 0.04;

  ctx.fillStyle = C.gold;
  ctx.font = 'bold ' + Math.max(20, H * 0.038) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('选择你的角色', cx, startY);

  ctx.fillStyle = C.textGray;
  ctx.font = Math.max(12, H * 0.022) + 'px sans-serif';
  ctx.fillText('左右滑动切换 · 点击卡片确认选择', cx, startY + H * 0.05);

  const roles = Object.values(ROLES);
  const role = roles[roleSelectIndex];

  const cardW = Math.min(300, W * 0.72);
  const cardH = H * 0.52;
  const cardX = (W - cardW) / 2;
  const cardY = startY + H * 0.07;

  GS.buttons.push({ x: cardX, y: cardY, w: cardW, h: cardH, action: 'selectRole', role: role.id });

  drawPanel(cardX, cardY, cardW, cardH, C.panel);

  const imgW = Math.min(cardW * 0.5, H * 0.2);
  const imgH = imgW * 1.2;
  const imgX = cx - imgW / 2;
  const imgY = cardY + H * 0.02;

  ctx.save();
  ctx.beginPath();
  roundRect(imgX, imgY, imgW, imgH, 10);
  ctx.closePath();
  ctx.clip();

  if (GS.roleLoaded[role.id] && GS.roleImages[role.id]) {
    const img = GS.roleImages[role.id];
    const ratio = img.width / img.height;
    const boxRatio = imgW / imgH;
    let sx, sy, sw, sh;
    if (ratio > boxRatio) {
      sh = img.height;
      sw = img.height * boxRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = img.width / boxRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, imgX, imgY, imgW, imgH);
  } else {
    ctx.fillStyle = C.bg2;
    ctx.fillRect(imgX, imgY, imgW, imgH);
    ctx.fillStyle = C.textGray;
    ctx.font = Math.max(30, H * 0.06) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(role.icon, cx, imgY + imgH / 2);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();

  const infoY = imgY + imgH + H * 0.025;

  ctx.fillStyle = role.color;
  ctx.font = 'bold ' + Math.max(18, H * 0.035) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(role.name, cx, infoY);

  ctx.fillStyle = C.white;
  ctx.font = Math.max(13, H * 0.024) + 'px sans-serif';
  ctx.fillText(role.title + ' · ' + role.age + '岁', cx, infoY + H * 0.04);

  ctx.fillStyle = C.textGray;
  ctx.font = Math.max(12, H * 0.022) + 'px sans-serif';
  const startAnxietyY = infoY + H * 0.07;

  // 获取角色焦虑描述
  const anxieties = {
    lili: ['育儿压力太大，工资又微薄', '每天重复同样的事，生活好枯燥', '羡慕别人过得好，自己只剩疲惫'],
    jake: ['加班频繁，通勤累到崩溃', '升职遥遥无期，焦虑到失眠', '城市太拥挤，活着毫无意义'],
    amy: ['学业压力快把我压垮', '容貌焦虑、社交内耗', '对未来迷茫，觉得自己一无所有'],
    thomas: ['身体小毛病不断', '孤独空虚，没人说话', '怀念年轻时光，现在生活无趣'],
    sarah: ['收入不稳定，焦虑到脱发', '精神内耗严重', '习惯性否定自己的生活']
  };
  const roleAnxieties = anxieties[role.id] || [];
  roleAnxieties.forEach((anxiety, idx) => {
    ctx.fillText('· ' + anxiety, cx, startAnxietyY + idx * H * 0.035);
  });

  const dotRadius = Math.max(5, H * 0.01);
  const dotGap = Math.max(18, W * 0.04);
  const dotsTotalW = roles.length * dotGap;
  const dotsStartX = cx - dotsTotalW / 2 + dotGap / 2;
  roles.forEach((_, idx) => {
    ctx.beginPath();
    ctx.arc(dotsStartX + idx * dotGap, cardY + cardH + H * 0.025, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = idx === roleSelectIndex ? C.gold : C.textDark;
    ctx.fill();
  });

  ctx.fillStyle = C.textDark;
  ctx.font = Math.max(11, H * 0.02) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('← 滑动切换角色 · 点击卡片确认选择 →', cx, H * 0.96);
}


// ========== 主界面 ==========
function renderMain() {
  const headerH = H * 0.08;
  const sidebarW = W * 0.18;

  // 背景
  const bgId = 'bg_main';
  if (GS.bgLoaded[bgId] && GS.bgImages[bgId]) {
    drawCoverImage(GS.bgImages[bgId]);
    ctx.fillStyle = 'rgba(10, 10, 20, 0.65)';
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
  }

  drawHeader(headerH);
  drawNavSidebar(sidebarW, headerH);

  const contentX = sidebarW;
  const contentY = headerH;
  const contentW = W - sidebarW;
  const contentH = H - headerH;

  // 内容区域背景
  if (GS.bgLoaded['bg_task'] && GS.bgImages['bg_task']) {
    const img = GS.bgImages['bg_task'];
    const ratio = img.width / img.height;
    const boxRatio = contentW / contentH;
    let sx, sy, sw, sh;
    if (ratio > boxRatio) {
      sh = img.height;
      sw = img.height * boxRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = img.width / boxRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, contentX, contentY, contentW, contentH);
    ctx.fillStyle = 'rgba(10, 10, 20, 0.7)';
    ctx.fillRect(contentX, contentY, contentW, contentH);
  }

  if (GS.sidebarTab === 'task') {
    renderTaskContent(contentX, contentY, contentW, contentH);
  } else if (GS.sidebarTab === 'clue') {
    renderClueContent(contentX, contentY, contentW, contentH);
  } else if (GS.sidebarTab === 'material') {
    renderMaterialContent(contentX, contentY, contentW, contentH);
  }
}

function drawHeader(h) {
  ctx.fillStyle = C.headerBg;
  ctx.fillRect(0, 0, W, h);

  ctx.fillStyle = C.textGray;
  ctx.font = Math.max(10, H * 0.018) + 'px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('剧情进度', W * 0.02, h * 0.35);

  const totalTasks = getAllTasks(playerRole).length;
  const completedTasks = getCompletedTasks(playerRole).length;
  const progress = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : '0';

  ctx.fillStyle = C.gold;
  ctx.font = 'bold ' + Math.max(14, H * 0.025) + 'px sans-serif';
  ctx.fillText(progress + '%', W * 0.02, h * 0.7);

  ctx.fillStyle = C.progressBar;
  roundRect(W * 0.12, h * 0.45, W * 0.2, h * 0.2, 4);
  ctx.fill();
  ctx.fillStyle = C.red;
  roundRect(W * 0.12, h * 0.45, W * 0.2 * (progress / 100), h * 0.2, 4);
  ctx.fill();

  ctx.fillStyle = C.textGray;
  ctx.font = Math.max(10, H * 0.018) + 'px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('共情指数', W * 0.38, h * 0.35);
  ctx.fillStyle = C.gold;
  ctx.font = 'bold ' + Math.max(14, H * 0.025) + 'px sans-serif';
  ctx.fillText(empathyScore, W * 0.38, h * 0.7);

  ctx.fillStyle = C.textGray;
  ctx.font = Math.max(10, H * 0.018) + 'px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('温暖碎片', W * 0.55, h * 0.35);
  ctx.fillStyle = C.gold;
  ctx.font = 'bold ' + Math.max(14, H * 0.025) + 'px sans-serif';
  ctx.fillText(warmFragments, W * 0.55, h * 0.7);

  const data = getRoleData(playerRole);
  const act = getCurrentAct(playerRole);
  ctx.fillStyle = C.gold;
  ctx.font = Math.max(12, H * 0.022) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(act.title + ' ' + act.subtitle, W * 0.75, h * 0.55);

  ctx.fillStyle = C.redLight;
  ctx.font = Math.max(11, H * 0.02) + 'px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('⏱ 电波剩余：未知', W * 0.98, h * 0.55);
}

function drawNavSidebar(w, topH) {
  ctx.fillStyle = C.sidebarBg;
  ctx.fillRect(0, topH, w, H - topH);

  const tabs = [
    { id: 'task', name: '任务', icon: '📋', count: getUnlockedTasks(playerRole).filter(t => !t.isCompleted && t.isUnlocked).length },
    { id: 'clue', name: '线索', icon: '🔍', count: GS.clues.length },
    { id: 'material', name: '资料', icon: '📁', count: getMaterialProgress(playerRole).filter(m => m.isUnlocked).length }
  ];

  const itemH = (H - topH) / tabs.length;

  tabs.forEach((tab, idx) => {
    const y = topH + idx * itemH;
    const isActive = GS.sidebarTab === tab.id;

    if (isActive) {
      ctx.fillStyle = C.sidebarActive;
      ctx.fillRect(0, y, w, itemH);
    }

    ctx.fillStyle = isActive ? C.gold : C.textGray;
    ctx.font = Math.max(16, H * 0.03) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tab.icon, w / 2, y + itemH * 0.35);

    ctx.fillStyle = isActive ? C.white : C.textGray;
    ctx.font = Math.max(11, H * 0.02) + 'px sans-serif';
    ctx.fillText(tab.name, w / 2, y + itemH * 0.6);

    if (tab.count > 0) {
      ctx.fillStyle = C.red;
      ctx.beginPath();
      ctx.arc(w * 0.7, y + itemH * 0.25, Math.max(8, H * 0.015), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.white;
      ctx.font = 'bold ' + Math.max(9, H * 0.015) + 'px sans-serif';
      ctx.fillText(tab.count, w * 0.7, y + itemH * 0.25 + 3);
    }

    GS.buttons.push({ x: 0, y: y, w: w, h: itemH, action: 'switchTab', tab: tab.id });
  });
}


function renderTaskContent(x, y, w, h) {
  const pad = W * 0.015;

  ctx.fillStyle = C.gold;
  ctx.font = 'bold ' + Math.max(14, H * 0.025) + 'px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('任务列表（按顺序解锁，完成当前任务才能继续）', x + pad, y + H * 0.06);

  const taskH = H * 0.1;
  const gap = H * 0.015;
  const tasks = getUnlockedTasks(playerRole);

  tasks.forEach((task, idx) => {
    const ty = y + H * 0.1 + idx * (taskH + gap);
    if (ty + taskH > y + h) return;

    const isCompleted = task.isCompleted;
    const isUnlocked = task.isUnlocked;
    const isCurrent = !isCompleted && isUnlocked;

    // 背景色
    let panelColor;
    if (isCompleted) panelColor = 'rgba(30,35,50,0.6)';
    else if (isCurrent) panelColor = 'rgba(20,25,40,0.95)';
    else panelColor = 'rgba(20,25,40,0.4)';

    drawPanel(x + pad, ty, w - pad * 2, taskH, panelColor);

    // 如果是当前可执行任务，加金色边框
    if (isCurrent) {
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 2;
      roundRect(x + pad, ty, w - pad * 2, taskH, 8);
      ctx.stroke();
    }

    // 状态圆点
    ctx.fillStyle = isCompleted ? C.green : (isCurrent ? C.gold : C.textDark);
    ctx.beginPath();
    ctx.arc(x + pad * 3, ty + taskH / 2, Math.max(6, H * 0.01), 0, Math.PI * 2);
    ctx.fill();

    // 任务名
    ctx.fillStyle = isCompleted ? C.textDark : (isCurrent ? C.text : C.textGray);
    ctx.font = Math.max(12, H * 0.022) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(task.name, x + pad * 5, ty + taskH * 0.4);

    // 标签
    ctx.fillStyle = isCompleted ? C.textDark : C.textGray;
    ctx.font = Math.max(10, H * 0.018) + 'px sans-serif';
    let tag = '';
    if (task.isFinal) tag = '【终极反思】';
    else if (task.isFragment) tag = '【温暖碎片】';
    else if (!isUnlocked) tag = '【未解锁】';
    else if (isCurrent) tag = '【当前任务】';

    ctx.fillText(tag + (isCompleted ? '已完成' : (isCurrent ? '点击执行' : '完成前置任务后解锁')), x + pad * 5, ty + taskH * 0.7);

    // 执行按钮（仅当前可执行）
    if (isCurrent) {
      const btnW = Math.max(50, W * 0.08);
      const btnH = Math.max(24, H * 0.04);
      const btnX = x + w - pad * 2 - btnW;
      const btnY = ty + (taskH - btnH) / 2;
      ctx.fillStyle = 'rgba(45, 138, 94, 0.8)';
      roundRect(btnX, btnY, btnW, btnH, 4);
      ctx.fill();
      ctx.fillStyle = C.white;
      ctx.font = Math.max(10, H * 0.018) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('执行', btnX + btnW / 2, btnY + btnH / 2 + 4);
      ctx.textBaseline = 'alphabetic';
      GS.buttons.push({ x: btnX, y: btnY, w: btnW, h: btnH, action: 'doTask', taskId: task.id });
    }
  });
}

function renderClueContent(x, y, w, h) {
  const pad = W * 0.015;
  ctx.fillStyle = C.gold;
  ctx.font = 'bold ' + Math.max(14, H * 0.025) + 'px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('已收集线索', x + pad, y + H * 0.06);

  if (GS.clues.length === 0) {
    ctx.fillStyle = C.textGray;
    ctx.font = Math.max(12, H * 0.022) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('暂无线索，请继续推进剧情', x + w / 2, y + h / 2);
    return;
  }

  const clueH = H * 0.12;
  const gap = H * 0.015;
  GS.clues.forEach((clue, idx) => {
    const cy = y + H * 0.1 + idx * (clueH + gap);
    if (cy + clueH > y + h) return;
    drawPanel(x + pad, cy, w - pad * 2, clueH, C.panel);
    ctx.fillStyle = C.gold;
    ctx.font = 'bold ' + Math.max(12, H * 0.022) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('线索 #' + (idx + 1), x + pad * 2, cy + clueH * 0.3);
    ctx.fillStyle = C.text;
    ctx.font = Math.max(11, H * 0.02) + 'px sans-serif';
    ctx.fillText(clue, x + pad * 2, cy + clueH * 0.65);
  });
}

function renderMaterialContent(x, y, w, h) {
  const pad = W * 0.015;
  ctx.fillStyle = C.gold;
  ctx.font = 'bold ' + Math.max(14, H * 0.025) + 'px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('人物资料（随任务解锁）', x + pad, y + H * 0.06);

  const materials = getMaterialProgress(playerRole);
  const cardH = H * 0.18;
  const gap = H * 0.015;

  materials.forEach((mat, idx) => {
    const ry = y + H * 0.1 + idx * (cardH + gap);
    if (ry + cardH > y + h) return;

    const isUnlocked = mat.isUnlocked;
    drawPanel(x + pad, ry, w - pad * 2, cardH, isUnlocked ? C.panel : 'rgba(20,25,40,0.4)');

    if (!isUnlocked) {
      ctx.fillStyle = C.textDark;
      ctx.font = Math.max(14, H * 0.025) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔒 完成相关任务后解锁', x + w / 2, ry + cardH / 2);
      return;
    }

    ctx.fillStyle = C.gold;
    ctx.font = 'bold ' + Math.max(13, H * 0.023) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(mat.title, x + pad * 2, ry + cardH * 0.25);

    ctx.fillStyle = C.text;
    ctx.font = Math.max(11, H * 0.02) + 'px sans-serif';
    wrapText(mat.content, x + pad * 2, ry + cardH * 0.45, w - pad * 4, H * 0.032);
  });
}


// ========== 对话场景（重构：底部1/4居中放大，点击对话框继续） ==========
function renderDialog() {
  // 战争废墟背景（全屏）
  if (GS.bgLoaded['bg_dialog'] && GS.bgImages['bg_dialog']) {
    drawCoverImage(GS.bgImages['bg_dialog']);
    ctx.fillStyle = 'rgba(10, 10, 20, 0.75)';
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
  }

  // 返回按钮
  const backSize = Math.max(36, H * 0.06);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.arc(backSize, backSize, backSize * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.white;
  ctx.font = 'bold ' + Math.max(16, H * 0.03) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('←', backSize, backSize);
  ctx.textBaseline = 'alphabetic';
  GS.buttons.push({ x: 0, y: 0, w: backSize * 2, h: backSize * 2, action: 'backToMain' });

  // 当前任务信息
  const currentTask = getCurrentTask(playerRole);
  if (!currentTask) {
    currentScene = 'main';
    return;
  }

  const act = getCurrentAct(playerRole);

  // 幕标题（顶部）
  ctx.fillStyle = C.gold;
  ctx.font = 'bold ' + Math.max(14, H * 0.025) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(act.title + ' · ' + act.subtitle, W / 2, H * 0.06);

  // 任务进度
  const allTasks = getAllTasks(playerRole);
  const taskIdx = allTasks.findIndex(t => t.id === currentTask.id);
  ctx.fillStyle = C.textGray;
  ctx.font = Math.max(11, H * 0.02) + 'px sans-serif';
  ctx.fillText('任务 ' + (taskIdx + 1) + '/' + allTasks.length, W / 2, H * 0.1);

  // 对话内容区域：底部1/4，居中放大
  const dialogAreaY = H * 0.72;  // 从72%高度开始（底部约28%）
  const dialogAreaH = H * 0.28;
  const pad = W * 0.05;

  // 对话背景面板
  const panelX = pad;
  const panelY = dialogAreaY + H * 0.02;
  const panelW = W - pad * 2;
  const panelH = dialogAreaH - H * 0.04;
  drawPanel(panelX, panelY, panelW, panelH, 'rgba(20, 25, 40, 0.85)');

  const dialogs = currentTask.dialogs;
  const current = dialogs[currentDialogIndex];

  if (!current) {
    currentDialogIndex = 0;
    return;
  }

  // 说话人名称
  let speakerName = '';
  let speakerColor = C.text;
  if (current.speaker === 'narrator') { speakerName = '旁白'; speakerColor = C.gold; }
  else if (current.speaker === 'radio_mother') { speakerName = '【电波】母亲'; speakerColor = '#d4a574'; }
  else if (current.speaker === 'radio_child') { speakerName = '【电波】孩子'; speakerColor = '#c47a9e'; }
  else if (current.speaker === 'radio_father') { speakerName = '【电波】父亲'; speakerColor = '#6b8cae'; }
  else if (current.speaker === 'radio') { speakerName = '【电波】'; speakerColor = C.textGray; }
  else if (ROLES[current.speaker]) { speakerName = ROLES[current.speaker].name; speakerColor = ROLES[current.speaker].color; }

  const textStartY = dialogAreaY + H * 0.06;

  if (speakerName) {
    ctx.fillStyle = speakerColor;
    ctx.font = 'bold ' + Math.max(16, H * 0.028) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(speakerName, pad * 2, textStartY);
  }

  // 正文 - 放大居中
  ctx.fillStyle = C.text;
  ctx.font = Math.max(18, H * 0.032) + 'px sans-serif';
  ctx.textAlign = 'left';

  const textMaxW = W - pad * 4;
  const lineHeight = H * 0.055;
  const textStartX = pad * 2;
  const textContentY = textStartY + H * 0.05;

  wrapText(current.text, textStartX, textContentY, textMaxW, lineHeight);

  // 点击对话框区域继续（如果不是最后一条对话）
  if (currentDialogIndex < dialogs.length - 1) {
    // 整个对话框区域可点击
    GS.buttons.push({ x: panelX, y: panelY, w: panelW, h: panelH, action: 'nextDialog' });

    // 提示文字
    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.font = Math.max(11, H * 0.018) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('点击对话框继续 →', W / 2, panelY + panelH - H * 0.015);
  } else {
    // 选择分支 - 重新布局防止超出屏幕
    const choices = currentTask.choices;
    const choiceH = Math.max(40, H * 0.058);
    const choiceGap = H * 0.01;
    const totalH = choices.length * choiceH + (choices.length - 1) * choiceGap;

    // 计算起始Y：确保所有选项在屏幕内，从对话框上方开始排列
    const maxStartY = H * 0.68 - totalH;  // 不能低于对话框顶部
    const minStartY = H * 0.15;  // 不能太靠上
    const startY = Math.max(minStartY, Math.min(maxStartY, H * 0.35));

    // 标题
    ctx.fillStyle = C.gold;
    ctx.font = 'bold ' + Math.max(13, H * 0.022) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('—— 你的选择 ——', W / 2, startY - H * 0.02);

    choices.forEach((choice, idx) => {
      const cy = startY + idx * (choiceH + choiceGap);
      const btnW = Math.min(480, W * 0.82);
      const btnX = W / 2 - btnW / 2;

      drawPanel(btnX, cy, btnW, choiceH, C.panel);
      ctx.strokeStyle = idx === 0 ? C.gold : C.panelBorder;
      ctx.lineWidth = 2;
      roundRect(btnX, cy, btnW, choiceH, 8);
      ctx.stroke();

      ctx.fillStyle = C.text;
      ctx.font = Math.max(13, H * 0.024) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(choice.text, W / 2, cy + choiceH / 2);
      ctx.textBaseline = 'alphabetic';

      GS.buttons.push({ x: btnX, y: cy, w: btnW, h: choiceH, action: 'makeChoice', choice: idx });
    });
  }
}

// ========== 结局 ==========
function renderEnding() {
  const role = ROLES[playerRole];
  const data = getRoleData(playerRole);
  const completedTasks = getCompletedTasks(playerRole).length;
  const totalTasks = getAllTasks(playerRole).length;

  let endingKey = 'D';
  if (empathyScore >= 100 && completedTasks >= totalTasks && warmFragments >= 1) {
    endingKey = 'E';
  } else if (empathyScore >= 90 && completedTasks >= totalTasks) {
    endingKey = 'A';
  } else if (empathyScore >= 70 && completedTasks >= 8) {
    endingKey = 'B';
  } else if (empathyScore >= 50 && completedTasks >= 5) {
    endingKey = 'C';
  }

  const personalEnding = data.endings[endingKey];

  // 全员结局判定（基于当前角色温暖碎片）
  let globalEnding = '';
  if (warmFragments >= 1) {
    globalEnding = '✨ 彩蛋希望结局：在平行的另一端，因为无数人的善意共鸣，那一家人平安度过了今天的危机。他们继续守着微弱的希望，等待和平降临。';
  } else if (empathyScore >= 50) {
    globalEnding = '🌸 普通结局：你不知道彼岸一家人后来怎么样了。但你知道，从今天开始，你会更珍惜自己的生活。';
  } else {
    globalEnding = '😔 现实结局：电波断了，故事结束了。生活还要继续。或许你会忘记，或许不会。但有些东西，已经在你心里悄悄改变了。';
  }

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // 战争废墟背景（半透明）
  if (GS.bgLoaded['bg_dialog'] && GS.bgImages['bg_dialog']) {
    ctx.globalAlpha = 0.2;
    drawCoverImage(GS.bgImages['bg_dialog']);
    ctx.globalAlpha = 1.0;
  }

  const boxW = Math.min(520, W * 0.85);
  const boxH = H * 0.65;
  const boxX = W / 2 - boxW / 2;
  const boxY = H * 0.08;

  drawPanel(boxX, boxY, boxW, boxH, C.panel);

  // 个人结局
  ctx.fillStyle = C.gold;
  ctx.font = 'bold ' + Math.max(20, H * 0.04) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📜 ' + personalEnding.title, W / 2, boxY + H * 0.06);

  ctx.fillStyle = role.color;
  ctx.font = Math.max(13, H * 0.024) + 'px sans-serif';
  ctx.fillText(role.name + ' · ' + role.title + ' · 共情度 ' + empathyScore + ' · 完成 ' + completedTasks + '/' + totalTasks + ' 任务', W / 2, boxY + H * 0.11);

  ctx.fillStyle = C.text;
  ctx.font = Math.max(14, H * 0.026) + 'px sans-serif';
  wrapText(personalEnding.desc, W / 2, boxY + H * 0.16, boxW - W * 0.06, H * 0.04);

  // 分隔线
  ctx.strokeStyle = C.panelBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(boxX + W * 0.03, boxY + H * 0.34);
  ctx.lineTo(boxX + boxW - W * 0.03, boxY + H * 0.34);
  ctx.stroke();

  // 全员结局
  ctx.fillStyle = C.goldLight;
  ctx.font = 'italic ' + Math.max(13, H * 0.024) + 'px sans-serif';
  wrapText(globalEnding, W / 2, boxY + H * 0.38, boxW - W * 0.06, H * 0.038);

  // 温暖碎片统计
  ctx.fillStyle = C.textGray;
  ctx.font = Math.max(12, H * 0.022) + 'px sans-serif';
  ctx.fillText('温暖碎片收集：' + warmFragments + ' · 共情度：' + empathyScore, W / 2, boxY + boxH - H * 0.08);

  const btnW = Math.min(200, W * 0.45);
  const btnH = Math.max(48, H * 0.07);
  const btnX = W / 2 - btnW / 2;
  const btnY = boxY + boxH + H * 0.04;
  drawGoldButton(btnX, btnY, btnW, btnH, '重新体验');
  GS.buttons.push({ x: btnX, y: btnY, w: btnW, h: btnH, action: 'restart' });
}

// ========== 弹窗 ==========
function renderPopup() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);

  const pw = Math.min(400, W * 0.7);
  const ph = H * 0.35;
  const px = W / 2 - pw / 2;
  const py = H / 2 - ph / 2;

  drawPanel(px, py, pw, ph, C.panel);

  ctx.fillStyle = C.gold;
  ctx.font = 'bold ' + Math.max(16, H * 0.03) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(GS.popup.title, W / 2, py + H * 0.06);

  ctx.fillStyle = C.text;
  ctx.font = Math.max(13, H * 0.024) + 'px sans-serif';
  wrapText(GS.popup.text, W / 2, py + H * 0.12, pw - W * 0.04, H * 0.04);

  const btnW = Math.min(120, pw * 0.4);
  const btnH = Math.max(38, H * 0.055);
  const btnX = W / 2 - btnW / 2;
  const btnY = py + ph - btnH - H * 0.03;
  drawGoldButton(btnX, btnY, btnW, btnH, '确认');
  GS.popupBtns = [{ x: btnX, y: btnY, w: btnW, h: btnH, action: 'closePopup' }];
}


// ========== 辅助绘制函数 ==========
function drawPanel(x, y, w, h, color) {
  ctx.fillStyle = color;
  roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = C.panelBorder;
  ctx.lineWidth = 1;
  roundRect(x, y, w, h, 8);
  ctx.stroke();
}

function drawGoldButton(x, y, w, h, text) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, 'rgba(201, 168, 76, 0.9)');
  grad.addColorStop(1, 'rgba(160, 130, 60, 0.9)');
  ctx.fillStyle = grad;
  roundRect(x, y, w, h, h / 2);
  ctx.fill();

  ctx.strokeStyle = C.goldLight;
  ctx.lineWidth = 1;
  roundRect(x, y, w, h, h / 2);
  ctx.stroke();

  ctx.fillStyle = C.white;
  ctx.font = 'bold ' + Math.max(14, h * 0.4) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2);
  ctx.textBaseline = 'alphabetic';
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(text, x, y, maxW, lineH) {
  const chars = text.split('');
  let line = '';
  let lineY = y;
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    if (ctx.measureText(testLine).width > maxW && i > 0) {
      ctx.fillText(line, x, lineY);
      line = chars[i];
      lineY += lineH;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, lineY);
  return lineY;
}

// ========== 触摸处理 ==========
let touchStartX = 0, touchStartY = 0, isMoved = false;

function handleTouchStart(e) {
  const t = e.changedTouches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  isMoved = false;
}

function handleTouchMove(e) {
  const t = e.changedTouches[0];
  if (Math.abs(t.clientX - touchStartX) > 5 || Math.abs(t.clientY - touchStartY) > 5) {
    isMoved = true;
  }
}

function handleTouchEnd(e) {
  const t = e.changedTouches[0];
  if (isMoved) {
    if (currentScene === 'roleSelect') {
      const dx = t.clientX - touchStartX;
      const threshold = W * 0.06;
      if (Math.abs(dx) > threshold) {
        const rolesCount = Object.keys(ROLES).length;
        if (dx > 0) {
          roleSelectIndex = (roleSelectIndex - 1 + rolesCount) % rolesCount;
        } else {
          roleSelectIndex = (roleSelectIndex + 1) % rolesCount;
        }
      }
    }
    return;
  }
  checkClick(t.clientX, t.clientY);
}

function checkClick(x, y) {
  if (GS.showPopup) {
    for (let btn of GS.popupBtns) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        GS.showPopup = false;
        GS.popupBtns = [];
        return;
      }
    }
    return;
  }

  for (let btn of GS.buttons) {
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      handleAction(btn);
      return;
    }
  }
}


// ========== 动作处理 ==========
function handleAction(btn) {
  const act = btn.action;

  if (act === 'startGame') {
    currentScene = 'roleSelect';
    roleSelectIndex = 0;
    // 确保标题BGM在播放
    if (GS.gameBgm) {
      try { GS.gameBgm.stop(); } catch(e) {}
    }
    if (GS.titleBgm && GS.bgmPlaying !== 'title') {
      try { GS.titleBgm.play(); GS.bgmPlaying = 'title'; } catch(e) {}
    }
  }
  else if (act === 'selectRole') {
    playerRole = btn.role;
    empathyScore = 0;
    warmFragments = 0;
    currentActIndex = 0;
    currentTaskIndex = 0;
    currentDialogIndex = 0;
    GS.clues = [];
    GS.sidebarTab = 'task';

    // 切换BGM：停止标题BGM，播放游戏BGM
    if (GS.titleBgm) {
      try { GS.titleBgm.stop(); } catch(e) {}
    }
    if (GS.gameBgm) {
      try { GS.gameBgm.play(); GS.bgmPlaying = 'game'; } catch(e) {}
    }

    // 播放第一幕过渡动画
    const data = getRoleData(playerRole);
    const firstAct = data.acts[0];
    startTransition(firstAct.transition.title, firstAct.transition.subtitle, firstAct.transition.duration, function() {
      currentScene = 'main';
      showPopup('角色选择', '你选择了' + ROLES[playerRole].name + '。\n\n平行世界对应者：' + ROLES[playerRole].parallel + '\n\n共10个任务，按顺序完成。点击当前任务开始。');
    });
  }
  else if (act === 'switchTab') {
    GS.sidebarTab = btn.tab;
  }
  else if (act === 'doTask') {
    const taskId = btn.taskId;
    const allTasks = getAllTasks(playerRole);
    const task = allTasks.find(t => t.id === taskId);

    if (!task) return;
    if (GS.clues.includes(task.clue)) return; // 已完成

    // 检查是否是下一个可执行任务
    const nextTask = getNextUnlockedTask(playerRole);
    if (!nextTask || nextTask.id !== taskId) {
      showPopup('提示', '请按顺序完成任务。当前任务：' + (nextTask ? nextTask.name : '已全部完成'));
      return;
    }

    // 设置当前任务和对话
    const actIdx = task.actIndex;
    const actTasks = getRoleData(playerRole).acts[actIdx].tasks;
    const taskIdxInAct = actTasks.findIndex(t => t.id === taskId);

    currentActIndex = actIdx;
    currentTaskIndex = taskIdxInAct;
    currentDialogIndex = 0;
    currentScene = 'dialog';
  }
  else if (act === 'nextDialog') {
    const task = getCurrentTask(playerRole);
    if (!task) return;

    if (currentDialogIndex < task.dialogs.length - 1) {
      currentDialogIndex++;
    }
  }
  else if (act === 'makeChoice') {
    const task = getCurrentTask(playerRole);
    if (!task) return;

    const choice = task.choices[btn.choice];
    if (!choice) return;

    empathyScore = Math.max(0, empathyScore + (choice.empathy || 0));
    if (choice.fragment) warmFragments++;

    // 标记任务完成，添加线索
    if (!GS.clues.includes(task.clue)) {
      GS.clues.push(task.clue);
    }

    if (choice.next === 'ending') {
      currentScene = 'ending';
    } else {
      // 进入下一个任务或下一幕
      const allTasks = getAllTasks(playerRole);
      const currentIdx = allTasks.findIndex(t => t.id === task.id);

      if (currentIdx < allTasks.length - 1) {
        const nextTask = allTasks[currentIdx + 1];

        // 检查是否进入新的一幕
        if (nextTask.actIndex !== currentActIndex) {
          const data = getRoleData(playerRole);
          const nextAct = data.acts[nextTask.actIndex];
          startTransition(nextAct.transition.title, nextAct.transition.subtitle, nextAct.transition.duration, function() {
            currentActIndex = nextTask.actIndex;
            currentTaskIndex = 0;
            currentDialogIndex = 0;
            currentScene = 'dialog';
          });
        } else {
          currentActIndex = nextTask.actIndex;
          currentTaskIndex = nextTask.actIndex === currentActIndex ? 
            getRoleData(playerRole).acts[nextTask.actIndex].tasks.findIndex(t => t.id === nextTask.id) : 0;
          currentDialogIndex = 0;
          currentScene = 'dialog';
        }
      } else {
        currentScene = 'ending';
      }
    }
  }
  else if (act === 'backToMain') {
    currentScene = 'main';
    currentDialogIndex = 0;
  }
  else if (act === 'restart') {
    currentScene = 'title';
    playerRole = null;
    roleSelectIndex = 0;
    empathyScore = 0;
    warmFragments = 0;
    currentActIndex = 0;
    currentTaskIndex = 0;
    currentDialogIndex = 0;
    GS.clues = [];
    GS.sidebarTab = 'task';
    // 停止游戏BGM，切回标题BGM
    if (GS.gameBgm) {
      try { GS.gameBgm.stop(); } catch(e) {}
    }
    if (GS.titleBgm) {
      try { GS.titleBgm.play(); GS.bgmPlaying = 'title'; } catch(e) {}
    }
  }
  else if (act === 'closePopup') {
    GS.showPopup = false;
    GS.popupBtns = [];
  }
}

function showPopup(title, text) {
  GS.popup = { title, text };
  GS.showPopup = true;
}
