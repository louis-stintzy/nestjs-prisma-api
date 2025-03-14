# TP : Créer une API Rest avec NestJS - Partie 2

## DTO : Data Transfer Object

Un DTO est une class qui est utilisée pour contrôler la forme des données qui transitent entre le client et le serveur. Cela facilite la validation des données et assure une meilleure maintenabilité du code.

### Modification du modèle Author en User

Afin d’avoir un exemple plus réaliste, nous allons changer le modèle Author en User et y ajouter de nouvelles propriétés. Modifiez le fichier `schema.prisma` :

```prisma
model User {
  id        Int      @id @default(autoincrement())
  firstName String
  lastName  String
  email     String   @unique
  role      String   @default("USER")
  isActive  Boolean  @default(true)
  articles  Article[]

  // Par exemple, on peut également ajouter des timestamps :
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Article {
  id        Int    @id @default(autoincrement())
  title     String
  content   String
  userId    Int
  user      User   @relation(fields: [userId], references: [id])
}
```

Puis lancez la commande :

```bash
npx prisma migrate dev --name "rename-author-to-user-and-add-properties"
```

### Création d'un DTO

Dans le module `users`, nous allons créer un dossier `dto` avec un fichier nommée `create-user.dto.ts`. Dans ce fichier, créez une class `CreateUserDto` :

```ts
import { IsString, IsBoolean, IsEmail, IsOptional } from "class-validator";

export class CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  isActive?: boolean;
}
```

Ce Dto décrit que pour créer un utilisateur, nous attendons les champs obligatoires : `firstName`, `lastName`, `email`, `password` , tous de type string. Les champs `role` et `isActive` sont facultatifs.

Une fois que le Dto est créé, nous pouvons l'utiliser dans le controller en typant la valeur du Body que la requête reçoit. Ainsi, on s'assure que le client a bien envoyé les données au format attendu.

```ts
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

#### Ajout de validations au Dto

Un DTO devient beaucoup plus puissant lorsqu’il est associé à des règles de validation. Dans
NestJS, cela se fait facilement avec les bibliothèques `class-validator` et `class-transformer`.

Pour utiliser les validations, vous devez installer les packages suivants :

```ts
npm install class-validator class-transformer
```

Ces bibliothèques permettent :
• `class-validator` : D’ajouter des règles de validation via des décorateurs.
• `class-transformer `: De transformer les données JSON en instances de classes DTO.

#### Règles de validation

Reprenons `CreateUserDto` et ajoutons des validations :

```ts
import {
  IsString,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsNotEmpty,
} from "class-validator";

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

Le package `class-validator`fournit un certain nombre de décorateurs permettant de contrôler la validité des champs : @IsString, @IsEmail, @IsNotEmpty, @MinLength(6), etc.

#### Activer la validation globale

Pour que ces validations fonctionnent dans toute votre application, vous devez activer un pipe de validation global. Ajoutez cette configuration dans le fichier `main.ts` :

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Active la validation globale
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

Avec cette configuration, toutes les données envoyées aux DTOs seront automatiquement
validées.

### Bonnes pratiques avec les DTO

- **Organisez vos DTOs** : Placez-les dans un dossier dto/ pour chaque module.
- **Définissez clairement les types** : Ne laissez aucun champ non typé dans vos DTOs.
- **Validez vos données** : Toujours utiliser `class-validator` pour garantir que les données sont conformes.
- **Utilisez des DTOs spécifiques** : Créez un DTO par action (création, mise à jour, etc.) pour mieux gérer les scénarios.

### Mise en pratique

Créez les Dto pour les modules users et articles.

1. Créez une class `UpdateUserDto` dans laquel tous les champs sont facultatifs pour permettre la modification partielle des données. Utilisez des décorateurs pour contrôler la validité des valeurs. Ensuite, utiliser ce Dto dans les fonctions approprié.

2. Créez les classes `CreateArticleDto` et `UpdateCreateDto` en suivant les mêmes consignes ci-dessus.

## Les Exceptions

Dans NestJS, la gestion des erreurs est conçue pour être à la fois claire et configurable. Lorsqu’un problème survient, qu’il s’agisse d’une ressource introuvable, d’une requête mal formée ou d’un souci interne au serveur, nous pouvons lever une exception afin de renvoyer à l’utilisateur un message d’erreur explicite.

### Les exceptions HTTP intégrées

NestJS fournit déjà un ensemble de classes d’exception standard, qui couvrent les cas les plus courants :

- `HttpException` : la classe de base, qui permet de renvoyer un code HTTP et un message personnalisé.
- `BadRequestException` : pour les données invalides ou manquantes.
- `NotFoundException` : pour une ressource introuvable.
- `ForbiddenException` : pour un accès refusé (403 Forbidden).
- `UnauthorizedException` : pour une authentification non valide (401 Unauthorized).
- `ConflictException` : pour un conflit de ressource (409 Conflict).
- `InternalServerErrorException` : pour les erreurs imprévues côté serveur (500 Internal Server Error).

### Exemple d'utilisation

Imaginons que, dans notre service `ArticlesService`, on veuille lever une exception quand l’article n’existe pas :

```ts
async findOne(id: number) {
  const article = await this.prismaService.article.findUnique({
    where: { id },
  });

  if(!article){
    throw new NotFoundException("L'article n'existe pas")
  }

  return article
}
```

Ici, si l’article n’est pas trouvé, la méthode lève automatiquement une `NotFoundException`. NestJS va donc renvoyer une réponse `HTTP 404` avec un corps JSON de ce style :

```ts
{
    "message": "L'article n'existe pas",
    "error": "Not Found",
    "statusCode": 404
}
```

### Créer une exception personnalisée

Les classes d’exception intégrées couvrent la plupart des scénarios courants. Cependant, il peut être utile de standardiser le format des erreurs dans votre application, par exemple pour structurer toutes les erreurs sous un même format JSON.

Dans ce cas, nous pouvons créer une exception personnalisée en étendant `HttpException` :

```ts
import { HttpException } from "@nestjs/common";

export class CustomException extends HttpException {
  constructor(message: string, statusCode) {
    super(message, statusCode);
  }
}
```

On peut ensuite l'utiliser dans la logique métier :

```ts
throw new CustomException("Article n'existe pas", HttpStatus.NOT_FOUND);
```

NestJS, dispose egalement d'un objet HttpStatus donnant accès à tous les codes status :

- HttpStatus.NOT_FOUND
- HttpStatus.OK
- HttpStatus.NO_CONTENT
- etc...

### Où créer les exceptions personnalisées dans NestJS ?

Dans une application bien structurée, les exceptions personnalisées doivent être placées dans un dossier dédié, généralement sous src/common/exceptions/. Cela permet de centraliser la gestion des erreurs et de les réutiliser facilement dans différents services et contrôleurs.

Le dossier `common/` contient des utilitaires qui ne sont pas propres à un module spécifique, mais qui sont utilisés par plusieurs parties de l’application.

```bash
src/
│── articles/
│── users/
│── common/
│   ├── exceptions/
│   │   ├── not-found.exception.ts
│   │   ├── bad-request.exception.ts
│   │   ├── conflict.exception.ts
│   ├── filters/
│   ├── pipes/
│   ├── interceptors/
│── prisma/
│── main.ts
│── app.module.ts
```

### À vous de jouer !

Mettez en pratique ce que vous venez d’apprendre en créant votre propre exception personnalisée. L’objectif est de formater toutes les erreurs de votre application sous le format suivant :

```json
{
  "status": "error",
  "errors": {
    "status": 400,
    "message": "msg d'erreur"
  }
}
```

Complétez les services avec une gestion des erreurs adéquate. Une fois terminée, essayez de lever cette exception dans une requête pour voir le résultat.

## Documenter l'API : Swagger

Swagger est un outil qui permet de documenter, tester et explorer une API REST directement depuis un navigateur. Il fournit une interface interactive où l'on peut voir les différentes routes disponibles, les types de données attendus et renvoyés, ainsi que tester les requêtes sans avoir besoin d’un outil externe comme Postman.

NestJS intègre Swagger grâce au package @nestjs/swagger, qui génère automatiquement la documentation à partir des décorateurs présents dans notre code, c'est-à-dire qu'il analyse le code est génére automatiquement la documentation qui est ensuite accèssible via une URL `mondomaine.fr/api/docs` par exemple.

L'utilisation de Swagger offre plusieurs avantages :

- `Documentation automatique` : les routes sont décrites avec leurs paramètres et réponses.
- `Test interactif` : possibilité d’exécuter des requêtes directement depuis l’interface.
- `Standardisation` : facilite l’intégration avec d’autres services en fournissant une description complète de l’API.
- `Gain de temps` : pas besoin d’écrire la documentation à la main, elle est générée dynamiquement.

## Installation de Swagger

Pour ajouter Swagger à notre projet NestJS, nous devons installer le package `@nestjs/swagger` ainsi que la bibliothèque `swagger-ui-express`, qui permet d'afficher la documentation sous forme d'interface web.

```bash
npm install @nestjs/swagger swagger-ui-express
```

Une fois installé, nous devons configurer Swagger dans le fichier `main.ts` :

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle("API de gestion des articles")
    .setDescription(
      "Cette API permet de gérer les articles et les utilisateurs."
    )
    .setVersion("1.0")
    .addTag("articles")
    .addTag("users")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(3000);
}
bootstrap();
```

- `DocumentBuilder()` : permet de construire la documentation Swagger.
- `setTitle('Titre')` : définit le titre de la documentation.
- `setDescription('Description de l’API')` : donne un aperçu de l'API.
- `setVersion('1.0') `: indique la version de l’API.
- `addTag('Nom du groupe')` : permet d’organiser les routes par catégorie.
- `SwaggerModule.createDocument(app, config) `: génère la documentation en fonction des routes définies dans l’application.
- `SwaggerModule.setup('api', app, document) `: définit l’URL `/api/docs` comme point d’accès à la documentation.

Pour accèder à la documentation, rendez-vous sur l'url : `http://localhost:3000/api`

### Enrichir la documentation

A ce stade, la documentation contient uniquement la liste des routes, mais sans explications sur leurs caractéristiques et leurs rôles. Grâce à Swagger, nous pouvons donner plus de précision sur chacune des routes en fournissant des informations complémentaires comme le type de réponse retourné, les codes status gérés, les types de données attendus en entrées etc. Pour cela, nous allons utiliser des décorateurs fournit par Swagger.

Pour cela rendez-vous dans ArticleController et modifions le code :

#### findAll

```ts
@Get()
@ApiOperation({summary: "Récupère la liste de tous les articles"})
@ApiResponse({
    status: 200,
    description: "Liste des articles récupérée avec succès"
})
@ApiResponse({
    status: 404,
    description: "Articles non trouvé"
})
async findAll() {
    return await this.articlesService.findAll();
}
```

Dans cete exemple, nous utilisons deux décorateurs :

- `@ApiOperation` permet de donner une description de ce que fait le endpoint
- `ApiResponse` permet de donner des informations sur les différents codes d'état géré par le endpoint et quand ils sont retournés.

On peut donc documenter comme cela notre API, il existe toute une liste de décorateur que vous pouvez consulter dans la documentation : https://docs.nestjs.com/openapi/introduction

#### create

Pour une route `POST`, nous pouvons également documenter le `Body` d'une requête avec le décorateur `@ApiBody` en lui donnant une description et un exemple de donnée à envoyer dans la requête :

```ts
@Post()
@ApiOperation({})
@ApiBody({
    description: "Données nécessaires pour créer un articles",
    schema: {
        example: {
            title: "Apprendre NestJS par la pratique",
            description: "NestJS est framework basé sur Express"
        }
    }
})
@ApiResponse({})
async create(@Body() data: Article) {
    return await this.articlesService.create(data);
}
```

#### findOne

Pour documenter les paramètres d'une URL, on utilise `@ApiParam` en indiquant le nom du paramètre, s'il est obligatoire ou non et une description :

```ts
@Get(':id')
@ApiOperation({})
@ApiParam({
    name: "id",
    required: true,
    description: "ID de l'article"
})
@ApiResponse({})
async findOne(@Param('id') id: string) {
    return await this.articlesService.findOne(+id);
}
```

### Documenter les DTO

En plus de documenter les routes, Swagger permet également de documenter les DTO avec le décorateur `@ApiProperty` :

```ts
@ApiProperty({
    type: "string",
    required: true,
    example: "John",
    description: "Prénom de l'utilisateur"
})
@IsString()
firstName: string;
```

### Mise en pratique

Prenez en main la documentation Swagger en documentant l'ensemble des routes et dto restant. Aidez-vous de la documentation si necessaire : https://docs.nestjs.com/openapi/introduction
