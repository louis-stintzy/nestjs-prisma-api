import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: 'string',
    required: true,
    description: "Prénom de l'utilisateur",
    example: 'Maurice',
  })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: 'string',
    required: true,
    description: "Nom de l'utilisateur",
    example: 'Dupont',
  })
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: 'string',
    required: true,
    description: "Adresse email de l'utilisateur",
    example: 'maurice@mail.com',
  })
  email: string;

  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty({
  //   type: 'string',
  //   required: true,
  //   description: "Mot de passe de l'utilisateur",
  //   example: '12345',
  // })
  // password: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: 'string',
    required: false,
    description: "Rôle de l'utilisateur",
    example: 'admin', // 'user' | 'admin'
  })
  role?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    type: 'boolean',
    required: false,
    description: "Statut de l'utilisateur",
    example: true,
  })
  isActive?: boolean;
}
