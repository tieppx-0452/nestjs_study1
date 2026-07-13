import { User } from '../entities/user.entity';

export class ProfileDto {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;

  constructor(user: User, following = false) {
    this.username = user.username;
    this.bio = user.bio;
    this.image = user.image;
    this.following = following;
  }
}

export class ProfileResponseDto {
  profile: ProfileDto;

  constructor(user: User, following = false) {
    this.profile = new ProfileDto(user, following);
  }
}
