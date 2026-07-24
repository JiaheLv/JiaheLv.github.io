import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FuseResult } from 'fuse.js';

interface SearchArticle {
  title: string;
  description: string;
  slug: string;
  pubDate: string;
  tags: string[];
  author: string;
  categories?: string[];
  subject?: string;
}

type SearchResult = FuseResult<SearchArticle>;
type SearchEngine = {
  search: (query: string) => SearchResult[];
};

interface SearchIslandProps {
  dataTimestamp: number;
  initialQuery?: string;
  siteTitle?: string;
}

const getBasePath = () => {
  if (typeof window !== 'undefined' && window.BASE_PATH) {
    return window.BASE_PATH;
  }

  return import.meta.env.BASE_URL || '';
};

const getLink = (path: string) => {
  const basePath = getBasePath();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (basePath.endsWith('/')) {
    return basePath.slice(0, -1) + normalizedPath;
  }

  return `${basePath}${normalizedPath}`;
};

const SearchResultCard = React.memo(function SearchResultCard({
  post,
  formatDate
}: {
  post: SearchArticle;
  formatDate: (dateString: string) => string;
}) {
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-lg border-2 border-black bg-[rgba(255,228,196,0.25)] shadow-sm transition-all hover:scale-[1.01] hover:shadow-md"
    >
      <div className="p-3 flex flex-col flex-grow">
        <div className="m-0 p-0">
          <a href={getLink(`/blogs/${post.slug}`)} className="hover:underline decoration-black">
            <h2 className="mb-1 text-xl font-bold text-black">{post.title}</h2>
          </a>
        </div>
        <div className="m-0 p-0 flex-grow">
          <p className="mb-2 text-slate-600 text-sm line-clamp-3">{post.description}</p>
        </div>

        <div className="mb-2">
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <a
                key={tag}
                href={getLink(`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`)}
                className="rounded-full bg-tag-highlight px-2 py-0.5 text-xs text-[#332113] transition-colors hover:bg-tag-highlight-strong hover:text-black"
              >
                {tag}
              </a>
            ))}
            {post.tags.length > 3 && (
              <span
                className="rounded-full bg-tag-highlight px-2 py-0.5 text-xs text-[#332113]"
              >
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="m-0 pt-2 border-t-2 border-black">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 truncate max-w-[50%]">
              By {post.author || 'Anonymous'}
            </span>
            <time dateTime={post.pubDate} className="text-xs text-slate-500">
              {formatDate(post.pubDate)}
            </time>
          </div>
        </div>
      </div>
    </article>
  );
});

const SearchIsland = ({
  dataTimestamp,
  initialQuery = '',
  siteTitle = ''
}: SearchIslandProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchArticles, setSearchArticles] = useState<SearchArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const fuseRef = useRef<SearchEngine | null>(null);
  const initialQueryRun = useRef(false);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const performSearch = useCallback((query: string, updateUrl = true) => {
    if (!query || !fuseRef.current) {
      setSearchResults([]);
      return;
    }

    const results = fuseRef.current.search(query);
    setSearchResults(results);

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('q', query);
      history.pushState({}, '', url);
    }

    document.title = `Search: ${query}${siteTitle ? ` | ${siteTitle}` : ''}`;
  }, [siteTitle]);

  const resetSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);

    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    history.pushState({}, '', url);
    document.title = `Search${siteTitle ? ` | ${siteTitle}` : ''}`;
  }, [siteTitle]);

  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const trimmedQuery = query.trim();
    if (trimmedQuery.length >= 2) {
      performSearch(trimmedQuery);
    } else if (trimmedQuery.length === 0) {
      resetSearch();
    }
  }, [performSearch, resetSearch]);

  useEffect(() => {
    const handlePopState = () => {
      const queryFromUrl = new URLSearchParams(window.location.search).get('q') || '';
      setSearchQuery(queryFromUrl);

      if (fuseRef.current && queryFromUrl) {
        setSearchResults(fuseRef.current.search(queryFromUrl));
      } else {
        setSearchResults([]);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeSearch = async () => {
      if (isInitialized) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(getLink(`/api/search.json?v=${dataTimestamp}`));
        if (!response.ok) {
          throw new Error('Failed to fetch search data');
        }

        const data = await response.json() as SearchArticle[];
        if (!isMounted) {
          return;
        }

        setSearchArticles(data);

        const fuseModule = await import('fuse.js');
        if (!isMounted) {
          return;
        }

        const Fuse = fuseModule.default;
        fuseRef.current = new Fuse(data, {
          keys: [
            { name: 'title', weight: 2 },
            { name: 'description', weight: 1.5 },
            { name: 'subject', weight: 1.5 },
            { name: 'tags', weight: 1 },
            { name: 'categories', weight: 1 },
            { name: 'author', weight: 0.5 }
          ],
          includeScore: true,
          threshold: 0.5,
          ignoreLocation: true,
          isCaseSensitive: false,
          findAllMatches: true,
          minMatchCharLength: 2
        });

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing search:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initializeSearch();

    return () => {
      isMounted = false;
    };
  }, [dataTimestamp, isInitialized]);

  useEffect(() => {
    if (!isInitialized || initialQueryRun.current) {
      return;
    }

    if (initialQuery) {
      performSearch(initialQuery, false);
    }

    initialQueryRun.current = true;
  }, [initialQuery, isInitialized, performSearch]);

  const searchResultsList = useMemo(() => {
    if (!searchQuery || searchResults.length === 0) {
      return null;
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        {searchResults.map((result) => (
          <SearchResultCard
            key={result.item.slug}
            post={result.item}
            formatDate={formatDate}
          />
        ))}
      </div>
    );
  }, [formatDate, searchQuery, searchResults]);

  const allArticlesList = useMemo(() => {
    if (searchQuery || isLoading || searchArticles.length === 0) {
      return null;
    }

    return (
      <>
        <h2 className="text-2xl font-bold mb-6">All Articles</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {searchArticles.map((post) => (
            <SearchResultCard
              key={post.slug}
              post={post}
              formatDate={formatDate}
            />
          ))}
        </div>
      </>
    );
  }, [formatDate, isLoading, searchArticles, searchQuery]);

  return (
    <div className="mx-auto">
      <div className="mb-2">
        <div className="relative">
          <input
            type="text"
            id="search-input"
            placeholder="Search articles, tags or categories..."
            className="w-full rounded-lg border-2 border-black bg-[rgba(255,228,196,0.4)] p-2 pr-12 text-2xl text-slate-900 placeholder-slate-400 focus:scale-[1.01] focus:border-2 focus:border-black focus:outline-none focus:ring-0"
            value={searchQuery}
            onChange={handleSearchInput}
          />
          <div className="absolute right-4 top-4 text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {searchQuery && (
        <div className="text-center m-0 p-0">
          <p className="text-slate-600">
            鍏辨湁 <span>{searchResults.length}</span> 涓粨鏋滃尮閰?"<span>{searchQuery}</span>"
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-slate-600">Loading...</p>
        </div>
      )}

      {searchResultsList}

      {searchQuery && searchResults.length === 0 && !isLoading && isInitialized && (
        <div className="text-center py-12">
          <p className="text-xl text-slate-600">No matching articles found.</p>
          <p className="mt-2 text-slate-500">
            Try different keywords or
            <button onClick={resetSearch} className="text-indigo-600 hover:underline ml-1">
              view all articles
            </button>
          </p>
        </div>
      )}

      {allArticlesList}
    </div>
  );
};

export default React.memo(SearchIsland);
