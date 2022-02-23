import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { editUserDto } from 'src/user/user.service';
import { CreateBookmarkDto } from 'src/bookmark/bookmark.controller';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
    await app.listen(3030);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3030');
  });

  afterAll(() => app.close());

  describe('Auth', () => {
    const dto: AuthDto = { email: 'user@ex.com', password: '123456' };
    describe('Signup', () => {
      it('Throw Error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('Throw Error if pw empty', () => {
        return pactum.spec().post('/auth/signup').withBody({ email: dto.email }).expectStatus(400);
      });
      it('Throw Error if email, pw empty', () => {
        return pactum.spec().post('/auth/signup').withBody({}).expectStatus(400);
      });
      it('Should create account', () => {
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);
      });
    });

    describe('SignIn', () => {
      it('Throw Error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('Throw Error if pw empty', () => {
        return pactum.spec().post('/auth/signin').withBody({ email: dto.email }).expectStatus(400);
      });
      it('Throw Error if email, pw empty', () => {
        return pactum.spec().post('/auth/signin').withBody({}).expectStatus(400);
      });
      it('Should log in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('GetMe', () => {
      it('Should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      it('Should edit current user', () => {
        const dto: editUserDto = { email: 'uuser@example.com', name: 'User' };
        return pactum
          .spec()
          .patch('/users')
          .withBody(dto)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectBodyContains(dto.name)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('Should get no bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectBodyContains('[]');
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = { title: 'First bookmark', link: 'https://example.com' };
      it('Shlould create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withBody(dto)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('Should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('Should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark', () => {
      it('Should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/$S{bookmarkId}')
          .withBody({ title: 'New title', description: 'acascascascascacasca' })
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectBodyContains('New title');
      });
    });

    describe('Delete bookmark', () => {
      it('Should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(204);
      });

      it('Should get emptyy bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .inspect()
          .expectJsonLength(0);      
        });
    });
  });
});
