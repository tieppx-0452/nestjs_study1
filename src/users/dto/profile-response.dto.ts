import { User } from '../entities/user.entity';

export class ProfileDto {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  bio: string | null;
  following: boolean;

  constructor(user: User, following = false) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name ?? null;
    this.avatar = user.avatar ?? null;
    this.role = user.role;
    this.bio = user.bio ?? null;
    this.following = following;
  }
}

export class ProfileResponseDto {
  profile: ProfileDto;

  constructor(user: User, following = false) {
    this.profile = new ProfileDto(user, following);
  }
}
