import { User } from '../entities/user.entity';
import { buildSelfUrl } from '../../common/utils/url.util';

export class ProfileDto {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;

  constructor(user: User, following = false, baseUrl?: string) {
    this.username = user.username;
    this.bio = user.bio;
    this.image = buildSelfUrl(user.image, baseUrl);
    this.following = following;
  }
}

export class ProfileResponseDto {
  profile: ProfileDto;

  constructor(user: User, following = false, baseUrl?: string) {
    this.profile = new ProfileDto(user, following, baseUrl);
  }
}
