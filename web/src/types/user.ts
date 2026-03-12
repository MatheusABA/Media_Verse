import { ReviewedMedia } from "./review";

export type userData = {
    username: string;
    email: string;
    bio: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    location: string | null;
    createdAt: string;
}

export type ProfileData = {
    user: {
        id: string
        username: string
        name: string | null
        email: string
        bio: string | null
        avatarUrl: string | null
        bannerUrl: string | null
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