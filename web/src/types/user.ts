import { ReviewedMedia } from "./review";

export type userData = {
    username: string;
    email: string;
    bio: string | null;
    avatarUrl: string | null;
}

export type ProfileData = {
    user: {
        id: string
        username: string
        email: string
        bio: string | null
        avatarUrl: string | null
        location: string | null
        createdAt: string
    }
    stats: {
        moviesWatched: number
        seriesWatched: number
        reviewsCount: number
        listsCount: number
    }
    reviewedMovies: ReviewedMedia[]
    reviewedSeries: ReviewedMedia[]
}