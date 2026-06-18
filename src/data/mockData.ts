import { Course, Resource, StudentArtwork, StudentProgressStats } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    title: '白族建筑彩绘历史认知',
    category: 'base',
    desc: '系统学习白族民居彩绘的起源、演变及艺术底蕴。重点学习“清白传家”家风故事在白墙墨线上的视觉体现。',
    duration: '1 课时 (45分钟)',
    difficulty: '入门',
    outline: [
      '第一节：喜洲古镇白族院落实地探秘',
      '第二节：“三坊一照壁”、“四合五天井”空间里的彩绘位置',
      '第三节：泥土与贝壳：白画与矿物颜料的历史融合',
      '第四节：课后思考：我们家村口的照壁上写着什么字？'
    ],
    materials: ['大理彩绘历史画册.pdf', '照壁透视图稿.png']
  },
  {
    id: 'c2',
    title: '古典纹样的生态故事 (牡丹与飞燕)',
    category: 'motif',
    desc: '从大理自然花草昆虫出发，探寻吉祥纹样背后的生命美学。解析牡丹、卷云纹、喜上眉梢等图案的几何构成。',
    duration: '2 课时',
    difficulty: '进阶',
    outline: [
      '第一节：洱海彩蝶与喜鹊的造型重构',
      '第二节：几何对称：用米字格绘制一朵如意云纹',
      '第三节：水墨晕染：传统毛笔勾线与提顿练习',
      '第四节：人机互动：智能白模平台纹样初体验'
    ],
    materials: ['喜鹊填色线稿.jpg', '如意卷云纹几何格栅.svg']
  },
  {
    id: 'c3',
    title: '色彩拼贴艺术 (大理蓝白巧设色)',
    category: 'color',
    desc: '探究被称为“大理蓝白搭配”的色彩美学。结合矿物石青、丹红色与贝壳蛤粉，学习冷暖调配、主宾响应的色彩分布法则。',
    duration: '1 课时',
    difficulty: '进阶',
    outline: [
      '第一节：白族扎染蔚蓝色系与彩绘石青蓝对比',
      '第二节：朱砂红与土黄：如何在一面素壁中画龙点睛',
      '第三节：留白之美：白色蛤粉在强烈日光下的反光调和',
      '第四节：我的首个大理彩绘调色盘设计'
    ],
    materials: ['大理白族传统矿物配色色标.hex', '白壁色彩反照原理图.png']
  },
  {
    id: 'c4',
    title: '金石篆刻与照壁题字技艺',
    category: 'craft',
    desc: '白族对文化极其推崇，本课教导学生鉴赏照壁中心的题字工艺，理解在灰塑、彩绘边框中融入宋体和行书的艺术技巧。',
    duration: '2 课时',
    difficulty: '大师',
    outline: [
      '第一节：‘清白传家’的历史渊源与其书法之美',
      '第二节：大宋体、行书在石灰照壁底纸上的排版技巧',
      '第三节：灰雕墨勒：阳刻与阴刻视觉反差的绘制手法',
      '第四节：小小书法家：在数字画布写下我的家训'
    ],
    materials: ['传统照壁名人题字碑帖.pdf', '灰塑刮刀实操视频.mp4']
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  // Platform resources
  {
    id: 'res-1',
    title: '【国家数字平台】部编版小学四年级美育同步欣赏：大理白族民居',
    type: 'platform',
    size: '18.4 MB',
    date: '2026-05-15',
    fileType: 'pdf',
    downloads: 142
  },
  {
    id: 'res-2',
    title: '【国家数字平台】非遗进课堂：剪纸、木雕与彩绘融合授课策略',
    type: 'platform',
    size: '42.1 MB',
    date: '2026-04-20',
    fileType: 'mp4',
    downloads: 98
  },
  // Core Local database resources
  {
    id: 'res-3',
    title: '【特色库】大理喜洲严家大院3D高精度影壁三维几何模型文件',
    type: 'core',
    size: '124.5 MB',
    date: '2026-06-01',
    fileType: 'obj',
    downloads: 245
  },
  {
    id: 'res-4',
    title: '【特色库】白族彩绘典型纹样矢量库 (卷云、牡丹、蝴蝶共24款)',
    type: 'core',
    size: '8.2 MB',
    date: '2026-05-28',
    fileType: 'svg',
    downloads: 310
  },
  {
    id: 'res-5',
    title: '【特色库】大理白语童谣配音：阳光下美丽的青砖白墙',
    type: 'core',
    size: '3.1 MB',
    date: '2026-05-10',
    fileType: 'mp3',
    downloads: 77
  },
  // School uploaded resources
  {
    id: 'res-6',
    title: '【本地库】双廊希望小学2026端午游园会彩绘长卷高清底稿',
    type: 'local',
    size: '15.6 MB',
    date: '2026-06-02',
    fileType: 'png',
    downloads: 45
  },
  {
    id: 'res-7',
    title: '【本地库】徐老师上传：白族彩绘画笔传统执笔法课堂实录',
    type: 'local',
    size: '88.0 MB',
    date: '2026-05-30',
    fileType: 'mp4',
    downloads: 32
  }
];

export const INITIAL_STUDENT_WORKS: StudentArtwork[] = [
  {
    id: 'sw-1',
    title: '我家照壁上的富贵牡丹',
    studentName: '杨一诺',
    studentId: 'stu-01',
    grade: '四年级 1班',
    imageUrl: '/gallery/sw-1-peony.png',
    likes: 38,
    hasLiked: false,
    date: '2026-06-02',
    tags: ['牡丹纹', '色彩搭配', '喜洲传统'],
    diary: '今天在课堂上听了严家大院的故事，我给自己的照壁画上了大大的红色牡丹。爸爸说以前大爷们盖房子都会画这个，希望家人吉祥平安。我用鲜艳的朱红大底配上淡淡石绿，画完的时候感觉我们的民居真的好漂亮！',
    badge: '文化传承小标兵',
    approved: true
  },
  {
    id: 'sw-2',
    title: '海东双廊的彩蝶飞舞',
    studentName: '季雨桐',
    studentId: 'stu-02',
    grade: '三年级 2班',
    imageUrl: '/gallery/sw-2-butterfly.png',
    likes: 27,
    hasLiked: false,
    date: '2026-06-01',
    tags: ['蝴蝶纹', '拼贴设计', '洱海生态'],
    diary: '每年大理蝴蝶泉都有好多五彩缤纷的蝴蝶。我画了两只对称的圆顶云纹彩蝶在青色屋脊两侧。老师说蝴蝶谐音“福迭”，也就是幸福源源不断，所以我要把这幅画送给辛苦工作的妈妈！',
    badge: '苍山洱海守护先锋',
    approved: true
  },
  {
    id: 'sw-3',
    title: '多子多福：大理石榴树灰塑彩绘',
    studentName: '李明',
    studentId: 'stu-03',
    grade: '四年级 2班',
    imageUrl: '/gallery/sw-3-pomegranate.png',
    likes: 19,
    hasLiked: false,
    date: '2026-05-29',
    tags: ['石榴纹', '灰塑勾线'],
    diary: '爷爷家院子的影壁角上画着红红饱满的石榴树，石榴裂开露出亮亮饱满的各种小粒子。学了线稿勾线后，我用蛤粉和金米黄涂出了反光感，祝愿大家家庭和睦，像石榴粒子一样紧紧抱在一起！',
    badge: '创意设计突出奖',
    approved: true
  },
  {
    id: 'sw-4',
    title: '清白传家水墨兰花',
    studentName: '张宇涵',
    studentId: 'stu-04',
    grade: '五年级 1班',
    imageUrl: '/gallery/sw-4-orchid.png',
    likes: 42,
    hasLiked: false,
    date: '2026-06-03',
    tags: ['兰花纹', '照壁墨画', '家风故事'],
    diary: '白族人家最爱清洁，最雅致。我学着用墨色浓淡渲染了一株空谷幽兰。老师说清白两个字是杨震将军的廉政遗风。我们要清清白白做人，安安静静干事。把这幅画在心里，时刻监督自己。',
    badge: '文化传承人',
    approved: false // Pending approval to show teacher approval dashboard functionality!
  }
];

export const MOCK_STUDENTS_PROGRESS: StudentProgressStats = {
  completionRate: 88,
  activeStudents: 10,
  totalWorks: 89,
  masteryScores: {
    motif: 67,
    color: 82,
    history: 91
  },
  rankList: [
    { name: '杨一诺', worksCount: 6, score: 96 },
    { name: '张宇涵', worksCount: 5, score: 94 },
    { name: '季雨桐', worksCount: 4, score: 91 },
    { name: '李明', worksCount: 4, score: 89 },
    { name: '段家豪', worksCount: 3, score: 86 }
  ]
};

export const ANNOUNCEMENTS = [
  {
    id: 'a1',
    title: '【重要通知】大理市2026中小学美育非遗数字画廊作品征集活动开始啦',
    date: '2026-06-02',
    src: '双廊镇中心小学教科室'
  },
  {
    id: 'a2',
    title: '【非遗动态】云南省省非遗进校园优秀教案征集结果公示：我校获一等奖',
    date: '2026-05-28',
    src: '国家公共美育平台'
  },
  {
    id: 'a3',
    title: '【系统提示】大理白族民居彩绘核心课程资源库V3.5版本已更新完成',
    date: '2026-05-24',
    src: '人机共生美育智库'
  }
];
