// Articoli: ogni file .md in src/articles/ è un articolo. Con "draft: true" non viene pubblicato.
export type ArticleMeta = {
  title: string;
  description: string;
  date: string;
  audience?: 'clinicians' | 'public';
  draft?: boolean;
};
type Mod = { frontmatter: ArticleMeta; Content: any; file: string };

const modules = import.meta.glob<Mod>('../articles/*.md', { eager: true });

export const articles = Object.entries(modules)
  .map(([path, mod]) => ({
    slug: path.split('/').pop()!.replace(/\.md$/, ''),
    ...mod.frontmatter,
    Content: mod.Content,
  }))
  .filter((a) => !a.draft && !a.slug.startsWith('_'))
  .sort((a, b) => b.date.localeCompare(a.date));

export const hasArticles = articles.length > 0;
