import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { CustomException } from 'src/Common/exceptions/custom.exception';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: "Création d'un utilisateur",
    description: 'Crée un nouvel utilisateur',
  })
  @ApiCreatedResponse({
    type: UserEntity,
  })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Utilisateur créé avec succès',
  // })
  @ApiResponse({
    status: 400,
    description: 'Requête invalide',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur',
  })
  @ApiBody({
    type: CreateUserDto,
    description: "Données de l'utilisateur à créer",
    schema: {
      example: {
        name: 'Bernard',
        email: 'bernard@mail.com',
        password: '12345',
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Liste des utilisateurs',
    description: 'Récupère la liste des utilisateurs',
  })
  @ApiOkResponse({
    type: UserEntity,
    isArray: true,
  })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Liste des utilisateurs récupérée avec succès',
  // })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Récupère un utilisateur par ID',
    description: 'Récupère un utilisateur par son ID',
  })
  @ApiOkResponse({ type: UserEntity })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Utilisateur récupéré avec succès',
  // })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: 418,
    description: "I'm a tea pot",
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur',
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'utilisateur à récupérer",
    required: true,
    type: 'number',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      //   throw new CustomException("I'm a tea pot", 418); // commenté : teste la custom exception
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: UserEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
