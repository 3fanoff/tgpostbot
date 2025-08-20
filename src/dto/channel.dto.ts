import { PartialType } from '@nestjs/mapped-types';

export class ChannelDto {
    id: number;
    username: string | null;
    title: string;
    type: string;
    memberCount: number;
}

export class UpdateChannelDto extends PartialType(ChannelDto) {}
