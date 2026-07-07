import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  messages: string[];
  timestamp: number;
  data: T;
}

interface ControllerResponse<T> {
  code?: number;
  messages?: string[];
  data: T;
}

function isControllerResponse<T>(
  result: unknown,
): result is ControllerResponse<T> {
  return (
    typeof result === 'object' &&
    result !== null &&
    !Array.isArray(result) &&
    'data' in result
  );
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((result) => {
        const wrapped = isControllerResponse<T>(result) ? result : null;

        return {
          code: wrapped?.code ?? context.switchToHttp().getResponse().statusCode,
          messages: wrapped?.messages ?? [],
          timestamp: Date.now(),
          data: wrapped ? wrapped.data : (result as T),
        };
      }),
    );
  }
}
