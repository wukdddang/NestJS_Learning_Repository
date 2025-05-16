import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class MovieTitleValidationPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      return value;
    }

    /// 만약에 글자 길이가 2보다 작거나 같으면 에러 던지기
    if (value.length <= 2) {
      throw new BadRequestException('영화 제목은 3자 이상 입력해주세요.');
    }
    return value;
  }
}
