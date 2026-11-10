/**
 * Udemy course categories + the keyword rules used by scripts/import-udemy.ts.
 *
 * Rules are evaluated top to bottom; the FIRST rule with a keyword match wins,
 * so put the more specific categories first. Matching is case-insensitive and
 * runs against the course title (and, as a fallback, the URL slug).
 *
 * To re-categorise: edit this file, then run `npm run import:udemy`.
 */
export const COURSE_CATEGORIES = [
  'Kubernetes & Containers',
  'DevOps & Cloud',
  'Security',
  'AI/ML & Computer Vision',
  'Embedded & IoT',
  'Game Dev & XR',
  'Networking',
  'Web Development',
  'Programming Languages',
  'Other',
] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export interface CategoryRule {
  category: CourseCategory;
  keywords: string[];
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'Kubernetes & Containers',
    keywords: ['kubernetes', 'ckad', 'cka ', 'helm', 'docker', 'argo', 'container', 'swarm'],
  },
  {
    category: 'AI/ML & Computer Vision',
    keywords: [
      'machine learning',
      'deep learning',
      'computer vision',
      'opencv',
      'pytorch',
      'tensorflow',
      'mlops',
      'llmops',
      'llm',
      'neural',
      'autonomous car',
      'self driving',
      'image processing',
    ],
  },
  {
    category: 'Security',
    keywords: ['security', 'cybersecurity', 'ethical hacking', 'pentest', 'iptables', 'firewall', 'devsecops'],
  },
  {
    category: 'DevOps & Cloud',
    keywords: [
      'devops',
      'aws',
      'azure',
      'gcp',
      'google cloud',
      'terraform',
      'ansible',
      'chef',
      'jenkins',
      'gitlab',
      'github actions',
      'ci/cd',
      'gitops',
      'grafana',
      'prometheus',
      'observability',
      'linux',
      'wsl',
      'windows server',
      'powershell',
      'command line',
      'servicenow',
      'git ',
      'git&',
      'github',
      'bitbucket',
      'sourcetree',
      'cmake',
      'coolify',
    ],
  },
  {
    category: 'Embedded & IoT',
    keywords: ['embedded', 'microcontroller', 'esp32', 'arduino', 'iot', 'pcb', 'electronics', 'driver development'],
  },
  {
    category: 'Game Dev & XR',
    keywords: ['unity', 'game', 'blender', 'vr ', 'xr', 'haptic', '3d character', 'jocuri'],
  },
  {
    category: 'Networking',
    keywords: ['network', 'ccna', 'gns3', 'cisco'],
  },
  {
    category: 'Web Development',
    keywords: [
      'web development',
      'full-stack',
      'full stack',
      'react',
      'next.js',
      'angular',
      'nestjs',
      'node',
      'php',
      'mongodb',
      'sql',
      'html',
      'css',
      'javascript',
      'spring',
      'wordpress',
    ],
  },
  {
    category: 'Programming Languages',
    keywords: [
      'python',
      'java',
      'c#',
      'c++',
      'c programming',
      'data structures',
      'algorithms',
      'recursion',
      'leetcode',
      'rust',
      'go ',
      'golang',
    ],
  },
];

/** Technology slugs inferred from course titles, so /stack/[tech] can list courses. */
export const COURSE_STACK_RULES: Array<{ slug: string; keywords: string[] }> = [
  // containers & orchestration
  { slug: 'kubernetes', keywords: ['kubernetes', 'ckad', 'helm', 'argo'] },
  { slug: 'docker', keywords: ['docker', 'container', 'swarm'] },
  { slug: 'helm', keywords: ['helm'] },
  { slug: 'argo-cd', keywords: ['argo'] },
  { slug: 'coolify', keywords: ['coolify'] },
  // cloud, IaC, CI/CD
  { slug: 'devops', keywords: ['devops'] },
  { slug: 'devsecops', keywords: ['devsecops'] },
  { slug: 'aws', keywords: ['aws'] },
  { slug: 'azure', keywords: ['azure'] },
  { slug: 'terraform', keywords: ['terraform'] },
  { slug: 'ansible', keywords: ['ansible'] },
  { slug: 'chef', keywords: ['chef'] },
  { slug: 'jenkins', keywords: ['jenkins'] },
  { slug: 'gitlab-ci', keywords: ['gitlab'] },
  { slug: 'github-actions', keywords: ['github actions'] },
  { slug: 'git', keywords: ['git ', 'git&', 'github', 'bitbucket'] },
  { slug: 'github', keywords: ['github'] },
  { slug: 'bitbucket', keywords: ['bitbucket'] },
  { slug: 'sourcetree', keywords: ['sourcetree'] },
  // observability
  { slug: 'grafana', keywords: ['grafana'] },
  { slug: 'prometheus', keywords: ['prometheus'] },
  { slug: 'loki', keywords: ['loki'] },
  // operating systems
  { slug: 'linux', keywords: ['linux', 'wsl', 'iptables'] },
  { slug: 'iptables', keywords: ['iptables'] },
  { slug: 'windows', keywords: ['wsl', 'windows command line', 'ms-dos', 'powershell'] },
  { slug: 'windows-server', keywords: ['windows server'] },
  { slug: 'powershell', keywords: ['powershell'] },
  // languages
  { slug: 'python', keywords: ['python'] },
  { slug: 'r', keywords: ['python & r'] },
  { slug: 'java', keywords: ['java ', 'java:', 'spring'] },
  { slug: 'spring', keywords: ['spring'] },
  { slug: 'csharp', keywords: ['c#'] },
  { slug: 'cpp', keywords: ['c++', 'c and c++'] },
  { slug: 'c', keywords: [' c programming', 'embedded c', 'c language', 'using c and'] },
  { slug: 'cmake', keywords: ['cmake'] },
  { slug: 'php', keywords: ['php'] },
  { slug: 'typescript', keywords: ['typescript', 'nestjs', 'angular'] },
  { slug: 'algorithms', keywords: ['data structures', 'algorithms', 'leetcode', 'dynamic programming', 'backtracking'] },
  // web
  { slug: 'html', keywords: ['web development'] },
  { slug: 'css', keywords: ['web development'] },
  { slug: 'javascript', keywords: ['web development', 'react', 'next.js', 'angular'] },
  { slug: 'react', keywords: ['react'] },
  { slug: 'nextjs', keywords: ['next.js'] },
  { slug: 'angular', keywords: ['angular'] },
  { slug: 'nestjs', keywords: ['nestjs'] },
  { slug: 'nodejs', keywords: ['node', 'nestjs'] },
  { slug: 'wordpress', keywords: ['wordpress'] },
  // data
  { slug: 'mongodb', keywords: ['mongodb'] },
  { slug: 'redis', keywords: ['redis'] },
  { slug: 'sql', keywords: ['sql'] },
  { slug: 'numpy', keywords: ['numpy'] },
  // AI / ML
  { slug: 'tensorflow', keywords: ['tensorflow'] },
  { slug: 'pytorch', keywords: ['pytorch'] },
  { slug: 'keras', keywords: ['keras'] },
  { slug: 'opencv', keywords: ['opencv', 'computer vision', 'image processing'] },
  { slug: 'computer-vision', keywords: ['computer vision', 'image processing', 'self driving', 'autonomous car'] },
  { slug: 'machine-learning', keywords: ['machine learning', 'deep learning', 'mlops', 'llm'] },
  { slug: 'mlops', keywords: ['mlops', 'llmops'] },
  { slug: 'generative-ai', keywords: ['llm', 'gpt', 'gen ai', 'with ai', 'gans'] },
  // game dev, XR, audio
  { slug: 'unity', keywords: ['unity'] },
  { slug: 'blender', keywords: ['blender'] },
  { slug: 'virtual-reality', keywords: [' vr ', ' xr '] },
  { slug: 'haptics', keywords: ['haptic'] },
  { slug: 'audio-processing', keywords: ['audio', 'edit sound'] },
  // embedded
  { slug: 'esp32', keywords: ['esp32'] },
  { slug: 'arduino', keywords: ['arduino'] },
  { slug: 'embedded', keywords: ['embedded', 'microcontroller', 'esp-idf'] },
  { slug: 'electronics', keywords: ['electronics', 'pcb'] },
  // networking & security
  { slug: 'networking', keywords: ['network', 'ccna', 'gns3'] },
  { slug: 'cisco', keywords: ['ccna'] },
  { slug: 'gns3', keywords: ['gns3'] },
  { slug: 'cybersecurity', keywords: ['security', 'pentest', 'hacking'] },
  // IT service management
  { slug: 'servicenow', keywords: ['servicenow'] },
];
