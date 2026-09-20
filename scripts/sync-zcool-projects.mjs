import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

const profileUrl = 'https://www.zcool.com.cn/u/ZOTI4NDk5ODQ=';
const root = process.cwd();
const dataPath = path.join(root, 'app', 'portfolio-data.js');
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;
const desktopHeaders = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36',
  referer: profileUrl
};
const mobileHeaders = {
  'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  referer: profileUrl
};

const request = (url, options = {}) =>
  undiciFetch(url, { dispatcher, ...options, headers: { ...desktopHeaders, ...options.headers } });

const fetchWithRetry = async (url, options = {}, retries = 2) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await request(url, options);
      if (response.ok) return response;
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Request failed for ${url}: ${lastError?.message ?? 'unknown error'}`);
};

const parseNextData = (html, label) => {
  const payload = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  if (!payload) throw new Error(`ZCOOL data was not found for ${label}`);
  return JSON.parse(payload);
};

const cleanText = value =>
  String(value ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

const mapLimit = async (values, limit, task) => {
  const results = new Array(values.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await task(values[index], index);
    }
  });
  await Promise.all(workers);
  return results;
};

const profileResponse = await fetchWithRetry(profileUrl);
const profileHtml = await profileResponse.text();
const works = parseNextData(profileHtml, 'profile').props.pageProps.workList ?? [];
const moduleUrl = `${pathToFileURL(dataPath).href}?sync=${Date.now()}`;
const { categories, projects } = await import(moduleUrl);
const existingById = new Map(projects.map(project => [project.id, project]));
const imported = [];

for (const [workIndex, work] of works.entries()) {
  const id = `zcool-${work.id}`;
  const encodedId = work.pageUrl.match(/\/work\/(.+?)\.html/)?.[1];
  if (!encodedId) throw new Error(`Could not read the work URL for ${work.title}`);

  const detailUrl = `https://m.zcool.com.cn/work/${encodedId}.html`;
  const detailResponse = await fetchWithRetry(detailUrl, { headers: mobileHeaders });
  const detailHtml = await detailResponse.text();
  const details = parseNextData(detailHtml, work.title).props.pageProps.workData;
  const productImages = (details.productImages ?? []).filter(image => image.urlBig || image.url);
  if (!productImages.length) throw new Error(`No project images were found for ${work.title}`);

  const directory = path.join(root, 'public', 'images', 'projects', id);
  await fs.mkdir(directory, { recursive: true });
  const oldFiles = await fs.readdir(directory);
  await Promise.all(
    oldFiles
      .filter(file => /^\d{2,3}\.webp$/i.test(file))
      .map(file => fs.rm(path.join(directory, file), { force: true }))
  );

  if (!oldFiles.includes('cover.webp')) {
    const coverResponse = await fetchWithRetry(work.cover3x || work.cover, { headers: { referer: work.pageUrl } });
    const coverInput = Buffer.from(await coverResponse.arrayBuffer());
    await sharp(coverInput)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(path.join(directory, 'cover.webp'));
  }

  const images = await mapLimit(productImages, 4, async (image, imageIndex) => {
    const imageUrl = image.urlBig || image.url;
    const response = await fetchWithRetry(imageUrl, { headers: { referer: work.pageUrl } });
    const input = Buffer.from(await response.arrayBuffer());
    const filename = `${String(imageIndex + 1).padStart(2, '0')}.webp`;
    const outputPath = path.join(directory, filename);
    await sharp(input)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(outputPath);
    const metadata = await sharp(outputPath).metadata();
    return {
      image: `./images/projects/${id}/${filename}`,
      alt: `${work.title} · 效果图 ${imageIndex + 1}`,
      width: metadata.width ?? image.width ?? 1280,
      height: metadata.height ?? image.height ?? 720,
      sourceName: image.id || `ZCOOL image ${imageIndex + 1}`
    };
  });

  const existing = existingById.get(id);
  const category =
    existing?.category ??
    (/产业园|建筑|室内/.test(`${work.title} ${(work.tags || []).join(' ')}`)
      ? 'built-environment'
      : 'parks-green-space');
  imported.push({
    ...existing,
    id,
    title: work.title,
    category,
    image: `./images/projects/${id}/cover.webp`,
    description: cleanText(details.description),
    importedFrom: 'zcool',
    sourceUrl: work.pageUrl,
    publishedAt: new Date(work.publishTime).toISOString().slice(0, 10),
    images
  });
  console.log(`[${workIndex + 1}/${works.length}] ${work.title}: ${images.length} images`);
}

const importedIds = new Set(imported.map(project => project.id));
const mergedProjects = [...projects.filter(project => !importedIds.has(project.id)), ...imported];
const output = `// 分类与实际项目资料；图片为原始素材生成的网页优化副本。\nexport const categories = ${JSON.stringify(categories, null, 2)};\nexport const projects = ${JSON.stringify(mergedProjects, null, 2)};\n`;
await fs.writeFile(dataPath, output, 'utf8');

await fs.writeFile(
  path.join(root, 'zcool-import-manifest.json'),
  `${JSON.stringify(
    {
      source: profileUrl,
      status: 'projects-synced',
      syncedAt: new Date().toISOString(),
      totalImages: imported.reduce((sum, project) => sum + project.images.length, 0),
      works: imported.map(project => ({
        id: Number(project.id.replace('zcool-', '')),
        title: project.title,
        sourceUrl: project.sourceUrl,
        imageCount: project.images.length,
        status: 'project-synced'
      }))
    },
    null,
    2
  )}\n`,
  'utf8'
);

console.log(
  JSON.stringify({
    projects: imported.length,
    images: imported.reduce((sum, project) => sum + project.images.length, 0)
  })
);
