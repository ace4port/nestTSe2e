import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './bookmark.controller';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({ data: { userId, ...dto } });
    return bookmark;
  }

  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({ where: { userId } });
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return(this.getById(bookmarkId));
    // return this.prisma.bookmark.findFirst({ where: { id: bookmarkId, userId } });
  }

 

  async editBookmark(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
    const bookmark = await this.prisma.bookmark.findUnique({ where: { id: bookmarkId } });

    if (!bookmark) {
      throw new ForbiddenException('Bookmark not found');
    }
    if (bookmark.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.bookmark.update({ where: { id: bookmarkId }, data: { ...dto } });
  }

  async deleteBookmark(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({ where: { id: bookmarkId } });

    this.checkError(bookmark, userId);

    await this.prisma.bookmark.delete({ where: { id: bookmarkId } })
    return
  }

  checkError(bookmark: any, userId: number) {
    if (!bookmark) {
      throw new ForbiddenException('Bookmark not found');
    }
    if (bookmark.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
  }

  async getById(id: number) {
    return this.prisma.bookmark.findFirst({ where: { id } });
  }
}
