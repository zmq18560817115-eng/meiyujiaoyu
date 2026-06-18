/**
 * 批量导出青墙粉绘全部界面为 PNG
 * 输出：
 *   desktop/  — 桌面端平铺（fullPage 长图）
 *   mobile/   — 手机端按功能模块分子目录（视口一屏）
 *
 * 前置：npm run dev 已启动（默认 http://localhost:3000）
 * 用法：
 *   npm run export-ui          # 桌面 + 手机
 *   npm run export-ui:mobile   # 仅重导手机端
 */
import { chromium } from "playwright";
import {
  mkdirSync,
  writeFileSync,
  rmSync,
  readdirSync,
  readFileSync,
  existsSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outRoot = join(root, "exports/ui-design-screenshots");
const baseUrl = process.env.UI_EXPORT_BASE_URL ?? "http://127.0.0.1:3000";
const exportOnly = process.env.UI_EXPORT_ONLY ?? "";

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, label: "桌面端 1440×900" },
  mobile: {
    width: 390,
    height: 844,
    label: "移动端 390×844",
    isMobile: true,
    hasTouch: true,
  },
};

/** 手机端：按产品功能模块分目录命名（与顶栏 Tab / 子功能一致） */
const MOBILE_LAYOUT = {
  "00-welcome": { folder: "01-入口", file: "01-欢迎页" },
  "01-teacher-login": { folder: "01-入口", file: "02-教师登录" },
  "02-student-login": { folder: "01-入口", file: "03-学生登录" },
  "03-teacher-entry-loading": { folder: "01-入口", file: "04-教师加载页" },
  "04-student-entry-loading": { folder: "01-入口", file: "05-学生加载页" },

  "10-teacher-home": { folder: "02-教师-首页工作台", file: "01-工作台总览" },
  "11-teacher-home-3d": { folder: "02-教师-首页工作台", file: "02-3D全景鉴赏" },
  "11b-teacher-3d-projection": {
    folder: "02-教师-首页工作台",
    file: "03-3D无线投屏",
  },
  "11c-teacher-3d-fullscreen": {
    folder: "02-教师-首页工作台",
    file: "04-3D全屏解说",
  },
  "12-teacher-home-whiteboard": {
    folder: "02-教师-首页工作台",
    file: "05-智慧白板",
  },
  "13-teacher-home-qa": { folder: "02-教师-首页工作台", file: "06-智慧问答" },

  "14-teacher-lessons": { folder: "03-教师-AI微课备课", file: "01-备课主页" },
  "14b-teacher-lesson-ppt-cover": {
    folder: "03-教师-AI微课备课",
    file: "02-微课课件封面",
  },
  "14c-teacher-lesson-ppt-slide": {
    folder: "03-教师-AI微课备课",
    file: "03-微课课件内容",
  },

  "15-teacher-resources-browse": {
    folder: "04-教师-非遗资源库",
    file: "01-资源浏览",
  },
  "15b-teacher-resources-sync": {
    folder: "04-教师-非遗资源库",
    file: "02-平台同步",
  },
  "15c-teacher-resources-upload": {
    folder: "04-教师-非遗资源库",
    file: "03-本地上传",
  },
  "15d-teacher-resource-preview": {
    folder: "04-教师-非遗资源库",
    file: "04-资源预览",
  },

  "16-teacher-works-pending": {
    folder: "05-教师-优秀推报",
    file: "01-待审列表",
  },
  "16b-teacher-works-report": {
    folder: "05-教师-优秀推报",
    file: "02-班级周报",
  },
  "16c-teacher-work-review": {
    folder: "05-教师-优秀推报",
    file: "03-作品批阅",
  },

  "17-teacher-notices-inbox": {
    folder: "06-教师-账户与通知",
    file: "01-通知中心",
  },
  "18-teacher-account-menu": {
    folder: "06-教师-账户与通知",
    file: "02-账户菜单",
  },
  "18b-teacher-account-settings": {
    folder: "06-教师-账户与通知",
    file: "03-终端设置",
  },

  "20-student-view3d": { folder: "07-学生-3D全景鉴赏", file: "01-3D交互实景" },

  "21-student-canvas-heritage": {
    folder: "08-学生-智能设色",
    file: "01-非遗彩谱",
  },
  "21b-student-canvas-custom": {
    folder: "08-学生-智能设色",
    file: "02-幻彩自由配",
  },
  "26-student-ink-bleed-loader": {
    folder: "08-学生-智能设色",
    file: "03-扎染发布动效",
  },

  "22-student-chat": { folder: "09-学生-伴读对话", file: "01-小草对话" },
  "22b-student-chat-library": {
    folder: "09-学生-伴读对话",
    file: "02-对话素材库",
  },

  "23-student-gallery-hall": {
    folder: "10-学生-数智画廊",
    file: "01-展厅大厅",
  },
  "23b-student-gallery-detail": {
    folder: "10-学生-数智画廊",
    file: "02-作品详情",
  },
  "24-student-gallery-mine": {
    folder: "10-学生-数智画廊",
    file: "03-我的投稿",
  },
  "25-student-gallery-rank": {
    folder: "10-学生-数智画廊",
    file: "04-班级排行榜",
  },
};

mkdirSync(join(outRoot, "desktop"), { recursive: true });
mkdirSync(join(outRoot, "mobile"), { recursive: true });

function cleanLegacyMobileFlatPngs() {
  const mobileDir = join(outRoot, "mobile");
  for (const entry of readdirSync(mobileDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".png")) {
      rmSync(join(mobileDir, entry.name), { force: true });
    }
  }
}

async function waitStable(page, ms = 600) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(ms);
}

function makeShot(outDir, profileKey, manifest) {
  const isMobile = profileKey === "mobile";

  return async (page, desktopName, title, category) => {
    let relPath = desktopName;
    let manifestFile = `${desktopName}.png`;
    let manifestCategory = category;

    if (isMobile) {
      const layout = MOBILE_LAYOUT[desktopName];
      if (!layout) {
        throw new Error(`手机端缺少排布映射: ${desktopName}`);
      }
      relPath = join(layout.folder, layout.file);
      manifestFile = `${layout.folder}/${layout.file}.png`;
      manifestCategory = layout.folder;
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
    }

    const path = join(outDir, `${relPath}.png`);
    mkdirSync(dirname(path), { recursive: true });
    await page.screenshot({ path, fullPage: !isMobile });
    console.log("✓", path);
    manifest.push({ file: manifestFile, title, category: manifestCategory });
  };
}

async function clearSession(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function dismissDialogs(page) {
  page.on("dialog", async (dialog) => {
    await dialog.accept().catch(() => {});
  });
}

async function loginTeacher(page, { captureLoader = false } = {}) {
  await clearSession(page);
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await waitStable(page);
  await page
    .getByRole("button", { name: /乡村美育人机智能化授课平台|教师工作台/ })
    .first()
    .click();
  await waitStable(page, 400);
  await page.getByRole("button", { name: /测试快捷登录/ }).click();

  if (captureLoader) {
    await page.locator(".ip-entry-loader-screen").waitFor({ timeout: 8000 });
    await page.waitForTimeout(1200);
    return;
  }

  await page.getByText("首页工作台").waitFor({ timeout: 25000 });
  await waitStable(page, 1000);
}

async function loginStudent(page, { captureLoader = false } = {}) {
  await clearSession(page);
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await waitStable(page);
  await page
    .getByRole("button", { name: /大理非遗植物扎染|研学体验舱/ })
    .first()
    .click();
  await waitStable(page, 400);
  await page.getByRole("button", { name: /测试快捷登录/ }).click();

  if (captureLoader) {
    await page.locator(".ip-entry-loader-screen").waitFor({ timeout: 8000 });
    await page.waitForTimeout(1200);
    return;
  }

  await page.getByText("3D 全景鉴赏").waitFor({ timeout: 25000 });
  await waitStable(page, 1000);
}

async function clickNav(page, label) {
  await page.getByRole("button", { name: label }).click();
  await waitStable(page, 800);
}

async function captureWelcomeAndLogin(page, shot) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await waitStable(page, 800);
  await shot(page, "00-welcome", "欢迎页 · 教师/学生入口", "welcome");

  await page
    .getByRole("button", { name: /乡村美育人机智能化授课平台|教师工作台/ })
    .first()
    .click();
  await waitStable(page, 400);
  await shot(page, "01-teacher-login", "教师登录页", "welcome");

  await clearSession(page);
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await waitStable(page);
  await page
    .getByRole("button", { name: /大理非遗植物扎染|研学体验舱/ })
    .first()
    .click();
  await waitStable(page, 400);
  await shot(page, "02-student-login", "学生登录页", "welcome");
}

async function captureEntryLoaders(page, shot) {
  await loginTeacher(page, { captureLoader: true });
  await shot(page, "03-teacher-entry-loading", "教师 · 登录加载页", "welcome");
  await page.getByText("首页工作台").waitFor({ timeout: 25000 });
  await waitStable(page, 600);

  await loginStudent(page, { captureLoader: true });
  await shot(page, "04-student-entry-loading", "学生 · 登录加载页", "welcome");
  await page.getByText("3D 全景鉴赏").waitFor({ timeout: 25000 });
  await waitStable(page, 600);
}

async function captureTeacherScreens(page, shot) {
  await loginTeacher(page);

  await shot(page, "10-teacher-home", "教师 · 首页工作台", "teacher");

  await page.getByText("3D全景鉴赏", { exact: false }).first().click();
  await waitStable(page, 1000);
  await shot(page, "11-teacher-home-3d", "教师 · 3D全景鉴赏", "teacher");

  await page.getByRole("button", { name: /无线投屏到所有学生|投屏中/ }).click();
  await waitStable(page, 800);
  await shot(
    page,
    "11b-teacher-3d-projection",
    "教师 · 3D无线投屏部署",
    "teacher",
  );

  await page.getByRole("button", { name: /返回/ }).first().click();
  await waitStable(page, 600);
  await page.getByText("3D全景鉴赏", { exact: false }).first().click();
  await waitStable(page, 800);
  await page.getByRole("button", { name: "播放本视角科普解说" }).click();
  await waitStable(page, 1200);
  await shot(
    page,
    "11c-teacher-3d-fullscreen",
    "教师 · 3D全屏科普解说",
    "overlay",
  );
  await page.getByRole("button", { name: "退出展示" }).click().catch(() => {});
  await waitStable(page, 600);

  await page.getByRole("button", { name: /返回/ }).first().click();
  await waitStable(page, 600);
  await page.getByText("智慧白板", { exact: false }).first().click();
  await waitStable(page, 1000);
  await shot(page, "12-teacher-home-whiteboard", "教师 · 智慧白板", "teacher");

  await page.getByRole("button", { name: /返回/ }).first().click();
  await waitStable(page, 600);
  await page.getByText("智慧问答", { exact: false }).first().click();
  await waitStable(page, 1000);
  await shot(page, "13-teacher-home-qa", "教师 · 智慧问答（小茶）", "teacher");

  await clickNav(page, "AI微课备课");
  await shot(page, "14-teacher-lessons", "教师 · AI微课备课", "teacher");

  const lessonBtn = page.getByRole("button", { name: "使用本篇教案上课" }).first();
  if (await lessonBtn.isVisible().catch(() => false)) {
    await lessonBtn.click();
    await waitStable(page, 1000);
    await shot(
      page,
      "14b-teacher-lesson-ppt-cover",
      "教师 · 微课课件（封面）",
      "overlay",
    );
    await page.getByRole("button", { name: "下一页" }).click().catch(() => {});
    await waitStable(page, 500);
    await shot(
      page,
      "14c-teacher-lesson-ppt-slide",
      "教师 · 微课课件（内容页）",
      "overlay",
    );
    await page.getByRole("button", { name: "退出展示" }).click();
    await waitStable(page, 600);
  }

  await clickNav(page, "非遗资源库");
  await shot(
    page,
    "15-teacher-resources-browse",
    "教师 · 非遗资源库（浏览）",
    "teacher",
  );

  await page.getByRole("button", { name: "平台同步" }).click();
  await waitStable(page, 600);
  await shot(
    page,
    "15b-teacher-resources-sync",
    "教师 · 非遗资源库（平台同步）",
    "teacher",
  );

  await page.getByRole("button", { name: "资源浏览" }).click();
  await waitStable(page, 400);
  await page.getByRole("button", { name: "前往上传通道" }).click();
  await waitStable(page, 600);
  await shot(
    page,
    "15c-teacher-resources-upload",
    "教师 · 非遗资源库（本地上传）",
    "teacher",
  );

  await page.getByRole("button", { name: /返回资源浏览/ }).click();
  await waitStable(page, 500);
  const previewBtn = page.getByRole("button", { name: "预览" }).first();
  if (await previewBtn.isVisible().catch(() => false)) {
    await previewBtn.click();
    await waitStable(page, 700);
    await shot(
      page,
      "15d-teacher-resource-preview",
      "教师 · 资源预览详情",
      "teacher",
    );
    await page.getByRole("button", { name: /返回资源浏览/ }).click();
    await waitStable(page, 500);
  }

  await clickNav(page, /优秀推报/);
  await shot(
    page,
    "16-teacher-works-pending",
    "教师 · 优秀推报（待审列表）",
    "teacher",
  );

  await page.getByRole("button", { name: "班级周报" }).click();
  await waitStable(page, 600);
  await shot(
    page,
    "16b-teacher-works-report",
    "教师 · 优秀推报（班级周报）",
    "teacher",
  );

  await page.getByRole("button", { name: "待审列表" }).click();
  await waitStable(page, 500);
  const reviewBtn = page.getByRole("button", { name: "查看作品" }).first();
  if (await reviewBtn.isVisible().catch(() => false)) {
    await reviewBtn.click();
    await waitStable(page, 700);
    await shot(
      page,
      "16c-teacher-work-review",
      "教师 · 作品深度批阅",
      "teacher",
    );
    await page.getByRole("button", { name: /返回待审列表/ }).click();
    await waitStable(page, 500);
  }

  await page.locator(".nupul-avatar-trigger").click();
  await waitStable(page, 500);
  await shot(page, "18-teacher-account-menu", "教师 · 账户菜单", "overlay");

  await page.getByRole("button", { name: "通知与消息偏好" }).click();
  await waitStable(page, 800);
  await shot(
    page,
    "17-teacher-notices-inbox",
    "教师 · 校园通知接收中心",
    "overlay",
  );
  await page.getByRole("button", { name: "关闭" }).click();
  await waitStable(page, 500);

  await page.locator(".nupul-avatar-trigger").click();
  await waitStable(page, 400);
  await page.getByRole("button", { name: "授课终端显示" }).click();
  await waitStable(page, 400);
  await shot(
    page,
    "18b-teacher-account-settings",
    "教师 · 授课终端显示设置",
    "overlay",
  );
  await page.keyboard.press("Escape");
  await waitStable(page, 300);
}

async function captureStudentScreens(page, shot) {
  await loginStudent(page);

  await shot(page, "20-student-view3d", "学生 · 3D全景鉴赏", "student");

  await clickNav(page, "绘制：智能设色");
  await shot(
    page,
    "21-student-canvas-heritage",
    "学生 · 智能设色（非遗彩谱）",
    "student",
  );

  await page.getByRole("button", { name: /纹 幻彩自由配/ }).click();
  await waitStable(page, 500);
  await shot(
    page,
    "21b-student-canvas-custom",
    "学生 · 智能设色（幻彩自由配）",
    "student",
  );

  await clickNav(page, "伴读：对话素材库");
  await shot(page, "22-student-chat", "学生 · 对话伴读（小草）", "student");

  await page
    .getByRole("button", { name: "对话素材库", exact: true })
    .click();
  await waitStable(page, 600);
  await shot(page, "22b-student-chat-library", "学生 · 对话素材库", "student");

  await clickNav(page, "线上数智展览馆");
  await shot(page, "23-student-gallery-hall", "学生 · 数智画廊展厅", "student");

  const galleryCard = page
    .locator(".nupul-tactile-card img.vector-illustration")
    .first();
  if (await galleryCard.isVisible().catch(() => false)) {
    await galleryCard.click({ force: true });
    await waitStable(page, 700);
    await shot(
      page,
      "23b-student-gallery-detail",
      "学生 · 画廊作品详情",
      "student",
    );
    await page.getByRole("button", { name: /返回展厅大厅/ }).click();
    await waitStable(page, 500);
  }

  await page.getByRole("button", { name: "我的投稿" }).click();
  await waitStable(page, 600);
  await shot(page, "24-student-gallery-mine", "学生 · 我的投稿", "student");

  await page.getByRole("button", { name: "班级排行榜" }).click();
  await waitStable(page, 600);
  await shot(page, "25-student-gallery-rank", "学生 · 班级排行榜", "student");

  await clickNav(page, "绘制：智能设色");
  await waitStable(page, 500);
  const publishBtn = page.getByRole("button", { name: "一键发布学校展厅" });
  if (await publishBtn.isVisible().catch(() => false)) {
    await publishBtn.click();
    await page.waitForTimeout(1800);
    const loader = page.getByText("第一阶段：揉捏绞扎");
    if (await loader.isVisible().catch(() => false)) {
      await shot(
        page,
        "26-student-ink-bleed-loader",
        "学生 · 扎染发布动效加载",
        "overlay",
      );
      await page.waitForTimeout(6000);
    }
  }
}

async function captureAllForViewport(browser, profileKey, profile) {
  const outDir = join(outRoot, profileKey);
  const manifest = [];
  const shot = makeShot(outDir, profileKey, manifest);

  const context = await browser.newContext({
    viewport: { width: profile.width, height: profile.height },
    deviceScaleFactor: 2,
    locale: "zh-CN",
    isMobile: profile.isMobile ?? false,
    hasTouch: profile.hasTouch ?? false,
  });
  const page = await context.newPage();
  await dismissDialogs(page);

  try {
    await captureWelcomeAndLogin(page, shot);
    await captureEntryLoaders(page, shot);
    await captureTeacherScreens(page, shot);
    await captureStudentScreens(page, shot);
  } catch (err) {
    console.error(`[${profileKey}] 导出中断:`, err);
    await shot(page, "99-error-state", "导出失败状态", "error").catch(() => {});
    throw err;
  } finally {
    await context.close();
  }

  return { profileKey, profile, manifest, count: manifest.length };
}

function writeManifest(results) {
  const manifestPath = join(outRoot, "manifest.json");
  let existing = null;
  if (existsSync(manifestPath)) {
    try {
      existing = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch {
      existing = null;
    }
  }

  const resultMap = new Map(results.map((r) => [r.profileKey, r]));
  const profileOrder = ["desktop", "mobile"];
  const profiles = profileOrder
    .map((id) => resultMap.get(id) ?? existing?.profiles?.find((p) => p.id === id))
    .filter(Boolean)
    .map((entry) => {
      if (resultMap.has(entry.profileKey ?? entry.id)) {
        const r = resultMap.get(entry.profileKey ?? entry.id);
        return {
          id: r.profileKey,
          label: r.profile.label,
          viewport: { width: r.profile.width, height: r.profile.height },
          outputDir: r.profileKey,
          layout:
            r.profileKey === "mobile"
              ? "按功能模块分子目录，视口一屏（非长图拼接）"
              : "平铺命名，fullPage 长图",
          count: r.count,
          screens: r.manifest,
        };
      }
      return entry;
    });

  const totalScreens = profiles.reduce((n, p) => n + (p.count ?? 0), 0);
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        baseUrl,
        deviceScaleFactor: 2,
        profiles,
        totalScreens,
      },
      null,
      2,
    ),
    "utf8",
  );
}

async function main() {
  const health = await fetch(baseUrl).catch(() => null);
  if (!health?.ok) {
    console.error(`无法连接 ${baseUrl}，请先运行 npm run dev`);
    process.exit(1);
  }

  const selectedProfiles = exportOnly
    ? Object.fromEntries(
        Object.entries(VIEWPORTS).filter(([key]) => key === exportOnly),
      )
    : VIEWPORTS;

  if (exportOnly && Object.keys(selectedProfiles).length === 0) {
    console.error(`未知的 UI_EXPORT_ONLY=${exportOnly}`);
    process.exit(1);
  }

  if (exportOnly === "mobile" || !exportOnly) {
    cleanLegacyMobileFlatPngs();
  }

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const [key, profile] of Object.entries(selectedProfiles)) {
      console.log(`\n── 导出 ${profile.label} ──`);
      const result = await captureAllForViewport(browser, key, profile);
      results.push(result);
      console.log(`完成 ${key}：${result.count} 张`);
    }
  } finally {
    await browser.close();
  }

  writeManifest(results);
  rmSync(join(outRoot, "00-welcome.png"), { force: true });

  const total = results.reduce((n, r) => n + r.count, 0);
  console.log(`\n完成：本次导出 ${total} 张 → ${outRoot}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
