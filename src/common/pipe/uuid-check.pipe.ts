import {
  ArgumentMetadata,
  Injectable,
  ParseUUIDPipe,
  PipeTransform,
} from '@nestjs/common';
import { IsNotUUidException } from '../exception/custom-exception/is-not-uuid.exception';


@Injectable()
export class UUIDCheckPipe implements PipeTransform {
  private readonly uuidPipe = new ParseUUIDPipe();

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      return await this.uuidPipe.transform(value, metadata);
    } catch (error) {
      throw new IsNotUUidException();
    }
  }
}
