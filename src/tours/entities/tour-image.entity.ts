import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tour } from './tour.entity';

@Entity('tour_images')
export class TourImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tourId: number;

  @ManyToOne(() => Tour, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tourId' })
  tour?: Tour;

  @Column()
  file: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
