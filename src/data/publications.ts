import config from '@/site-config'
import { tagToSlug, type TagInfo } from 'astro-pure/utils'

export interface Publication {
  title: string
  authors: string
  venue: string
  year: string
  tags: string[]
  links?: Array<{ label: string; href: string }>
  backgroundImage?: string
  equalContribution?: boolean
}

const author = config.author

export const publications: Publication[] = [
  {
    title: 'A Generative Foundation Model for Cryo-EM Densities',
    authors:
      `Yilai Li*, <strong>${author}</strong>*, Yi Zhou*, Zhenghua Wang, Suyi Chen, Fengyu Yang, Haibin Ling, Shahar Z. Kovalsky, Xiaoqing Zheng, Quanquan Gu`,
    venue: 'bioRxiv',
    year: '2025',
    tags: ['Cryo-EM', 'Foundation Model', 'Inverse Problem'],
    links: [
      { label: 'Paper', href: 'https://doi.org/10.64898/2025.12.29.696802' },
      { label: 'Homepage', href: 'https://bytedance-seed.github.io/cryofm/blog/cryofm2/' },
      { label: 'Code', href: 'https://github.com/ByteDance-Seed/cryofm' }
    ],
    backgroundImage: '/images/publications/cover-cryofm2.webp',
    equalContribution: true
  },
  {
    title: 'CryoFM: A Flow-based Foundation Model for Cryo-EM Densities',
    authors: `Yi Zhou*, Yilai Li*, <strong>${author}</strong>*, Quanquan Gu`,
    venue: 'ICLR',
    year: '2025',
    tags: ['Cryo-EM', 'Foundation Model', 'Inverse Problem', 'Flow Matching'],
    links: [
      { label: 'OpenReview', href: 'https://openreview.net/forum?id=T4sMzjy7fO' },
      { label: 'Homepage', href: 'https://bytedance-seed.github.io/cryofm/blog/cryofm1/' },
      { label: 'Code', href: 'https://github.com/ByteDance-Seed/cryofm' }
    ],
    backgroundImage: '/images/publications/cover-cryofm1.webp',
    equalContribution: true
  },
  {
    title: 'CryoSTAR: leveraging structural priors and constraints for cryo-EM heterogeneous reconstruction',
    authors: `Yilai Li*, Yi Zhou*, <strong>${author}</strong>*, Fei Ye, Quanquan Gu`,
    venue: 'Nature Methods',
    year: '2024',
    tags: ['Cryo-EM', 'Heterogeneity', 'Elastic Network'],
    links: [
      { label: 'Paper', href: 'https://www.nature.com/articles/s41592-024-02486-1' },
      { label: 'Homepage', href: 'https://bytedance-seed.github.io/cryofm/blog/cryostar/' },
      { label: 'Code', href: 'https://github.com/bytedance/cryostar' }
    ],
    backgroundImage: '/images/publications/cover-cryostar.webp',
    equalContribution: true
  },
  {
    title: '3D Layout encoding network for spatial-aware 3D saliency modelling',
    authors: `<strong>${author}</strong>, Yang Cao, Yu Kang, Weiguo Song, Zhongcheng Yin, Rui Ba, Qing Ma`,
    venue: 'IET Computer Vision',
    year: '2019',
    tags: ['Saliency', 'RGB Depth Fusion', 'CNN'],
    links: [
      { label: 'Paper', href: 'https://ietresearch.onlinelibrary.wiley.com/doi/full/10.1049/iet-cvi.2018.5591' }
    ],
    backgroundImage: '/images/publications/cover-iet2019.webp',
  },
  {
    title: 'SmokeNet: Satellite Smoke Scene Detection Using Convolutional Neural Network with Spatial and Channel-Wise Attention',
    authors: `Rui Ba, Chen Chen, <strong>${author}</strong>, Weiguo Song, Siuming Lo`,
    venue: 'Remote Sensing',
    year: '2019',
    tags: ['Remote Sensing', 'Attention', 'CNN'],
    links: [
      { label: 'Paper', href: 'https://doi.org/10.3390/rs11141702' },
      { label: 'Homepage', href: 'https://complex.ustc.edu.cn/2019/0802/c18202a389656/page.htm' }
    ],
    backgroundImage: '/images/publications/cover-rs2019.webp',
  }
]

export function getPublicationTags(): string[] {
  return Array.from(new Set(publications.flatMap((pub) => pub.tags))).sort()
}

export function getPublicationTagsWithCount(): [string, number][] {
  const tagCounts = publications.reduce((acc, pub) => {
    pub.tags.forEach((tag) => acc.set(tag, (acc.get(tag) || 0) + 1))
    return acc
  }, new Map<string, number>())

  return [...tagCounts.entries()].sort((a, b) => b[1] - a[1])
}

export function getPublicationsByTag(tag: string): Publication[] {
  return publications.filter((pub) => pub.tags.includes(tag))
}

export function getPublicationTagsBySlug(): TagInfo[] {
  const map = new Map<string, string>()
  for (const pub of publications) {
    for (const raw of pub.tags) {
      const label = raw.trim()
      if (!label) continue
      const slug = tagToSlug(label)
      if (!slug) continue
      if (!map.has(slug)) map.set(slug, label)
    }
  }
  return [...map.entries()].map(([slug, label]) => ({ slug, label })).sort((a, b) =>
    a.label.localeCompare(b.label)
  )
}

export function getPublicationTagsWithCountBySlug(): Array<TagInfo & { count: number }> {
  const counts = new Map<string, { label: string; count: number }>()
  for (const pub of publications) {
    for (const raw of pub.tags) {
      const label = raw.trim()
      if (!label) continue
      const slug = tagToSlug(label)
      if (!slug) continue
      const prev = counts.get(slug)
      if (prev) prev.count += 1
      else counts.set(slug, { label, count: 1 })
    }
  }
  return [...counts.entries()]
    .map(([slug, v]) => ({ slug, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count)
}

export function getPublicationsByTagSlug(tagSlug: string): Publication[] {
  if (!tagSlug) return []
  return publications.filter((pub) => pub.tags.some((t) => tagToSlug(t) === tagSlug))
}
