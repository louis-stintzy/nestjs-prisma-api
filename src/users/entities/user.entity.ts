import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({
    example: 1,
    description: "Identifiant unique de l'utilisateur",
  })
  id: number;

  @ApiProperty({
    example: 'Maurice',
    description: "Prénom de l'utilisateur",
  })
  firstName: string;

  @ApiProperty({
    example: 'Dupont',
    description: "Nom de l'utilisateur",
  })
  lastName: string;

  @ApiProperty({
    example: 'maurice@mail.com',
    description: "Adresse email de l'utilisateur",
  })
  email: string;

  @ApiProperty({
    example: 'USER',
    description: "Rôle de l'utilisateur",
  })
  role: string;

  @ApiProperty({
    example: true,
    description: "Statut de l'utilisateur",
  })
  isActive: boolean;

  @ApiProperty({
    example: [],
    description: "Liste des articles de l'utilisateur",
  })
  articles: any[]; // todo: replace any by Article[]

  @ApiProperty({
    example: new Date(),
    description: "Date de création de l'utilisateur",
  })
  createdAt: Date;

  @ApiProperty({
    example: new Date(),
    description: "Date de mise à jour de l'utilisateur",
  })
  updatedAt: Date;
}
