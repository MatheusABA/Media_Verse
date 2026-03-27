import { db } from "../db/db";
import { reviews, lists, votes, comments, users, userMedia, media } from "../db/schema";
import { eq, desc, and, or, inArray, sql } from "drizzle-orm";

export async function getDiscoverFeed(currentUserId?: string) {
  // 1. Busca as últimas reviews
  const recentReviews = await db
    .select({
      id: reviews.id,
      content: reviews.content,
      createdAt: reviews.createdAt,
      user: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
      media: {
        id: media.tmdbId,
        title: media.title,
        type: media.type,
        posterUrl: media.posterUrl,
      },
      userMediaRating: userMedia.rating,
    })
    .from(reviews)
    .innerJoin(userMedia, eq(reviews.userMediaId, userMedia.id))
    .innerJoin(users, eq(userMedia.userId, users.id))
    .innerJoin(media, eq(userMedia.mediaId, media.id))
    .orderBy(desc(reviews.createdAt))
    .limit(20);

  // 2. Busca as últimas listas públicas
  const recentLists = await db
    .select({
      id: lists.id,
      title: lists.title,
      description: lists.description,
      createdAt: lists.createdAt,
      user: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(lists)
    .innerJoin(users, eq(lists.userId, users.id))
    .where(eq(lists.visibility, "public"))
    .orderBy(desc(lists.createdAt))
    .limit(20);

  // Formata e une tudo
  const feedItems = [
    ...recentReviews.map((r) => ({ type: "review" as const, ...r })),
    ...recentLists.map((l) => ({ type: "list" as const, ...l })),
  ];

  // Ordena globalmente pela data de criação
  feedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Pegar interações (Votos Totais e Comentários) para cada item
  // Num sistema real, usaríamos agregações diretas na query. 
  // Aqui faremos loops paralelos pra montar a árvore rápido no Drizzle.
  for (const item of feedItems) {
    if (item.type === "review") {
      const voteData = await db
        .select({ total: sql<number>`COALESCE(SUM(${votes.value}), 0)` })
        .from(votes)
        .where(eq(votes.reviewId, item.id));

      const commentCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(comments)
        .where(eq(comments.reviewId, item.id));

      (item as any).score = Number(voteData[0]?.total || 0);
      (item as any).commentCount = Number(commentCount[0]?.count || 0);
      
      if (currentUserId) {
        const myVote = await db.query.votes.findFirst({
           where: and(eq(votes.userId, currentUserId), eq(votes.reviewId, item.id))
        });
        (item as any).myVote = myVote?.value || 0;
      }
    } else {
      const voteData = await db
        .select({ total: sql<number>`COALESCE(SUM(${votes.value}), 0)` })
        .from(votes)
        .where(eq(votes.listId, item.id));

      const commentCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(comments)
        .where(eq(comments.listId, item.id));

      (item as any).score = Number(voteData[0]?.total || 0);
      (item as any).commentCount = Number(commentCount[0]?.count || 0);

      if (currentUserId) {
        const myVote = await db.query.votes.findFirst({
           where: and(eq(votes.userId, currentUserId), eq(votes.listId, item.id))
        });
        (item as any).myVote = myVote?.value || 0;
      }
    }
  }

  return feedItems;
}

export async function addVote(userId: string, targetType: "review" | "list", targetId: string, value: 1 | -1) {
    // 1. Apaga voto existente se tiver (toggle)
    await db.delete(votes).where(
        and(
            eq(votes.userId, userId),
            targetType === "review" ? eq(votes.reviewId, targetId) : eq(votes.listId, targetId)
        )
    );

    // Se o valor for 0 no frontend, significa que ele só tirou o voto. Apenas removemos.
    if (value === 0 as any) return { success: true, removed: true };

    // 2. Insere o novo voto
    await db.insert(votes).values({
        userId,
        reviewId: targetType === "review" ? targetId : null,
        listId: targetType === "list" ? targetId : null,
        value
    });

    return { success: true };
}

export async function addComment(userId: string, targetType: "review" | "list", targetId: string, content: string) {
    const [created] = await db.insert(comments).values({
        userId,
        reviewId: targetType === "review" ? targetId : null,
        listId: targetType === "list" ? targetId : null,
        content
    }).returning();
    
    return created;
}