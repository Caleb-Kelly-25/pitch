import { Request, Response } from "express-serve-static-core";
import UserProfileService from "../../application/UserProfileService";
import UserService from "../../application/UserService";
import IAuthAdapter from "../auth/IAuthAdapter";

export default class ProfileController {
    constructor(
        private readonly profileService: UserProfileService,
        private readonly userService: UserService,
        private readonly authAdapter: IAuthAdapter,
    ) {}

    async getLeaderboard(req: Request, res: Response): Promise<void> {
        const identity = this.authAdapter.verifyToken(req.headers.authorization ?? "");
        if (!identity) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const page  = Math.max(1, parseInt(req.query["page"]  as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query["limit"] as string) || 20));

        try {
            const result = await this.profileService.getLeaderboard(page, limit);
            res.status(200).json(result);
        } catch (err) {
            console.error("ProfileController.getLeaderboard error:", err);
            res.status(500).json({ error: "Failed to retrieve leaderboard" });
        }
    }

    async getProfile(req: Request, res: Response): Promise<void> {
        const identity = this.authAdapter.verifyToken(req.headers.authorization ?? "");
        if (!identity) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const userId = req.params["userId"] as string;

        const isOwnProfile = identity.userId === userId;

        try {
            const [profile, user] = await Promise.all([
                isOwnProfile
                    ? this.profileService.getOrCreate(userId)
                    : this.profileService.getProfile(userId),
                this.userService.findById(userId),
            ]);

            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            res.status(200).json({
                userId: profile.userId,
                username: user.username,
                gamesCompleted: profile.gamesCompleted,
                gamesWon:       profile.gamesWon,
                cardsPlayed:    profile.cardsPlayed,
                tricksPlayed:   profile.tricksPlayed,
                tricksWon:      profile.tricksWon,
                bidsPlayed:     profile.bidsPlayed,
                bidsWon:        profile.bidsWon,
            });
        } catch (err) {
            console.error("ProfileController.getProfile error:", err);
            res.status(500).json({ error: "Failed to retrieve profile" });
        }
    }
}
