import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface AvatarMetadata {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  password: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'json', nullable: true })
  avatarMetadata: AvatarMetadata | null;
}
