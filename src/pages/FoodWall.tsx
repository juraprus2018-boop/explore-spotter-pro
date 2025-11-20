import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Tag as TagIcon,
  Heart,
  Share2,
  ImagePlus,
  Users,
  Sparkles,
  Loader2,
} from "lucide-react";
import { 
  fetchFoodwallPosts, 
  createFoodwallPost, 
  updateFoodwallLikes,
  type FoodwallPost 
} from "@/lib/foodwall";

interface FoodPost {
  id: string;
  images: string[];
  description: string;
  tags: string[];
  likes: number;
  liked?: boolean;
  author: string;
  location: string;
  createdAt: string;
}

const demoPosts: FoodPost[] = [
  {
    id: "tokyo",
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "Weekend ramen crawl success! This triple-miso bowl from a hidden alley in Shinjuku had the perfect balance of smoke and spice.",
    tags: ["ramen", "tokyo", "spicy"],
    likes: 124,
    author: "Mika Tanaka",
    location: "Shinjuku, Tokyo",
    createdAt: "2024-03-11T08:30:00.000Z",
  },
  {
    id: "lisbon",
    images: [
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "Sunset petiscos on a rooftop overlooking the Tejo river. Grilled sardines, citrus olives, and smoky piri-piri chicken skewers!",
    tags: ["petiscos", "lisbon", "sunset", "seafood"],
    likes: 96,
    author: "João Pereira",
    location: "Lisbon, Portugal",
    createdAt: "2024-03-09T18:12:00.000Z",
  },
  {
    id: "mexico-city",
    images: [
      "https://images.unsplash.com/photo-1478749485505-2a903a729c63?auto=format&fit=crop&w=1600&q=80",
    ],
    description:
      "Taco al pastor perfection with extra charred pineapple. Street-side dining near Parque México hits different.",
    tags: ["tacos", "cdmx", "streetfood"],
    likes: 173,
    author: "Sofía Morales",
    location: "Mexico City, Mexico",
    createdAt: "2024-03-05T14:45:00.000Z",
  },
];


type SortMode = "latest" | "popular" | "favorites";

const FoodWall = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");

  // Load posts from database
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await fetchFoodwallPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error loading posts:", error);
        toast({
          variant: "destructive",
          title: t("foodwall.error.loadFailed"),
          description: t("foodwall.error.tryAgain"),
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, [toast, t]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasFilters = Boolean(normalizedQuery || activeTag || sortMode !== "latest");
  const sortOptions: { value: SortMode; label: string }[] = [
    { value: "latest", label: t("foodwall.filters.sortLatest") },
    { value: "popular", label: t("foodwall.filters.sortPopular") },
    { value: "favorites", label: t("foodwall.filters.sortFavorites") },
  ];

  const totalLikes = useMemo(
    () => posts.reduce((acc, post) => acc + post.likes, 0),
    [posts]
  );
  const uniqueTags = useMemo(() => {
    const allTags = posts.flatMap((post) => post.tags);
    return Array.from(new Set(allTags));
  }, [posts]);

  const trendingTags = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let computed = posts;

    if (normalizedQuery) {
      computed = computed.filter((post) => {
        const haystack = `${post.description} ${post.author} ${post.location} ${post.tags.join(" ")}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }

    if (activeTag) {
      computed = computed.filter((post) => post.tags.includes(activeTag));
    }

    if (sortMode === "favorites") {
      computed = computed.filter((post) => post.liked);
    }

    const sorter = sortMode === "popular"
      ? (a: FoodPost, b: FoodPost) => b.likes - a.likes
      : (a: FoodPost, b: FoodPost) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    return [...computed].sort(sorter);
  }, [posts, normalizedQuery, activeTag, sortMode]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []).slice(0, 4);
    setFiles(selectedFiles);
  };

  const handleAddTag = useCallback(() => {
    const nextTag = tagInput.trim();
    if (!nextTag || tags.includes(nextTag)) return;
    setTags((prev) => [...prev, nextTag]);
    setTagInput("");
  }, [tagInput, tags]);

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!description.trim() && files.length === 0) {
      toast({
        variant: "destructive",
        title: t("foodwall.toast.missingTitle"),
        description: t("foodwall.toast.missingDesc"),
      });
      return;
    }

    if (!author.trim() || !location.trim()) {
      toast({
        variant: "destructive",
        title: t("foodwall.error.missingInfo"),
        description: t("foodwall.error.provideAuthorLocation"),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newPost = await createFoodwallPost({
        description: description.trim(),
        tags: tags.length ? tags : ["foodie"],
        files,
        author: author.trim(),
        location: location.trim(),
      });

      setPosts((prev) => [newPost, ...prev]);
      setDescription("");
      setFiles([]);
      setTags([]);
      setTagInput("");
      setAuthor("");
      setLocation("");

      toast({
        title: t("foodwall.toast.published"),
        description: t("foodwall.toast.publishedDesc"),
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        variant: "destructive",
        title: t("foodwall.error.uploadFailed"),
        description: t("foodwall.error.tryAgain"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveTag(null);
    setSortMode("latest");
  };

  const handleTagFilter = (tag: string) => {
    setActiveTag((current) => (current === tag ? null : tag));
  };

  const toggleLike = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const newLikes = post.liked ? post.likes - 1 : post.likes + 1;
    const wasLiked = post.liked;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, likes: newLikes, liked: !wasLiked }
          : p
      )
    );

    try {
      await updateFoodwallLikes(id, newLikes);
    } catch (error) {
      console.error("Error updating likes:", error);
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, likes: post.likes, liked: wasLiked }
            : p
        )
      );
      toast({
        variant: "destructive",
        title: t("foodwall.error.likeFailed"),
        description: t("foodwall.error.tryAgain"),
      });
    }
  };

  const handleShare = async (post: FoodPost) => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}#food-${post.id}`
        : `#food-${post.id}`;
    const shareData = {
      title: t("foodwall.share.title"),
      text: post.description,
      url,
    };

    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await (navigator as any).share(shareData);
        toast({
          title: t("foodwall.share.shared"),
          description: t("foodwall.share.native"),
        });
        return;
      }

      if (typeof navigator !== "undefined" && "clipboard" in navigator) {
        const nav = navigator as Navigator & { clipboard: Clipboard };
        await nav.clipboard.writeText(url);
        toast({
          title: t("foodwall.share.shared"),
          description: t("foodwall.share.copied"),
        });
        return;
      }

      toast({
        variant: "destructive",
        title: t("foodwall.share.error"),
        description: t("foodwall.share.unsupported"),
      });
    } catch (error) {
      console.error("Share failed", error);
      toast({
        variant: "destructive",
        title: t("foodwall.share.error"),
        description: t("foodwall.share.failed"),
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{t("foodwall.seoTitle")}</title>
        <meta name="description" content={t("foodwall.seoDescription")} />
      </Helmet>
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 via-background to-background border-b">
          <div className="container mx-auto px-4 py-12 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-[3fr,2fr] lg:items-center">
              <div>
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground mb-6">
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  {t("foodwall.heroTag")}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {t("foodwall.title")}
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                  {t("foodwall.subtitle")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="bg-background/80">
                    <CardContent className="pt-6">
                      <p className="text-3xl font-bold text-foreground">{posts.length}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("foodwall.metrics.posts")}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/80">
                    <CardContent className="pt-6">
                      <p className="text-3xl font-bold text-foreground">{totalLikes}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("foodwall.metrics.likes")}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/80">
                    <CardContent className="pt-6">
                      <p className="text-3xl font-bold text-foreground">{uniqueTags.length}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("foodwall.metrics.tags")}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <Card className="bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImagePlus className="h-5 w-5 text-primary" />
                    {t("foodwall.upload.title")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("foodwall.upload.subtitle")}
                  </p>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <label className="flex items-center justify-between text-sm font-medium mb-2">
                        {t("foodwall.upload.images")}
                        <span className="text-xs text-muted-foreground">
                          {t("foodwall.upload.imageHint")}
                        </span>
                      </label>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                      {files.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {files.length} {t("foodwall.upload.filesSelected")}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t("foodwall.upload.author")}
                      </label>
                      <Input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder={t("foodwall.upload.authorPlaceholder")}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t("foodwall.upload.location")}
                      </label>
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={t("foodwall.upload.locationPlaceholder")}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t("foodwall.upload.description")}
                      </label>
                      <Textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder={t("foodwall.upload.descriptionPlaceholder")}
                        className="min-h-[120px]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t("foodwall.upload.tags")}
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(event) => setTagInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder={t("foodwall.upload.tagsPlaceholder")}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleAddTag}
                          className="gap-2"
                        >
                          <TagIcon className="h-4 w-4" />
                          {t("foodwall.upload.addTag")}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("foodwall.upload.tagHint")}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t("foodwall.upload.posting")}
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          {t("foodwall.upload.publish")}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[2.5fr,1fr]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("foodwall.feed.title")}
                  </h2>
                  <p className="text-muted-foreground">
                    {t("foodwall.feed.subtitle")}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-muted/40 border-dashed">
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("foodwall.filters.searchLabel")}
                      </label>
                      <Input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder={t("foodwall.filters.searchPlaceholder")}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">
                          {t("foodwall.filters.sortLabel")}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleResetFilters}
                          disabled={!hasFilters}
                        >
                          {t("foodwall.filters.clearAll")}
                        </Button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {sortOptions.map((option) => (
                          <Button
                            key={option.value}
                            type="button"
                            variant={sortMode === option.value ? "default" : "outline"}
                            className="justify-center"
                            onClick={() => setSortMode(option.value)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">
                          {t("foodwall.filters.tagLabel")}
                        </p>
                        {activeTag && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTag(null)}
                          >
                            {t("foodwall.filters.clearTag")}
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {uniqueTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={activeTag === tag ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => handleTagFilter(tag)}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {filteredPosts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      {hasFilters
                        ? t("foodwall.feed.emptyFiltered")
                        : t("foodwall.feed.empty")}
                    </CardContent>
                  </Card>
                ) : (
                  filteredPosts.map((post) => (
                    <Card key={post.id} id={`food-${post.id}`} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="grid gap-4">
                        <div className="p-6 pb-0">
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              <span className="font-medium text-foreground">{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Camera className="h-4 w-4" />
                              {post.location}
                            </div>
                          </div>
                          <p className="mt-4 text-lg text-foreground leading-relaxed">
                            {post.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {post.images.length > 0 && (
                          <div className="grid gap-2 p-6 pt-0">
                            {post.images.length === 1 ? (
                              <div className="aspect-video rounded-xl overflow-hidden">
                                <img
                                  src={post.images[0]}
                                  alt={post.description}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="grid md:grid-cols-[2fr,1fr] gap-2">
                                <div className="aspect-video rounded-xl overflow-hidden">
                                  <img
                                    src={post.images[0]}
                                    alt={post.description}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {post.images.slice(1).map((image, index) => (
                                    <div
                                      key={index}
                                      className="aspect-square rounded-xl overflow-hidden"
                                    >
                                      <img
                                        src={image}
                                        alt={post.description}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <div className="border-t p-4 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        className="gap-2"
                        onClick={() => toggleLike(post.id)}
                      >
                        <Heart
                          className={`h-4 w-4 ${post.liked ? "fill-primary text-primary" : ""}`}
                        />
                        {post.likes}
                        <span className="sr-only">
                          {post.liked
                            ? t("foodwall.feed.liked")
                            : t("foodwall.feed.like")}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="gap-2"
                        onClick={() => handleShare(post)}
                      >
                        <Share2 className="h-4 w-4" />
                        {t("foodwall.feed.share")}
                      </Button>
                    </div>
                  </Card>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("foodwall.tags.title")}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("foodwall.tags.subtitle")}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={activeTag === tag ? "default" : "secondary"}
                        className="text-sm cursor-pointer"
                        onClick={() => handleTagFilter(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {t("foodwall.community.title")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("foodwall.community.subtitle")}
                  </p>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-3">
                  <p>{t("foodwall.community.pointOne")}</p>
                  <p>{t("foodwall.community.pointTwo")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FoodWall;
