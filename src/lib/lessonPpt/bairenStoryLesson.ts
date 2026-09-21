import type { LessonSlide } from "./types";

export const BAIREN_STORY_ID = "story-03";

const slideCopy = [
  ["百忍家声的一百个忍字", "从一面照壁认识家风，把家和画进作品"],
  ["今天，我们读懂一面会说话的墙", "认识照壁题字，观察图案关系，表达家和寓意"],
  ["故事开始", "哥哥想画小鸟，妹妹想画大花，两个人谁也不让谁"],
  ["忍只是忍着不说话吗", "阿奶指着照壁上的百忍家声，请孩子思考它的含义"],
  ["花和鸟可以在一面墙上", "理解和商量让两个人的想法都留下来"],
  ["花有位置，鸟也有位置", "家和是愿意让彼此的想法一起生活"],
  ["读懂百忍家声", "认识张姓照壁题字、张公艺故事和包容合作的家风"],
  ["照壁为什么不是普通的墙", "讨论照壁如何成为家人每天都能看见的家风提醒"],
  ["把家和变成画面", "用鸟、云纹、回纹和卷草纹表达彼此联系"],
  ["设计一面家和照壁", "确定家风词、主体图案、连续边框和作品说明"],
  ["四步完成照壁作品", "画外形、定中心、添图案、加边框"],
  ["我的作品说明", "用一句话介绍照壁、图案、寓意和想对家人说的话"],
  ["怎样欣赏一幅照壁作品", "从图案、构图、色彩与寓意四方面评价"],
  ["照壁也是写给家人的无声家书", "把想送给家人的祝福画进自己的照壁里"],
] as const;

export const BAIREN_STORY_SLIDES: LessonSlide[] = slideCopy.map(
  ([title, body], index) => ({
    layout: "full-image",
    tag: `第${index + 1}页`,
    title,
    body,
    imageUrl: `/lesson-ppts/bairen-jiasheng/slide-${index + 1}.png`,
    imageCaption: `${title}课件页`,
  }),
);

export const BAIREN_STORY_PPTX_URL =
  "/lesson-ppts/bairen-jiasheng/%E7%99%BE%E5%BF%8D%E5%AE%B6%E5%A3%B0%E7%9A%84%E4%B8%80%E7%99%BE%E4%B8%AA%E5%BF%8D%E5%AD%97_%E7%A4%BA%E4%BE%8B%E8%AF%BE.pptx";

export const BAIREN_STORY_DESIGN_PDF_URL =
  "/lesson-designs/%E7%99%BE%E5%BF%8D%E5%AE%B6%E5%A3%B0%E7%9A%84%E4%B8%80%E7%99%BE%E4%B8%AA%E5%BF%8D%E5%AD%97_%E6%95%99%E5%AD%A6%E8%AE%BE%E8%AE%A1.pdf";
