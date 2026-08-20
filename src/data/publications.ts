/**
 * About page → "Recent Research Work". Newest first.
 *
 * The page renders only entries marked `featured`, as title + `desc` + links,
 * with `coFirst` folded into the venue line — see src/pages/about.astro. The
 * unfeatured entries and the author lists stay here for the record.
 * `title` and `authors` accept inline HTML — `<strong>` marks the site author,
 * `*` marks equal contribution.
 */
export type Publication = {
  title: string;
  authors: string;
  /** Journal / conference / preprint server. */
  venue: string;
  year: string;
  /** One-line summary, shown under the title. */
  desc?: string;
  /** Co-first author on this paper — noted on the venue line. */
  coFirst?: boolean;
  /** Shown on the About page. */
  featured?: boolean;
  links?: { label: string; url: string }[];
};

const me = '<strong>Jing Yuan</strong>';

export const publications: Publication[] = [
  {
    title: 'A Generative Foundation Model for Cryo-EM Densities',
    authors: `Yilai Li*, ${me}*, Yi Zhou*, Zhenghua Wang, Suyi Chen, Fengyu Yang, Haibin Ling, Shahar Z. Kovalsky, Xiaoqing Zheng, Quanquan Gu`,
    venue: 'bioRxiv preprint',
    year: '2025',
    desc: 'The extended CryoFM: a generative prior over cryo-EM densities, scaled up and reused across a wider set of downstream reconstruction tasks.',
    links: [
      { label: 'paper', url: 'https://doi.org/10.64898/2025.12.29.696802' },
      { label: 'page', url: 'https://bytedance-seed.github.io/cryofm/blog/cryofm2/' },
      { label: 'code', url: 'https://github.com/ByteDance-Seed/cryofm' },
    ],
  },
  {
    title: '<em>CryoFM</em>: a flow-based foundation model for cryo-EM densities',
    authors: `Yi Zhou*, Yilai Li*, ${me}*, Quanquan Gu`,
    venue: 'ICLR',
    year: '2025',
    desc: 'The first foundation model for 3D cryo-EM density maps.',
    coFirst: true,
    featured: true,
    links: [
      { label: 'openreview', url: 'https://openreview.net/forum?id=T4sMzjy7fO' },
      { label: 'page', url: 'https://bytedance-seed.github.io/cryofm/blog/cryofm1/' },
      { label: 'code', url: 'https://github.com/ByteDance-Seed/cryofm' },
    ],
  },
  {
    title:
      '<em>CryoSTAR</em>: leveraging structural priors and constraints for cryo-EM heterogeneous reconstruction',
    authors: `Yilai Li*, Yi Zhou*, ${me}*, Fei Ye, Quanquan Gu`,
    venue: 'Nature Methods',
    year: '2024',
    desc: 'The first successful use of structural priors for heterogeneous reconstruction on real cryo-EM data.',
    coFirst: true,
    featured: true,
    links: [
      { label: 'paper', url: 'https://www.nature.com/articles/s41592-024-02486-1' },
      { label: 'page', url: 'https://bytedance-seed.github.io/cryofm/blog/cryostar/' },
      { label: 'code', url: 'https://github.com/bytedance/cryostar' },
    ],
  },
  {
    title: '3D Layout encoding network for spatial-aware 3D saliency modelling',
    authors: `${me}, Yang Cao, Yu Kang, Weiguo Song, Zhongcheng Yin, Rui Ba, Qing Ma`,
    venue: 'IET Computer Vision',
    year: '2019',
    desc: 'Encoding scene layout into a saliency network, so that where a viewer looks is predicted from 3D spatial structure rather than 2D appearance alone.',
    links: [
      {
        label: 'paper',
        url: 'https://ietresearch.onlinelibrary.wiley.com/doi/full/10.1049/iet-cvi.2018.5591',
      },
    ],
  },
  {
    title:
      '<em>SmokeNet</em>: Satellite Smoke Scene Detection Using Convolutional Neural Network with Spatial and Channel-Wise Attention',
    authors: `Rui Ba, Chen Chen, ${me}, Weiguo Song, Siuming Lo`,
    venue: 'Remote Sensing',
    year: '2019',
    desc: 'Smoke-scene detection in satellite imagery, using spatial and channel-wise attention to separate smoke from visually similar cloud and haze.',
    links: [
      { label: 'paper', url: 'https://doi.org/10.3390/rs11141702' },
      { label: 'page', url: 'https://complex.ustc.edu.cn/2019/0802/c18202a389656/page.htm' },
    ],
  },
];
