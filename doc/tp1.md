# TP : Créer une API Rest avec NestJS

Ce TP couvre :
La création d'un controller pour la gestion des requêtes
Le routing pour la définition des routes
La création d'un service pour la logique métier
La création d'un module pour l'organisation du code
Les **DTO** : Data Transfer Object

**Prérequis** : Installer `NestJS CLI` :

```bash
npm install -g @nestjs/cli
```

Pour créer un projet Nest, exécutez la commande suivante dans votre répértoire de travail :

```bash
nest new tp-nestjs
```

Le mot clé `nest` est une commande appartenant à ̀Nest CLI`. Il met à disposition d'autre commande qui facilite la création d'une application Nest que nous verrons tout au long de ce TP.

`tp-nestjs` crée un dossier dans lequel sera installer le code départ. Pour l'installer dans le repertoir courant, remplacer ce nom par un point :

```bash
nest new .
```

## Création du Controller

Le rôle d'un controller dans NestJS est le même que dans Express, comme nous l'avons vu. Il gère les requêtes entrantes et retourne des réponses.

Contrairement à Express, Nest CLI nous met à disposition une commande nous permettant de créer un controller:

```bash
nest generate controller articles
```

ou

```bash
nest g co articles
```

`Pour voir la liste des racourci disponible exécutez la commande nest g --help`

Cette commande crée un dossier `articles` avec à l'interieur le fichier `articles.controller.ts` avec le contenu :

```ts
import { Controller } from "@nestjs/common";

@Controller("articles")
export class ArticlesController {}
```

`@Controller` est ce qu'on appelle un **décorateur**, ce sont des fonctions spéciales qui donnent des informations sur la class déclarée juste en dessous, ils sont reconnaisable au symbole `@`. C'est grâce à ce décorateur que Nest JS sait que la class `ArticlesController` est un controller et par conséquent, il la traitera comme telle.

Le décorateur `@Controller` prend en paramètre une chaine de caractère qui permet de définir l'**endpoint** de ce controller. En d'autre terme, nous venons de créer une route : `/arciles`. Ainsi, toutes les fonctions à l'intérieur de cette class seront exécuté lorsqu'une requête est envoyée vers ce endpoint.

### Création d'une fonction dans le controller

Créez dans ce controller, une fonction `getAllArticles` qui répondra à la requête `GET /articles` :

```ts
import { Controller } from "@nestjs/common";

@Controller("articles")
export class ArticlesController {
  private articles = [];

  getAllArticles() {
    return this.articles;
  }
}
```

Nous venons de creer une fonction qui apriori sert à retourner une liste d'article en répondant à la requête `GET /articles`. Sauf que dans son état actuel, il n'y a aucune indication sur la méthode HTTP auquel elle doit répondre. Comment dire à NestJS que cette fonction doit être éxécuter pour une requête `̀GET` et pas une autre ? C'est à au décorateur `@Get` :

```ts
export class ArticlesController {
  @Get()
  getAllArticles() {
    return this.articles;
  }
}
```

Il existe un décorateur pour chaque methode HTTP :

- @Post()
- @Put()
- @Patch()
- @Delete()

### Déclarer le controller

Avant, d'aller plus loin, il y a une chose importante à faire pour que l'on puisse tester ce controller et ses endpoints. Nous l'avons créé, mais l'application n'a pas conscience de son existance nous devons donc dire à NestJS qu'un controller `ArticleController` existe.

Pour déclarer le controller, il faut se rendre dans le fichier `app.module.ts` qui est le point d'entrer de l'application et ajouter le controller de la manière suivante :

```ts
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ArticlesController } from "./articles/articles.controller";

@Module({
  imports: [],
  controllers: [AppController, ArticlesController],
  providers: [AppService],
})
export class AppModule {}
```

La propiété controller permet de lister tous les controllers qui existent dans l'application, il nous suffit d'ajouter nos controller dans le tableau.

### Retourner un seul article

Pour retourner un seul article, nous devons créer une fonction `getArticle`, qui répondra à une requête `GET /articles/:id`

```ts
  @Get(':id')
  getArticle(@Param('id') id: number) {
    return this.articles.filter(article => article.id == id);
  }
```

Avec Express, pour récupéter un paramètre d'URL, nous utilisions `request.params`. NestJs met à notre disposition un nouveau décorateur `@Param` qui prend en paramètre le nom du paramètre qu'on souhaite récupérer et se paramètre est stocké dans une variable que nous avons appelé ̀id`

```ts
@Param("nomDuParametre") variable: typeDelaVariable
```

### Créer un article

Ajoutons maintenant une fonction `addArticle` qui répondra à la route `POST /artciles`. Cette fonction recevera des données en provenance d'un formulaire et pour les traiters nous devons accéder à l'objet `body` de la requête. Pour cela nous avons à notre disposition un décorateur qui se nomme `@Body` dont la syntaxe est :

```ts
@Body() variable: typeDelaVariable
```

Ce qui donne :

```ts
  @Post()
  addArticle(@Body() article: { title: string; content: string }) {
    this.articles.push(article);
    return { message: 'Article ajouté avec succès' };
  }
```

Concretement, le body doit contenir un objet qui respecte le modèle : `{ title: string; content: string }`. Si le navigateur envoi un objet avec des propriétés différentes ou les mêmes, mais dont les valeurs sont différentes, cela générera une erreur.

### Modifier un article et supprimer un article

A vous de jouer, créez deux fonctions :

- `editArticle` qui attend en paramètre l'id de l'aricle à modifier et les nouvelles données dans le body.
- `deleteArticle` qui attend en paramètre l'id de l'article à supprimer.

## Création d'un Service

Un service dans NestJS contient la logique métier, c’est-à-dire ce qu’il se passe une fois que les données sont reçues et avant qu’elles ne soient renvoyées à l’utilisateur. Il permet de séparer cette logique des contrôleurs, qui ne font que gérer les requêtes et les réponses.

Pour créer un service, la CLI NestJS met à notre disposition une commande :

```bash
nest generate service articles
```

ou

```bash
nest g s articles
```

Cette commande crée un fichier `articles.service.ts` dans le dossier `articles` avec un contenu similaire à :

```ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class ArticlesService {}
```

Le décorateur `@Injectable()`permet d’indiquer à NestJS que cette classe peut être injectée via l’injection de dépendances dans d’autres parties de l’application, par exemple un contrôleur.

### Création des différentes fonctions

Avec Express, nous avions vu l’architecture `Controller-Service-Repository`, et que le `repository` était chargé de gérer l’accès aux données. Dans NestJS, c’est le service qui s’occupe de cela. Il communique avec la base de données, mais son rôle principal reste la logique métier.

Dans ce TP, nous utilisons un simple tableau JavaScript en guise de base de données. Ajoutons au service les différentes fonctions :

```ts
@Injectable()
export class ArticlesService {
  private articles = [];

  getAllArticles() {
    return this.articles;
  }

  getArticle(id: number) {
    return this.articles.find((article) => article.id === id);
  }

  addArticle(article: { title: string; content: string }) {
    this.articles.push({ id: Date.now(), ...article });
    return { message: "Article ajouté avec succès" };
  }

  // Exemple de fonction de modification
  editArticle(id: number, updatedData: { title?: string; content?: string }) {
    const articleIndex = this.articles.findIndex((a) => a.id === id);
    if (articleIndex !== -1) {
      this.articles[articleIndex] = {
        ...this.articles[articleIndex],
        ...updatedData,
      };
      return { message: "Article modifié avec succès" };
    }
    return { message: "Article introuvable" };
  }

  // Exemple de fonction de suppression
  deleteArticle(id: number) {
    this.articles = this.articles.filter((a) => a.id !== id);
    return { message: "Article supprimé avec succès" };
  }
}
```

### Injection du service dans le contrôleur

Pour utiliser ce service dans le contrôleur, nous devons l’injecter via l’injection de dépendances. Ce principe permet d’utiliser une classe sans l’instancier avec le mot-clé `new`. Ainsi, le contrôleur peut employer le service comme s’il était local. Pour cela, il suffit de l’ajouter au constructeur de cette manière :

```ts
  constructor(private readonly articlesService: ArticlesService) {}
```

Le constructeur reçoit une instance de `ArticlesService` grâce à l’injection de dépendances et il n’y a rien de plus à faire. Désormais, le contrôleur peut utiliser le service directement :

```ts
this.articlesService.getAllArticles();
```

Mettons à jour le controller :

```ts
@Controller("articles")
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  getAllArticles() {
    return this.articlesService.getAllArticles();
  }

  @Get(":id")
  getArticle(@Param("id") id: number) {
    return this.articlesService.getArticle(id);
  }

  @Post()
  addArticle(@Body() article: { title: string; content: string }) {
    return this.articlesService.addArticle(article);
  }

  @Patch(":id")
  editArticle(
    @Param("id") id: number,
    @Body() updatedData: { title?: string; content?: string }
  ) {
    return this.articlesService.editArticle(id, updatedData);
  }

  @Delete(":id")
  deleteArticle(@Param("id") id: number) {
    return this.articlesService.deleteArticle(id);
  }
}
```

## Création d'un Module

Un module dans NestJS permet de regrouper les éléments qui ont un rôle commun (contrôleurs, services, etc.) afin d’organiser le code de manière structurée et maintenable.

Pour créer un module dédié aux articles, on peut utiliser la commande :

```ts
nest generate module articles
```

ou

```ts
nest g mo articles
```

Nest va générer un fichier `articles.module.ts` avec le contenu suivant :

```ts
@Module({})
export class ArticlesModule {}
```

Maintenant que nous avons créé le module, nous devons lui indiquer quels sont les contrôleurs et services qu’il gère. De la même manière que nous avons indiqué à `AppModule` l’existence du contrôleur `ArticlesController`.

On peut voir que le décorateur `@Module `prend en paramètre un objet qui nous permet de le configurer. Grâce à cet objet, nous allons pouvoir préciser quels sont les contrôleurs qu’il gère et quels sont les services qu’il fournit.

En ajoutant dans cet objet deux propriétés, `controllers` et `providers`, qui ont toutes les deux comme valeur un tableau, on obtient :

```ts
import { Module } from "@nestjs/common";
import { ArticlesController } from "./articles.controller";
import { ArticlesService } from "./articles.service";

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
```

### Ajout du module à l’application

Pour que NestJS prenne en compte ce nouveau module, il faut l’importer dans le module principal `app.module.ts`, dans la propriété `imports` :

```ts
@Module({
  imports: [ArticlesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

En créant le module avec Nest CLI, l’import est fait automatiquement.

Puisque nous importons le module `ArticlesModule`, qui gère le contrôleur `ArticlesController`, nous pouvons donc supprimer ce contrôleur du tableau controllers dans `AppModule`.

## Base de données avec Prisma

Maintenant, nous allons intégrer une base de données à notre application NestJS en utilisant Prisma. Prisma est un autre ORM (comme Sequelize) qui facilite la communication avec la base de données.

Pour installer Prisma (et son client), exécutez la commande :

```bash
npm install prisma @prisma/client
```

Ensuite, nous devons initialiser l’ORM :

```bash
npx prisma init
```

Cette commande crée un dossier `prisma/` contenant le fichier `schema.prisma` et (ou met à jour) un fichier `.env` à la racine du projet.  
Prisma ajoute dans le fichier `.env` une variable `DATABASE_URL`, avec comme valeur par défaut les informations de connexion à une base de données Postgres :

```dotenv
DATABASE_URL="postgres://myuser:mypassword@localhost:5432/median-db"
```

Le fichier `schema.prisma` contient le code suivant :

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

On y trouve 2 éléments principaux :

- **generator** : génère Prisma Client, un outil interne à l’ORM qui permet d’envoyer des requêtes à la base de données. C’est cet outil qui nous donne accès aux différentes méthodes pour faire les requêtes : `create`, `findUnique`, `findMany`, etc.
- **datasource** : spécifie le type de base de données que nous utilisons dans le projet et sa connexion via la variable d’environnement `DATABASE_URL`.

Modifiez les informations de connexion avec les vôtres.

### Création d'un modèle

Avec Prisma, tous les modèles doivent être créés dans le fichier `schema.prisma`. Ajoutez le code suivant :

```prisma
model Article {
  id      Int      @id @default(autoincrement())
  title   String
  content String
}
```

Comme pour Sequelilze, les types définit dans les modeles, définissent les types des champs dans le base de données.

La directive `@id` indique que `id` est la clé primaire de ce modèle. L’annotation `@default(autoincrement())` précise que chaque nouvelle ligne créée aura un id généré automatiquement par la base de données.

Pour que Prisma crée la table correspondante dans la base de données, nous devons exécuter une migration avec la commande :

```bash
npx prisma migrate dev --name "nom-de-la-migration"
```

Remplacez `"nom-de-la-migration"` par un nom représentant ce que fait la migration, par exemple `"add-article-model"` ou `"add-new-field-price"`.

Cela va créer un nouveau dossier `migrations` dans le dossier `prisma` dans lequel seront générés les fichiers SQL basés sur les modèles. Vous y trouverez un fichier `migration.sql` avec un contenu similaire à :

```sql
-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);
```

### Création d’un module Prisma

Pour que NestJS puisse utiliser Prisma, nous allons créer un module dédié `prisma.module.ts`. Vous pouvez le générer avec la CLI :

```bash
nest g mo prisma
```

Ensuite, créez un service `prisma.service.ts` :

```ts
import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

Ce service étend `PrismaClient` pour donner accès à toutes les méthodes générées (par exemple, `prisma.article.findMany()`, etc.).

`PrismaClient` est la classe principale générée par Prisma à partir de votre fichier `schema.prisma`. Elle contient toutes les méthodes nécessaires pour interagir avec votre base de données, comme `findMany()`, `create()`, `update()`, etc. Chaque modèle que vous définissez dans `schema.prisma` aura ainsi des méthodes dédiées. En étendant `PrismaClient` dans `PrismaService`, vous bénéficiez de ces méthodes.

#### Ajout du service dans le module

Dans le module `prisma.module.ts`, vous pouvez ensuite fournir ce service :

```ts
import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Le tableau `exports` permet aux autres modules de réutiliser `PrismaService` grâce à l’injection de dépendances.

### Importer le PrismaModule dans les modules qui l’utilisent

Pour pouvoir injecter et utiliser `PrismaService`, il est nécessaire d’importer`PrismaModule` dans chaque module qui en a besoin.

```ts
@Module({
  imports: [PrismaModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
```

### Utiliser Prisma dans le service Articles

Pour relier notre service `ArticlesService` à Prisma, on importe `PrismaService` dans `articles.service.ts` :

```ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async getAllArticles() {
    return this.prisma.article.findMany();
  }
}
```

Vous avez ici un exemple d’utilisation de Prisma pour effectuer une requête à la base de données. En utilisant vos connaissances sur l’ORM Sequelize, créez les fonctions restantes pour compléter le CRUD. Les fonctions mises à disposition par Prisma sont :

- `create`
- `findMany`
- `findUnique`
- `update`
- `delete`

### Ajouter un module `author

Pour la suite du TP, vous allez utiliser les connaissances acquises jusqu'à maintenant pour ajouter un module **Author**. Ce module devra inclure :

Comme pour le module `articles`, vous devrez :

1. Créer le module `author`.
2. Définir le modèle `Author` dans `schema.prisma`.
3. Exécuter une migration Prisma.
4. Créer un service `AuthorsService` pour gérer les opérations CRUD.
5. Créer un contrôleur `AuthorsController` pour exposer les routes API.

### Relation entre `Article` et `Author`

Lorsque vous avez plusieurs entités liées entre elles, Prisma permet d’établir des **relations** entre les modèles.

Ajoutez le modèle `Author` et mettez à jour `Article` pour inclure une relation :

```prisma
model Author {
  id       Int       @id @default(autoincrement())
  name     String
  email    String    @unique
  articles Article[] // Relation : un auteur a plusieurs articles
}

model Article {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  authorId  Int      // Clé étrangère
  author    Author   @relation(fields: [authorId], references: [id]) // Relation avec Author
}
```

### Explication :

- Un **Author** peut écrire plusieurs **Article** (`articles: Article[]`).
- Chaque **Article** a un `authorId`, qui fait référence à un `Author`.
- La ligne `@relation(fields: [authorId], references: [id])` indique que `authorId` est une clé étrangère pointant vers `id` dans `Author`.

Une fois ces modifications effectuées, exécutez une nouvelle migration :

```bash
npx prisma migrate dev --name "add-author-model"
```
