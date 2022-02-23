import { Controller, Delete, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { BookmarkService } from './bookmark.service';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor( private bookmarkService: BookmarkService ) {}

    @Post()
    createBookmark(@GetUser('id') userId: Number) {}

    @Get()
    getBookmarks(@GetUser('id') userId: Number) {}

    @Get('/:id')
    getBookmarkById(@GetUser('id') userId: Number) {}

    @Patch('/:id/edit')
    editBookmark(@GetUser('id') userId: Number) {}

    @Delete('/:id')
    deleteBookmark(@GetUser('id') userId: Number) {}
}
