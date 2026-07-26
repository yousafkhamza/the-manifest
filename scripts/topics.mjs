// Topic + feed configuration for The Manifest.
// Every feed is an official, publisher-run RSS/Atom feed meant for syndication.
// We only ever keep the title, the feed's own summary, and a link back to the source.

export const TOPICS = [
  {
    id: "aws",
    name: "Amazon Web Services",
    short: "AWS",
    section: "Compute & Cloud",
    feeds: [
      "https://aws.amazon.com/blogs/aws/feed/",
      "https://aws.amazon.com/about-aws/whats-new/recent/feed/",
    ],
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    short: "Azure",
    section: "Compute & Cloud",
    feeds: ["https://azure.microsoft.com/en-us/blog/feed/"],
  },
  {
    id: "gcp",
    name: "Google Cloud",
    short: "GCP",
    section: "Compute & Cloud",
    feeds: ["https://cloud.google.com/feeds/gcp-release-notes.xml"],
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    short: "K8s",
    section: "Orchestration",
    feeds: ["https://kubernetes.io/feed.xml"],
  },
  {
    id: "terraform",
    name: "Terraform",
    short: "Terraform",
    section: "Infrastructure as Code",
    feeds: ["https://www.hashicorp.com/en/blog/feed.xml"],
  },
  {
    id: "python",
    name: "Python",
    short: "Python",
    section: "Languages & Runtimes",
    feeds: [
      "https://blog.python.org/feeds/posts/default",
      "https://pyfound.blogspot.com/feeds/posts/default",
    ],
  },
  {
    id: "go",
    name: "Go",
    short: "Go",
    section: "Languages & Runtimes",
    feeds: ["https://go.dev/blog/feed.atom"],
  },
  {
    id: "rust",
    name: "Rust",
    short: "Rust",
    section: "Languages & Runtimes",
    feeds: ["https://blog.rust-lang.org/feed.xml"],
  },
  {
    id: "javascript",
    name: "JavaScript / Node.js",
    short: "JS",
    section: "Languages & Runtimes",
    feeds: ["https://nodejs.org/en/feed/blog.xml"],
  },
];

// Tools tracked in the masthead's release ticker, resolved via the GitHub
// releases API. "prefix" strips a monorepo tag prefix; "tagFilter" skips
// pre-releases / unrelated tags in repos with noisy tag histories.
export const VERSION_TICKER = [
  { label: "Kubernetes", repo: "kubernetes/kubernetes" },
  { label: "Terraform", repo: "hashicorp/terraform" },
  { label: "Python", repo: "python/cpython", tagFilter: /^v\d+\.\d+\.\d+$/ },
  { label: "Go", repo: "golang/go", tagFilter: /^go\d+\.\d+(\.\d+)?$/ },
  { label: "Rust", repo: "rust-lang/rust", tagFilter: /^\d+\.\d+\.\d+$/ },
  { label: "Node.js", repo: "nodejs/node", tagFilter: /^v\d+\.\d+\.\d+$/ },
];

export const ARTICLES_PER_TOPIC = 8;
export const RETAIN_DAYS = 7;
