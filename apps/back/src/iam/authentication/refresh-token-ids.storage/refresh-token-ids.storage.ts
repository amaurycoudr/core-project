import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RefreshTokenIdsStorage {
    constructor(private readonly redisService: RedisService) {}

    insert = async (userId: number, tokenId: string) => {
        await this.redisService.set(this.getKey(userId), tokenId);
    };

    isTokenIdValid = async (userId: number, tokenId: string) => {
        const key = this.getKey(userId);

        const storedTokenId = await this.redisService.get(key);
        return storedTokenId === tokenId;
    };

    delete = async (userId: number) => {
        await this.redisService.del(this.getKey(userId));
    };

    private getKey = (userId: number) => `user-${userId}`;
}
