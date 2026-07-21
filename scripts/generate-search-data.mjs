/**
 * 搜索数据生成脚本
 *
 * 从 Astro 内容集合的 markdown 博客文件中读取 frontmatter，
 * 生成 public/data/search-data.json 供客户端搜索使用。
 *
 * 用法：
 *   node scripts/generate-search-data.mjs           # 手动运行
 *   npm run build                                    # 构建时自动运行
 *   npm run generate-search-data                     # 专用命令
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { slug } from 'github-slugger';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const blogsDir = path.join(rootDir, 'src', 'content', 'blogs');
const outputDir = path.join(rootDir, 'public', 'data');
const outputFile = path.join(outputDir, 'search-data.json');

// 从 site.json 读取站点配置
function loadSiteConfig() {
  const siteJsonPath = path.join(rootDir, 'src', 'config', 'site.json');
  const raw = fs.readFileSync(siteJsonPath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * 生成 slug，使用 github-slugger 以匹配 Astro 内容集合的 slug 生成逻辑。
 */
function generateSlug(filename) {
  return slug(filename.replace(/\.md$/i, ''));
}

// 生成搜索数据
function generateSearchData() {
  console.log('🔍 Generating search data...');

  const siteConfig = loadSiteConfig();
  const defaultAuthor = siteConfig.site?.author || 'Jiahe Lv';

  // 读取所有博客 markdown 文件
  if (!fs.existsSync(blogsDir)) {
    console.error(`❌ Blogs directory not found: ${blogsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(blogsDir).filter(f => f.endsWith('.md'));
  console.log(`📄 Found ${files.length} blog posts`);

  const searchData = [];

  for (const file of files) {
    const filePath = path.join(blogsDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);

    // 跳过草稿
    if (data.draft === true) {
      console.log(`  ⏭️  Skipping draft: ${file}`);
      continue;
    }

    const slug = generateSlug(file);

    // 处理日期
    let pubDate = data.pubDate;
    if (pubDate instanceof Date && !isNaN(pubDate)) {
      pubDate = pubDate.toISOString();
    } else if (typeof pubDate === 'string' || typeof pubDate === 'number') {
      pubDate = new Date(pubDate).toISOString();
    } else {
      pubDate = new Date().toISOString();
    }

    searchData.push({
      title: data.title || file.replace('.md', ''),
      description: data.description || '',
      slug,
      pubDate,
      tags: Array.isArray(data.tags) ? data.tags : [],
      author: data.author || defaultAuthor,
      categories: Array.isArray(data.categories) ? data.categories : [],
      subject: data.subject || '',
    });

    console.log(`  ✅ ${data.title || file}`);
  }

  // 按日期降序排序
  searchData.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 写入文件（紧凑格式，节省空间）
  fs.writeFileSync(outputFile, JSON.stringify(searchData), 'utf-8');
  console.log(`\n✅ Search data written to ${outputFile}`);
  console.log(`📊 Total entries: ${searchData.length}`);
}

generateSearchData();
