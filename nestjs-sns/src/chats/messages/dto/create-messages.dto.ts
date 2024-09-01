// import { BasePaginationDto } from '../../../common/dto/base-pagination.dto';
import { PickType } from '@nestjs/mapped-types';
import { MessagesModel } from '../entity/messages.entity';

export class CreateMessagesDto extends PickType(MessagesModel, ['message']) {}
