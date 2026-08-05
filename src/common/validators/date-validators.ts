import { ParseDatePipe } from '@nestjs/common';
import { registerDecorator, ValidationOptions } from 'class-validator';

const parseDatePipe = new ParseDatePipe({ optional: true });

export function IsDateYMD(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateYMD',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value === undefined || value === null || value === '') {
            return true;
          }
          if (typeof value !== 'string') return false;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
          try {
            const date = parseDatePipe.transform(value);
            if (!date) return false;
            const [year, month, day] = value.split('-').map(Number);
            return (
              date.getFullYear() === year &&
              date.getMonth() === month - 1 &&
              date.getDate() === day
            );
          } catch {
            return false;
          }
        },
      },
    });
  };
}
